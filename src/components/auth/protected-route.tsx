import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication and/or specific roles.
 * Features:
 * - Redirects unauthenticated users to login with return URL
 * - Shows loading state during auth check
 * - Validates user roles if required
 * - Shows user-friendly access denied message
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requiredRole="seller">
 *   <AddBusinessListing />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requiredRoles={["seller", "broker"]}>
 *   <ManageListings />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, profile, loading, profileMissing } = useAuth();
  const location = useLocation();

  // Safety timeout for loading state
  const [showTimeoutError, setShowTimeoutError] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowTimeoutError(true);
      }, 8000); // 8 seconds timeout
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Show loading state while checking authentication
  if (loading) {
    if (showTimeoutError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Authentication Timed Out</CardTitle>
              <CardDescription className="text-center">
                We couldn't verify your session in time. Please try refreshing the page or logging in again.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/login'} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to profile setup if profile is missing (but allow access to the setup page itself)
  if (profileMissing && location.pathname !== '/profile/setup') {
    return <Navigate to="/profile/setup" state={{ from: location }} replace />;
  }

  // Check role requirements
  const hasRequiredRole = () => {
    if (!profile) return false;

    if (requiredRole) {
      return profile.role === requiredRole;
    }

    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.includes(profile.role);
    }

    return true;
  };

  // Show access denied if user doesn't have required role
  if ((requiredRole || requiredRoles) && !hasRequiredRole()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mx-auto mb-4">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              This page requires {requiredRole ? `${requiredRole}` : 'specific'} role access.
              Your current role is <strong>{profile?.role}</strong>.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
