import { EmployerSidebar } from "@/components/EmployerSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const skillOptions = ["Construction", "Plumbing", "Electrical", "Painting", "Carpentry", "Cleaning"];

export default function PostJob() {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    payAmount: "",
    payType: "daily" as "hourly" | "daily" | "fixed",
    duration: "",
    startDate: "",
    teamRequired: false,
    teamSize: "",
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Job posted successfully!");
    navigate("/employer/projects");
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
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Construction Worker Needed"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Area"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
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

                <Button type="submit" className="w-full gradient-hero text-white" size="lg">
                  Post Job
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
