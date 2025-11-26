import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Plus, Trash2, UserPlus, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  number: string;
}

export const EmergencyContactManager = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem("emergency_contacts");
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  useEffect(() => {
    localStorage.setItem("emergency_contacts", JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = () => {
    if (!newName || !newNumber) return;
    const contact = { id: Date.now().toString(), name: newName, number: newNumber };
    setContacts([...contacts, contact]);
    setNewName("");
    setNewNumber("");
    setIsAdding(false);
    toast.success("Contact added successfully");
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success("Contact removed");
  };

  const importFromDevice = async () => {
    try {
      // @ts-ignore - navigator.contacts is experimental
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        // @ts-ignore
        const contacts = await navigator.contacts.select(props, opts);
        if (contacts.length) {
          const contact = contacts[0];
          setNewName(contact.name[0]);
          setNewNumber(contact.tel[0]);
          setIsAdding(true);
        }
      } else {
        toast.error("Contact import not supported on this device");
      }
    } catch (ex) {
      console.error(ex);
      toast.error("Failed to import contact");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-red-500" />
          {t("help.emergencyContacts", "Emergency Contacts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Helpline */}
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-100 dark:border-red-900">
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">RozgaarHub Helpline</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">9797653832</span>
            <Button variant="destructive" size="sm" onClick={() => window.open('tel:9797653832')}>
              Call Now
            </Button>
          </div>
        </div>

        {/* Personal Contacts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">Your Emergency Contacts</h4>
            {!isAdding && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={importFromDevice} title="Import from Device">
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {isAdding && (
            <div className="p-3 border rounded-md space-y-3 bg-muted/50">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Contact Name" />
              </div>
              <div className="space-y-1">
                <Label>Number</Label>
                <Input value={newNumber} onChange={e => setNewNumber(e.target.value)} placeholder="Phone Number" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddContact} className="flex-1">
                  <Save className="h-4 w-4 mr-2" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {contacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.number}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-green-600" onClick={() => window.open(`tel:${contact.number}`)}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && !isAdding && (
              <p className="text-center text-sm text-muted-foreground py-4">No contacts added yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
