import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EmployerSidebar } from "@/components/EmployerSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, CheckCircle } from "lucide-react";
import { StreakBadge } from "@/components/StreakBadge";
import { LevelBadge } from "@/components/LevelBadge";
import { employerAPI } from "@/lib/api";
import { toast } from "sonner";

export default function Workers() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWorkers = async (query = "") => {
    try {
      setLoading(true);
      const params: any = {};
      if (query) {
        // Simple search by skill or location for now
        // Ideally backend should support general search query
        params.skills = query;
      }

      const response = await employerAPI.searchWorkers(params) as any;
      if (response.success) {
        setWorkers(response.workers);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast.error("Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkers(searchQuery);
  };

  const handleViewProfile = (workerId: string) => {
    navigate(`/employer/worker/${workerId}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />

      <main className="flex-1 md:ml-64">
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Workers</h1>
            <p className="text-muted-foreground">
              Search and hire verified workers for your projects
            </p>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by skills..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">Search</Button>
          </form>

          {/* Workers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading workers...</div>
            ) : workers.length === 0 ? (
              <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                <p className="text-lg text-muted-foreground">No workers found matching your criteria</p>
              </div>
            ) : (
              workers.map((worker) => (
                <Card key={worker._id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center mb-4">
                      <Avatar className="h-20 w-20 mb-3">
                        <AvatarImage src={worker.profilePhoto} />
                        <AvatarFallback>{worker.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mb-1">{worker.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{worker.rating || 0}</span>
                        <span className="text-sm text-muted-foreground">
                          ({worker.completedJobs || 0} jobs)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        {worker.location || "Location not set"}
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 mb-4">
                      <StreakBadge streak={worker.streak || 0} />
                      <LevelBadge level={worker.level || "bronze"} />
                      {worker.verified && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {worker.skills && worker.skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">Daily Rate</p>
                      <p className="text-xl font-bold text-primary">₹{worker.dailyRate || 0}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        onClick={() => handleViewProfile(worker._id)}
                      >
                        View Profile
                      </Button>
                      <Button className="flex-1 gradient-hero text-white" size="sm">
                        Hire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
