import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExtendedProfile, UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
}

function getUserRoles(profile: ExtendedProfile | null): UserRole[] {
  if (!profile) return [];

  const roleSet = new Set<UserRole>();
  if (profile.role) {
    roleSet.add(profile.role);
  }
  profile.roles?.forEach((entry) => {
    if (entry.role) {
      roleSet.add(entry.role);
    }
  });

  return Array.from(roleSet);
}

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication and/or specific roles.
 */
export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, profile, loading, profileMissing } = useAuth();
  const location = useLocation();
  const extendedProfile = profile as ExtendedProfile | null;

  const [showTimeoutError, setShowTimeoutError] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowTimeoutError(true);
      }, 8000);
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profileMissing && location.pathname !== '/profile/setup') {
    return <Navigate to="/profile/setup" state={{ from: location }} replace />;
  }

  const userRoles = getUserRoles(extendedProfile);

  const hasRequiredRole = () => {
    if (!extendedProfile) return false;

    if (requiredRole) {
      return userRoles.includes(requiredRole);
    }

    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.some((role) => userRoles.includes(role));
    }

    return true;
  };

  if ((requiredRole || requiredRoles) && !hasRequiredRole()) {
    const requiredLabel = requiredRole
      ? requiredRole
      : requiredRoles?.join(', ');

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
              This page requires <strong>{requiredLabel}</strong> role access.
              Your current roles are <strong>{userRoles.join(', ') || 'none'}</strong>.
            </p>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
