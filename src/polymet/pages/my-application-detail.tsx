import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Building2, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApplicationDetail {
  id: string;
  franchise_id: string;
  status: string;
  created_at: string;
  personal_info: Record<string, unknown> | null;
  financial_info: Record<string, unknown> | null;
  location_preferences: Record<string, unknown> | null;
  inquiry_id: string | null;
  franchise: {
    brand_name: string;
    slug: string | null;
  } | null;
}

export function MyApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      const { data, error } = await supabase
        .from('franchise_applications')
        .select(
          `
          id,
          franchise_id,
          status,
          created_at,
          personal_info,
          financial_info,
          location_preferences,
          inquiry_id,
          franchise:franchises ( brand_name, slug )
        `
        )
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load application:', error);
        setApplication(null);
      } else {
        setApplication(data as unknown as ApplicationDetail);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4 text-center">
        <p className="mb-4">No details found in the table.</p>
        <Button asChild variant="outline">
          <Link to="/my-applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  const brand = application.franchise?.brand_name || 'Franchise';
  const listingPath = `/franchise/${application.franchise?.slug || application.franchise_id}`;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/my-applications">
          <ArrowLeft className="h-4 w-4 mr-2" />
          My Applications
        </Link>
      </Button>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{brand}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Submitted {format(new Date(application.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <Badge variant="outline">{application.status.replace('_', ' ')}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={listingPath}>
                <Building2 className="h-4 w-4 mr-2" />
                View franchise
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                to={
                  application.inquiry_id
                    ? `/my-enquiries?inquiry=${application.inquiry_id}`
                    : '/my-enquiries'
                }
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Related enquiry
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
