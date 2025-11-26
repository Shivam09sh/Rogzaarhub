import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: "worker" | "employer";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore();

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
        // Wrong role - redirect to appropriate dashboard
        if (user.role === "worker") {
            return <Navigate to="/worker/dashboard" replace />;
        } else {
            return <Navigate to="/employer/dashboard" replace />;
        }
    }

    return <>{children}</>;
}
