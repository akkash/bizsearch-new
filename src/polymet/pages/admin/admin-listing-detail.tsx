import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { AdminService } from '@/lib/admin-service';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AdminListingDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const listingType = type === 'franchise' ? 'franchise' : 'business';
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    AdminService.getListingById(id, listingType)
      .then(setListing)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, listingType]);

  const name =
    listingType === 'franchise'
      ? String(listing?.brand_name || '')
      : String(listing?.name || '');
  const owner = listing?.owner as { display_name?: string; email?: string } | undefined;
  const publicPath =
    listingType === 'franchise'
      ? `/franchise/${listing?.slug || id}`
      : `/business/${listing?.slug || id}`;

  const handleApprove = async () => {
    if (!id) return;
    setActing(true);
    try {
      await AdminService.approveListing(id, listingType);
      toast.success('Listing approved');
      navigate('/admin/listings');
    } catch {
      toast.error('Failed to approve listing');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    const reason = window.prompt('Rejection reason (min 10 characters):');
    if (!reason || reason.length < 10) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActing(true);
    try {
      await AdminService.rejectListing(id, listingType, reason);
      toast.success('Listing rejected');
      navigate('/admin/listings');
    } catch {
      toast.error('Failed to reject listing');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No details found in the table.</p>
        <Button variant="link" onClick={() => navigate('/admin/listings')}>Back to listings</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/listings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground capitalize">{listingType} listing review</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Listing details
            <Badge>{String(listing.status)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{owner?.display_name || 'Unknown'}</p>
              <p className="text-sm">{owner?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{String(listing.industry || '—')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {listing.created_at
                  ? format(new Date(String(listing.created_at)), 'MMM d, yyyy')
                  : '—'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{String(listing.description || '—')}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild variant="outline">
              <Link to={publicPath} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview public page
              </Link>
            </Button>
            {listing.status === 'pending_review' && (
              <>
                <Button onClick={handleApprove} disabled={acting}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={acting}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
