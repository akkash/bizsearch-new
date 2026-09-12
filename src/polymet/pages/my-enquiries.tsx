import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Building2,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InquiryService } from '@/lib/inquiry-service';
import {
  FRANCHISEE_INQUIRY_STATUS_LABELS,
  type FranchiseInquiry,
} from '@/types/franchise-domain';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function listingHref(inquiry: FranchiseInquiry) {
  return inquiry.listingType === 'franchise'
    ? `/franchise/${inquiry.listingId}`
    : `/business/${inquiry.listingId}`;
}

export function MyEnquiriesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('inquiry');
  const [enquiries, setEnquiries] = useState<FranchiseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setLoadError(false);
      try {
        const rows = await InquiryService.getSentInquiries(user.id);
        if (!cancelled) setEnquiries(rows);
      } catch (error) {
        console.error('Failed to load enquiries:', error);
        if (!cancelled) {
          setEnquiries([]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    return enquiries.filter((enquiry) => {
      if (filter === 'open') return enquiry.status !== 'lost';
      if (filter === 'closed') return enquiry.status === 'lost';
      return true;
    });
  }, [enquiries, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Enquiries</h1>
          <p className="text-muted-foreground">
            Track franchise and listing enquiries you have sent.
          </p>
        </div>
        <Button asChild>
          <Link to="/franchises">
            <Building2 className="h-4 w-4 mr-2" />
            Browse Franchises
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({enquiries.length})</TabsTrigger>
          <TabsTrigger value="open">
            Open ({enquiries.filter((row) => row.status !== 'lost').length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({enquiries.filter((row) => row.status === 'lost').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loadError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Could not load enquiries. Try again.</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">
              {enquiries.length === 0
                ? 'No details found in the table.'
                : 'No enquiries in this filter.'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {enquiries.length === 0
                ? 'You have not sent any enquiries yet. Enquire from a franchise page to start a conversation in BizSearch.'
                : 'Try another filter.'}
            </p>
            {enquiries.length === 0 && (
              <Button asChild>
                <Link to="/franchises">Explore Franchises</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((enquiry) => {
            const highlighted = enquiry.id === highlightId;
            return (
              <Card
                key={enquiry.id}
                id={`enquiry-${enquiry.id}`}
                className={highlighted ? 'border-foreground' : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {enquiry.listingName || 'Listing'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sent {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {FRANCHISEE_INQUIRY_STATUS_LABELS[enquiry.status] || enquiry.status}
                    </Badge>
                  </div>
                  {enquiry.preferredLocation && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Preferred location: {enquiry.preferredLocation}
                    </p>
                  )}
                  {enquiry.meetingAt && (
                    <p className="text-sm mb-2">
                      Meeting: {format(new Date(enquiry.meetingAt), 'PPpp')}
                      {enquiry.meetingNotes ? ` — ${enquiry.meetingNotes}` : ''}
                    </p>
                  )}
                  <p className="text-sm line-clamp-3 mb-4">{enquiry.message}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(enquiry.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={listingHref(enquiry)}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View listing
                      </Link>
                    </Button>
                    {enquiry.conversationId && (
                      <Button size="sm" asChild>
                        <Link to={`/messages?conversation=${enquiry.conversationId}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Open messages
                        </Link>
                      </Button>
                    )}
                    {enquiry.listingType === 'franchise' && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/franchise/${enquiry.listingId}/apply`}>Apply</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
