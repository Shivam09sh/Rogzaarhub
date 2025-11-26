import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, MessageSquare, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function MobileBottomNav() {
  const { user } = useAuthStore();
  const isWorker = user?.role === "worker";

  const workerNav = [
    { name: "Dashboard", href: "/worker/dashboard", icon: LayoutDashboard },
    { name: "Jobs", href: "/worker/jobs", icon: Briefcase },
    { name: "Messages", href: "/worker/messages", icon: MessageSquare },
    { name: "Profile", href: "/worker/profile", icon: User },
  ];

  const employerNav = [
    { name: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/employer/projects", icon: Briefcase },
    { name: "Messages", href: "/employer/messages", icon: MessageSquare },
    { name: "Workers", href: "/employer/workers", icon: User },
  ];

  const navigation = isWorker ? workerNav : employerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
