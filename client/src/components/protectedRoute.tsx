import { ReactNode } from "react";
import { useAuth, UserRole } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { role, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !allowedRoles.includes(role)) {
      // Only redirect guests to login, show error for users without permission
      if (role === 'guest') {
        setLocation(redirectTo);
      }
    }
  }, [role, isLoading, allowedRoles, redirectTo, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!allowedRoles.includes(role)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            {role === 'guest' 
              ? "You need to be logged in to access this page."
              : "You don't have permission to access this page."}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            {role === 'guest' && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}