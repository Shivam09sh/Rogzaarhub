import { useState, useEffect } from "react";
import { WorkerSidebar } from "@/components/WorkerSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/JobCard";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { workerAPI } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [payType, setPayType] = useState<string>("all");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'open' };
      if (searchQuery) {
        params.location = searchQuery; // Simple search by location for now
      }

      const response = await workerAPI.browseJobs(params) as any;
      if (response.success) {
        setJobs(response.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await workerAPI.getApplications() as any;
      if (response.success) {
        const appliedJobIds = new Set<string>(
          response.applications.map((app: any) => app.jobId._id || app.jobId)
        );
        setAppliedJobs(appliedJobIds);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [searchQuery]); // Re-fetch when search query changes (debounce ideally)

  const handleApply = async (jobId: string) => {
    try {
      await workerAPI.applyToJob(jobId, {});
      setAppliedJobs(prev => new Set(prev).add(jobId));
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      console.error("Error applying to job:", error);
      toast.error(error.message || "Failed to submit application");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesPayType = payType === "all" || job.payType === payType;
    return matchesPayType;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container mx-auto p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Jobs</h1>
            <p className="text-muted-foreground">
              Find your next opportunity
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={payType} onValueChange={setPayType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pay Types</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredJobs.length} jobs found
              </p>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={handleApply}
                  isApplied={appliedJobs.has(job._id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
