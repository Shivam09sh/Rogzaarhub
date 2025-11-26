import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();

  const handleRoleSelect = (role: "worker" | "employer") => {
    setRole(role);
    navigate(`/onboarding/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Role</h1>
          <p className="text-xl text-muted-foreground">
            Select how you want to use RozgaarHub
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("worker")}
            className="cursor-pointer"
          >
            <Card className="shadow-elevated hover:shadow-card transition-all duration-300 h-full">
              <CardContent className="p-12 text-center">
                <div className="inline-flex p-6 rounded-full gradient-saffron mb-6">
                  <Users className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">I'm a Worker</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Find jobs, build your reputation, and earn money
                </p>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li>✓ Browse verified jobs</li>
                  <li>✓ Track your earnings</li>
                  <li>✓ Build your streak</li>
                  <li>✓ Form teams</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("employer")}
            className="cursor-pointer"
          >
            <Card className="shadow-elevated hover:shadow-card transition-all duration-300 h-full">
              <CardContent className="p-12 text-center">
                <div className="inline-flex p-6 rounded-full gradient-hero mb-6">
                  <Briefcase className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">I'm an Employer</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Hire skilled workers and manage projects efficiently
                </p>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li>✓ Post jobs instantly</li>
                  <li>✓ Find verified workers</li>
                  <li>✓ Track projects</li>
                  <li>✓ Manage payments</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
