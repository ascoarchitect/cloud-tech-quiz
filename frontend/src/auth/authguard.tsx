// src/auth/AuthGuard.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { authStatus, isAdmin } = useAuth();

  if (authStatus === "checking") {
    return <div className="loading">Loading...</div>;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
