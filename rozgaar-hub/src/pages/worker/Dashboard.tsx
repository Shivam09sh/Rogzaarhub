import { WorkerSidebar } from "@/components/WorkerSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuthStore } from "@/store/authStore";
import { WorkerProfile } from "@/types";
import { StatCard } from "@/components/StatCard";
import { StreakBadge } from "@/components/StreakBadge";
import { LevelBadge } from "@/components/LevelBadge";
import { WorkerCalendar } from "@/components/WorkerCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IndianRupee,
  Briefcase,
  Calendar as CalendarIcon,
  Search,
  Users,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { mockPayments, mockCalendarEvents } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const workerProfile = user as WorkerProfile;

  // Show loading state if user data is not yet loaded
  if (!user || !workerProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingPayments = mockPayments.filter((p) => p.status === "pending");
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container mx-auto p-4 md:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {workerProfile.name}! 👋</h2>
            <p className="text-muted-foreground">Here's your work overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Earnings"
              value={`₹${workerProfile.totalEarnings?.toLocaleString() || '0'}`}
              icon={IndianRupee}
              gradient="gradient-success"
              trend="+12% from last month"
            />
            <StatCard
              title="Active Jobs"
              value="3"
              icon={Briefcase}
              gradient="gradient-saffron"
            />
            <StatCard
              title="Completed Jobs"
              value={workerProfile.completedJobs || 0}
              icon={CalendarIcon}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/worker/jobs")}
            >
              <Search className="h-6 w-6" />
              <span>Find Jobs</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/worker/team")}
            >
              <Users className="h-6 w-6" />
              <span>My Team</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/worker/wallet")}
            >
              <Wallet className="h-6 w-6" />
              <span>Wallet</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/worker/messages")}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Messages</span>
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkerCalendar events={mockCalendarEvents} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Payments */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-primary">
                      ₹{totalPending.toLocaleString()}
                    </div>
                    <div className="space-y-2">
                      {pendingPayments.map((payment) => (
                        <div key={payment.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Job #{payment.jobId}</span>
                          <span className="font-medium">₹{payment.amount}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Tasks */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">Construction Work</p>
                        <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">Submit Invoice</p>
                        <p className="text-sm text-muted-foreground">Before 8:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
