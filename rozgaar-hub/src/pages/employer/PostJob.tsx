import { EmployerSidebar } from "@/components/EmployerSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, Loader2, Check, ChevronsUpDown, Plus, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { employerAPI } from "@/lib/api";
import { getPreciseLocation, constructDetailedAddress, LocationResult } from "@/lib/geolocationUtils";
import { reverseGeocodeGoogle } from "@/lib/googleMaps";
import { cn } from "@/lib/utils";
import StateCitySelector from "@/components/StateCitySelector";

const skillOptions = ["Construction", "Plumbing", "Electrical", "Painting", "Carpentry", "Cleaning"];

const predefinedJobRoles = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Driver",
  "Construction Worker",
  "Cleaner",
  "Gardener",
  "Mechanic",
  "Cook",
  "Security Guard",
  "Mason",
  "Welder",
  "Tailor",
  "Beautician"
];

export default function PostJob() {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [customJobTitles, setCustomJobTitles] = useState<string[]>([]);
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [addingJobTitle, setAddingJobTitle] = useState(false);
  const [openJobCombobox, setOpenJobCombobox] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    payAmount: "",
    payType: "daily" as "hourly" | "daily" | "fixed",
    duration: "",
    startDate: "",
    teamRequired: false,
    teamSize: "",
    blockchainSecured: false,
  });

  const [loading, setLoading] = useState(false);

  // Fetch custom job titles on mount
  useEffect(() => {
    const fetchCustomJobTitles = async () => {
      try {
        const response = await employerAPI.getJobTitles() as any;
        if (response.success && response.jobTitles) {
          setCustomJobTitles(response.jobTitles.map((jt: any) => jt.title));
        }
      } catch (error) {
        console.error("Error fetching custom job titles:", error);
      }
    };

    fetchCustomJobTitles();
  }, []);

  // Combine predefined and custom job titles
  const allJobRoles = [...predefinedJobRoles, ...customJobTitles];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleLocationChange = (state: string, city: string) => {
    setSelectedState(state);
    setSelectedCity(city);
    if (state && city) {
      setFormData(prev => ({ ...prev, location: `${city}, ${state}` }));
    } else if (state) {
      setFormData(prev => ({ ...prev, location: state }));
    } else {
      setFormData(prev => ({ ...prev, location: "" }));
    }
  };

  const handleAddCustomJobTitle = async () => {
    if (!newJobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    try {
      setAddingJobTitle(true);
      const response = await employerAPI.createJobTitle(newJobTitle.trim()) as any;

      if (response.success) {
        toast.success("Custom job title added successfully!");
        setCustomJobTitles(prev => [...prev, newJobTitle.trim()]);
        setFormData(prev => ({ ...prev, title: newJobTitle.trim() }));
        setNewJobTitle("");
        setShowAddJobDialog(false);
      }
    } catch (error: any) {
      console.error("Error adding custom job title:", error);
      toast.error(error.message || "Failed to add custom job title");
    } finally {
      setAddingJobTitle(false);
    }
  };

  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualLocation = async () => {
    if (!manualLat || !manualLng) {
      toast.error("Please enter both latitude and longitude");
      return;
    }

    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Invalid coordinates");
      return;
    }

    setDetectingLocation(true);
    try {
      const addressData = await reverseGeocodeGoogle(lat, lng);

      // Adapt to LocationResult interface for consistency
      const locationResult: LocationResult = {
        ...addressData,
        latitude: lat,
        longitude: lng,
        source: 'gps-high-accuracy', // Treat as high accuracy for manual entry
        formattedAddress: addressData.formattedAddress
      };

      if (locationResult.state) {
        handleLocationChange(locationResult.state, locationResult.city || "");

        const detailedAddress = constructDetailedAddress(locationResult);
        if (detailedAddress) {
          setFormData(prev => ({ ...prev, address: detailedAddress }));
        }

        toast.success(`Location found: ${locationResult.city}, ${locationResult.state}`);
      } else {
        toast.error("Could not determine location details from these coordinates");
      }
    } catch (error: any) {
      console.error("Manual location error:", error);
      toast.error("Failed to fetch address. Check coordinates.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleLiveLocation = async () => {
    setDetectingLocation(true);
    toast.info("Detecting your location...");

    try {
      const location = await getPreciseLocation();

      if (location.state) {
        handleLocationChange(location.state, location.city || "");

        const detailedAddress = constructDetailedAddress(location);
        if (detailedAddress) {
          setFormData(prev => ({ ...prev, address: detailedAddress }));
        }

        if (location.source === 'ip-fallback') {
          toast.warning(`GPS unavailable (${location.error}). Using approximate location.`);
          toast.info("Please manually enter street details for better accuracy.");
        } else {
          toast.success(`Location detected: ${location.city}, ${location.state}`);
        }
      } else {
        toast.error("Could not determine location details");
      }
    } catch (error: any) {
      console.error("Location detection error:", error);
      toast.error(error.message || "Failed to detect location. Please select manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please select a job title");
      return;
    }

    if (selectedSkills.length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    if (!formData.location) {
      toast.error("Please select a location");
      return;
    }

    try {
      setLoading(true);
      const jobData = {
        ...formData,
        requiredSkills: selectedSkills,
        payAmount: Number(formData.payAmount),
        teamSize: formData.teamRequired ? Number(formData.teamSize) : 1,
        title: formData.blockchainSecured ? `${formData.title} (Blockchain Secured)` : formData.title
      };

      await employerAPI.createJob(jobData);
      toast.success("Job posted successfully!");
      navigate("/employer/projects");
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast.error(error.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />

      <main className="flex-1 md:ml-64">
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Post a New Job</h1>
            <p className="text-muted-foreground">
              Find the perfect worker or team for your project
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title with Searchable Combobox */}
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Popover open={openJobCombobox} onOpenChange={setOpenJobCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openJobCombobox}
                        className="w-full justify-between"
                      >
                        {formData.title || "Select job role..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search job role..." />
                        <CommandEmpty>No job role found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {allJobRoles.map((role) => (
                            <CommandItem
                              key={role}
                              value={role}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, title: currentValue });
                                setOpenJobCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.title === role ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {role}
                            </CommandItem>
                          ))}
                          <CommandItem
                            onSelect={() => {
                              setOpenJobCombobox(false);
                              setShowAddJobDialog(true);
                            }}
                            className="border-t bg-muted/50"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Job Title
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the work, requirements, and any special instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                {/* Location with StateCitySelector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Location</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLiveLocation}
                      disabled={detectingLocation}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Use Live Location
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-end -mt-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowManualInput(!showManualInput)}
                      className="text-xs text-blue-600 hover:underline flex items-center"
                    >
                      {showManualInput ? "Hide Manual Input" : "Search Location"}
                    </button>
                  </div>

                  {showManualInput && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 border rounded-md bg-gray-50">
                      <div className="col-span-2 text-xs text-gray-500 mb-1">
                        Enter coordinates manually if GPS fails.
                      </div>
                      <div>
                        <Label htmlFor="lat" className="text-xs">Latitude</Label>
                        <Input
                          id="lat"
                          placeholder="e.g. 12.9716"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng" className="text-xs">Longitude</Label>
                        <Input
                          id="lng"
                          placeholder="e.g. 77.5946"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleManualLocation}
                        disabled={detectingLocation}
                        variant="outline"
                        size="sm"
                        className="col-span-2 mt-1 h-8"
                      >
                        {detectingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : "Fetch Address"}
                      </Button>
                    </div>
                  )}

                  <StateCitySelector
                    onStateChange={(state) => handleLocationChange(state, selectedCity)}
                    onCityChange={(city) => handleLocationChange(selectedState, city)}
                    defaultState={selectedState}
                    defaultCity={selectedCity}
                    showAutocomplete={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Detailed Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address (will be auto-filled with live location)"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payType">Payment Type</Label>
                    <Select
                      value={formData.payType}
                      onValueChange={(value: "hourly" | "daily" | "fixed") =>
                        setFormData({ ...formData, payType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payAmount">Amount (₹)</Label>
                    <Input
                      id="payAmount"
                      type="number"
                      placeholder="500"
                      value={formData.payAmount}
                      onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 3 days"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Required Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} className="gradient-saffron text-white">
                          {skill}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => toggleSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <Label className="text-lg">Hiring Preference</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={!formData.teamRequired ? "default" : "outline"}
                      className="h-20"
                      onClick={() => setFormData({ ...formData, teamRequired: false })}
                    >
                      <div>
                        <div className="font-bold">Single Worker</div>
                        <div className="text-xs">Hire one worker</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.teamRequired ? "default" : "outline"}
                      className="h-20"
                      onClick={() => setFormData({ ...formData, teamRequired: true })}
                    >
                      <div>
                        <div className="font-bold">Team</div>
                        <div className="text-xs">Hire multiple workers</div>
                      </div>
                    </Button>
                  </div>
                  {formData.teamRequired && (
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        placeholder="Number of workers needed"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/30">
                  <Switch
                    id="blockchain-secure"
                    checked={formData.blockchainSecured}
                    onCheckedChange={(checked) => setFormData({ ...formData, blockchainSecured: checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="blockchain-secure" className="flex items-center gap-2 cursor-pointer">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Secure with Blockchain Escrow
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Payment will be held in a smart contract until work is completed and verified.
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-hero text-white" size="lg" disabled={loading}>
                  {loading ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Custom Job Title Dialog */}
      <Dialog open={showAddJobDialog} onOpenChange={setShowAddJobDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Job Title</DialogTitle>
            <DialogDescription>
              Enter a custom job title that's not in the list. It will be saved for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newJobTitle">Job Title</Label>
              <Input
                id="newJobTitle"
                placeholder="e.g., Tile Installer"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomJobTitle();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddJobDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomJobTitle} disabled={addingJobTitle}>
              {addingJobTitle ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Job Title"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
