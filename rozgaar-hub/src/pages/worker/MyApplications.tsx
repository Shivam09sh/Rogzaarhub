import { useState, useEffect } from "react";
import { WorkerSidebar } from "@/components/WorkerSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, IndianRupee, Building } from "lucide-react";
import { workerAPI } from "@/lib/api";
import { toast } from "sonner";
import { blockchainService, EscrowStatus } from "@/lib/blockchain";
import { ShieldCheck, CheckCircle, Loader2 } from "lucide-react";

export default function MyApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [escrows, setEscrows] = useState<Record<string, any>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);


    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await workerAPI.getApplications() as any;
                if (response.success) {
                    setApplications(response.applications);

                    // Fetch escrow details for accepted applications
                    const acceptedApps = response.applications.filter((app: any) => app.status === 'accepted');
                    acceptedApps.forEach((app: any) => {
                        if (app.jobId?._id) {
                            fetchEscrow(app.jobId._id);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching applications:", error);
                toast.error("Failed to load applications");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const fetchEscrow = async (jobId: string) => {
        try {
            const details = await blockchainService.getEscrowDetails(jobId);
            if (details) {
                setEscrows(prev => ({ ...prev, [jobId]: details }));
            }
        } catch (error) {
            console.error(`Error fetching escrow for job ${jobId}:`, error);
        }
    };

    const handleConfirmCompletion = async (jobId: string, escrowId: number) => {
        try {
            setActionLoading(jobId);
            const success = await blockchainService.confirmCompletion(escrowId);
            if (success) {
                fetchEscrow(jobId);
            }
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "default"; // Greenish usually
            case "rejected":
                return "destructive";
            case "pending":
                return "secondary";
            default:
                return "outline";
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <WorkerSidebar />

            <main className="flex-1 md:ml-64 pb-20 md:pb-0">
                <div className="container mx-auto p-4 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Applications</h1>
                        <p className="text-muted-foreground">
                            Track the status of your job applications
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {loading ? (
                            <div className="text-center py-8">Loading applications...</div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-muted/20">
                                <p className="text-lg text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                                <Button className="gradient-hero text-white" onClick={() => window.location.href = '/worker/jobs'}>
                                    Browse Jobs
                                </Button>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <Card key={app._id} className="shadow-card hover:shadow-elevated transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl mb-2">{app.jobId?.title || "Job Title Unavailable"}</CardTitle>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Building className="h-4 w-4" />
                                                        {app.jobId?.employerName || "Employer"}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {app.jobId?.location || "Location"}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        Applied on {new Date(app.appliedDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusColor(app.status) as any}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-3 mt-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <IndianRupee className="h-4 w-4" />
                                                    {app.jobId?.payAmount}/{app.jobId?.payType}
                                                </div>
                                                {app.status === 'accepted' && (
                                                    <Button size="sm" variant="outline">View Details</Button>
                                                )}
                                            </div>

                                            {/* Escrow Status for Accepted Jobs */}
                                            {app.status === 'accepted' && escrows[app.jobId?._id] && (
                                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                                            <ShieldCheck className="h-4 w-4" />
                                                            Blockchain Escrow
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {EscrowStatus[escrows[app.jobId._id].status]}
                                                        </Badge>
                                                    </div>

                                                    {escrows[app.jobId._id].status === EscrowStatus.Funded && !escrows[app.jobId._id].workerConfirmed && (
                                                        <Button
                                                            size="sm"
                                                            className="w-full gradient-success text-white mt-2"
                                                            onClick={() => handleConfirmCompletion(app.jobId._id, escrows[app.jobId._id].escrowId)}
                                                            disabled={actionLoading === app.jobId._id}
                                                        >
                                                            {actionLoading === app.jobId._id ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                    Confirming...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="mr-2 h-3 w-3" />
                                                                    Confirm Work Completion
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}

                                                    {escrows[app.jobId._id].workerConfirmed && escrows[app.jobId._id].status !== EscrowStatus.Released && (
                                                        <div className="text-xs text-center text-muted-foreground mt-1">
                                                            Waiting for employer approval
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
}
