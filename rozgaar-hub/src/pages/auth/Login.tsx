import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, loading: authLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      const user = useAuthStore.getState().user;

      toast.success("Logged in successfully!");

      // Redirect based on role
      if (user?.role === 'worker') {
        navigate("/worker/dashboard");
      } else if (user?.role === 'employer') {
        navigate("/employer/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <img src="/rozgaar-logo.jpg" alt="RozgaarHub Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold">
                <span className="text-primary">Rozgaar</span>
                <span className="text-secondary">Hub</span>
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl">{t("auth.login")}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full gradient-saffron text-white" disabled={authLoading}>
              {authLoading ? t("common.loading") : t("auth.login")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => navigate("/auth/signup")}>
                {t("auth.signup")}
              </Button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
