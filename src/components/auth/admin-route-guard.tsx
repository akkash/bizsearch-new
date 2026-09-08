import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminService } from '@/lib/admin-service';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExtendedProfile } from '@/types/auth.types';

interface AdminRouteGuardProps {
    children: ReactNode;
}

function hasAdminRole(profile: ExtendedProfile | null): boolean {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    return profile.roles?.some((entry) => entry.role === 'admin') ?? false;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
    const { user, profile, loading } = useAuth();
    const extendedProfile = profile as ExtendedProfile | null;
    const [serverVerified, setServerVerified] = useState<boolean | null>(null);

    useEffect(() => {
        if (!user) {
            setServerVerified(false);
            return;
        }

        let cancelled = false;
        AdminService.isAdmin(user.id)
            .then((isAdmin) => {
                if (!cancelled) {
                    setServerVerified(isAdmin);
                }
            })
            .catch((error) => {
                console.error('Admin verification failed:', error);
                if (!cancelled) {
                    setServerVerified(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    if (loading || (user && serverVerified === null)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const clientAdmin = hasAdminRole(extendedProfile);
    const isAuthorized = clientAdmin && serverVerified === true;

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mx-auto mb-4">
                            <ShieldAlert className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle className="text-center">Access Denied</CardTitle>
                        <CardDescription className="text-center">
                            You don't have permission to access the admin dashboard.
                            This area is restricted to administrators only.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <a href="/">Go to Homepage</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
