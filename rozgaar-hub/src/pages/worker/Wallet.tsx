import { WorkerSidebar } from "@/components/WorkerSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, TrendingUp, Download, IndianRupee, CheckCircle, Clock } from "lucide-react";

const transactions = [
  {
    id: "1",
    type: "credit",
    amount: 1500,
    description: "Construction Project - Day 3",
    date: "2025-01-20",
    status: "completed",
  },
  {
    id: "2",
    type: "credit",
    amount: 1500,
    description: "Construction Project - Day 2",
    date: "2025-01-19",
    status: "completed",
  },
  {
    id: "3",
    type: "pending",
    amount: 2000,
    description: "Plumbing Work - Andheri",
    date: "2025-01-22",
    status: "pending",
  },
];

export default function Wallet() {
  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Wallet</h1>
            <p className="text-muted-foreground">
              Track your earnings and payments
            </p>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 shadow-elevated gradient-hero text-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="h-5 w-5" />
                <span className="text-white/80">Total Balance</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <IndianRupee className="h-8 w-8" />
                <span className="text-5xl font-bold">45,250</span>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
                <Button variant="secondary" className="flex-1">
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">This Month</p>
                    <p className="text-2xl font-bold">₹12,500</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-bold">₹2,000</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-2xl font-bold">45 Jobs</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-card transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                          +₹{transaction.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={transaction.status === "completed" ? "default" : "secondary"}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
