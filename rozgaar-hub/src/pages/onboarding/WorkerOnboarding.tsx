import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, MapPin, Loader2 } from "lucide-react";
import StateCitySelector from "@/components/StateCitySelector";
import { getPreciseLocation, constructDetailedAddress, LocationResult } from "@/lib/geolocationUtils";
import { reverseGeocodeGoogle } from "@/lib/googleMaps";

const commonSkills = [
  "Construction",
  "Plumbing",
  "Electrical",
  "Painting",
  "Carpentry",
  "Cleaning",
  "Delivery",
  "Cooking",
  "Housekeeping",
  "Driving",
];

export default function WorkerOnboarding() {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    address: "",
    hourlyRate: "",
    dailyRate: "",
    bio: "",
  });

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

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill && !selectedSkills.includes(customSkill)) {
      setSelectedSkills([...selectedSkills, customSkill]);
      setCustomSkill("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile completed! Welcome to RozgaarHub!");
    navigate("/worker/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Worker Profile</CardTitle>
          <p className="text-muted-foreground">
            Help employers find you by completing your profile
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills Selection */}
            <div className="space-y-3">
              <Label>Your Skills</Label>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((skill) => (
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

              {/* Selected Skills */}
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

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                />
                <Button type="button" onClick={addCustomSkill} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Your Location</Label>
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
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="50"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  placeholder="400"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                placeholder="Tell employers about your experience..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full gradient-saffron text-white" size="lg">
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
