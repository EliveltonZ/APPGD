import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(user, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
