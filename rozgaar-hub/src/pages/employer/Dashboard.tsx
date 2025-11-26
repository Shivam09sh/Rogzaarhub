import { useNavigate } from "react-router-dom";
import { EmployerSidebar } from "@/components/EmployerSidebar";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  MessageSquare,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { mockJobs } from "@/lib/mockData";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const activeProjects = mockJobs.filter((j) => j.status === "open").length;
  const totalSpent = mockJobs.reduce((sum, j) => sum + j.payAmount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      
      <main className="flex-1 md:ml-64">
        <div className="container mx-auto p-4 md:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}! 👔</h2>
            <p className="text-muted-foreground">Manage your projects and find the best workers</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Projects"
              value={activeProjects}
              icon={Briefcase}
              gradient="gradient-saffron"
            />
            <StatCard
              title="Total Workers"
              value="24"
              icon={Users}
              gradient="gradient-hero"
            />
            <StatCard
              title="Total Spent"
              value={`₹${totalSpent.toLocaleString()}`}
              icon={IndianRupee}
            />
            <StatCard
              title="Avg Rating"
              value="4.8 ⭐"
              icon={TrendingUp}
              gradient="gradient-success"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/employer/post-job")}
            >
              <Plus className="h-6 w-6" />
              <span>Post Job</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/employer/workers")}
            >
              <Users className="h-6 w-6" />
              <span>Find Workers</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/employer/projects")}
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/employer/messages")}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Messages</span>
            </Button>
          </div>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockJobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{job.payAmount}/{job.payType}</p>
                      <p className="text-sm text-muted-foreground">{job.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
