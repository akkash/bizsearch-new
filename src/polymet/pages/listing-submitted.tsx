import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ListingSubmittedPage() {
  const [params] = useSearchParams();
  const kind = params.get('type') === 'business' ? 'business' : 'franchise';

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 mx-auto text-foreground" />
          <h1 className="text-2xl font-bold">Listing submitted for review</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your {kind} listing is <strong>not live yet</strong> and is{' '}
            <strong>not verified</strong>. Our team reviews submissions before
            they appear in search. You will get an in-app notification when the
            status changes.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <Button asChild>
              <Link to="/my-listings">View my listings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
