import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  Shield,
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
  HeadphonesIcon
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: Clock,
      title: t("landing.features.instant.title"),
      description: t("landing.features.instant.description"),
    },
    {
      icon: Shield,
      title: t("landing.features.secure.title"),
      description: t("landing.features.secure.description"),
    },
    {
      icon: HeadphonesIcon,
      title: t("landing.features.support.title"),
      description: t("landing.features.support.description"),
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Workers" },
    { number: "10K+", label: "Employers" },
    { number: "1M+", label: "Jobs Completed" },
    { number: "4.8★", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/rozgaar-logo.jpg" alt="RozgaarHub Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold">
              <span className="text-primary">रोज़गार</span>
              <span className="text-secondary">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate("/auth/login")}>
              {t("auth.login")}
            </Button>
            <Button onClick={() => navigate("/auth/signup")} className="gradient-saffron text-white">
              {t("auth.signup")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl md:text-8xl font-bold mb-4">
              <span className="text-primary">रोज़गार</span>
              <span className="text-secondary">Hub</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t("landing.hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gradient-saffron text-white text-lg px-8 py-6 shadow-elevated"
                  onClick={() => navigate("/auth/signup?role=worker")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t("landing.hero.workerButton")}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gradient-hero text-white border-0 text-lg px-8 py-6 shadow-elevated"
                  onClick={() => navigate("/auth/signup?role=employer")}
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  {t("landing.hero.employerButton")}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <h3 className="text-4xl font-bold text-primary mb-2">{stat.number}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-16">
              {t("landing.features.title")}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-card">
              <CardContent className="p-8">
                <Star className="h-12 w-12 text-yellow-500 mb-4" fill="currentColor" />
                <h3 className="text-2xl font-bold mb-2">For Workers</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <span>Find verified jobs near you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <span>Build your reputation with streaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <span>Get paid securely and on time</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-8">
                <TrendingUp className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-2">For Employers</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <span>Hire skilled workers instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <span>Track projects in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <span>Manage payments transparently</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-hero">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of workers and employers transforming the gig economy
          </p>
          <Button
            size="lg"
            className="bg-white text-secondary hover:bg-white/90 text-lg px-8 py-6"
            onClick={() => navigate("/auth/signup")}
          >
            Sign Up Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 RozgaarHub. Made with ❤️ for India.</p>
        </div>
      </footer>
    </div>
  );
}
