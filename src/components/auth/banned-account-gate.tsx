import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export function BannedAccountGate({ children }: { children: React.ReactNode }) {
  const { accountBanned, loading } = useAuth();

  if (loading || !accountBanned) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mx-auto mb-4">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Account suspended</CardTitle>
          <CardDescription>
            Your account has been suspended by an administrator. Contact support if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
