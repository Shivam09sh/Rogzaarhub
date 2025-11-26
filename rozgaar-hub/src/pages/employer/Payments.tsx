import { EmployerSidebar } from "@/components/EmployerSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPayments } from "@/lib/mockData";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const handleMarkPaid = (paymentId: string) => {
    toast.success("Payment marked as paid");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      
      <main className="flex-1 md:ml-64">
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Payments</h1>
            <p className="text-muted-foreground">
              Track and manage payments to workers
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-accent">₹45,000</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">₹8,000</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-red-500">₹2,000</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-card transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">Job #{payment.jobId}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {payment.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{payment.amount.toLocaleString()}</p>
                        <Badge
                          variant={
                            payment.status === "paid"
                              ? "default"
                              : payment.status === "overdue"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      {payment.status === "pending" && (
                        <Button
                          size="sm"
                          className="gradient-hero text-white"
                          onClick={() => handleMarkPaid(payment.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
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
