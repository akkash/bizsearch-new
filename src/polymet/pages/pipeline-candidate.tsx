import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InquiryService } from '@/lib/inquiry-service';
import { supabase } from '@/lib/supabase';
import {
  EXPERIENCE_OPTIONS,
  FUNDS_AVAILABLE_OPTIONS,
  INQUIRY_STATUS_LABELS,
  INVESTMENT_CAPACITY_OPTIONS,
  OPENING_TIMELINE_OPTIONS,
  PIPELINE_STATUS_ORDER,
  labelForOption,
  type FranchiseInquiry,
  type InquiryStatus,
} from '@/types/franchise-domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface LinkedApplication {
  id: string;
  status: string;
  created_at: string;
}

export function PipelineCandidatePage() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState<FranchiseInquiry | null>(null);
  const [application, setApplication] = useState<LinkedApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [meetingAt, setMeetingAt] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [savingMeeting, setSavingMeeting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !inquiryId) return;
      setLoading(true);
      try {
        const row = await InquiryService.getCandidate(inquiryId, user.id);
        setInquiry(row);
        if (row?.meetingAt) {
          setMeetingAt(row.meetingAt.slice(0, 16));
        }
        setMeetingNotes(row?.meetingNotes || '');

        if (row?.linkedApplicationId) {
          const { data } = await supabase
            .from('franchise_applications')
            .select('id, status, created_at')
            .eq('id', row.linkedApplicationId)
            .maybeSingle();
          setApplication(data as LinkedApplication | null);
        } else {
          setApplication(null);
        }
      } catch (error) {
        console.error('Failed to load candidate:', error);
        setInquiry(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, inquiryId]);

  const updateStatus = async (status: InquiryStatus) => {
    if (!inquiry) return;
    try {
      await InquiryService.updateInquiry(inquiry.id, { status });
      setInquiry({ ...inquiry, status });
      toast.success(`Moved to ${INQUIRY_STATUS_LABELS[status]}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not update stage.');
    }
  };

  const saveMeeting = async () => {
    if (!inquiry || !meetingAt) {
      toast.error('Choose a meeting time.');
      return;
    }
    setSavingMeeting(true);
    try {
      const iso = new Date(meetingAt).toISOString();
      await InquiryService.scheduleMeeting(inquiry.id, iso, meetingNotes);
      setInquiry({
        ...inquiry,
        status: 'meeting',
        meetingAt: iso,
        meetingNotes,
      });
      toast.success('Meeting scheduled. The candidate can see this in My Enquiries.');
    } catch (error) {
      console.error(error);
      toast.error('Could not schedule the meeting.');
    } finally {
      setSavingMeeting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4 text-center">
        <p className="mb-4">No details found in the table.</p>
        <Button asChild variant="outline">
          <Link to="/pipeline">Back to pipeline</Link>
        </Button>
      </div>
    );
  }

  const name = inquiry.sender?.displayName || inquiry.contactEmail;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/pipeline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Pipeline
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{inquiry.listingName}</p>
          </div>
          <Badge variant="outline">{INQUIRY_STATUS_LABELS[inquiry.status]}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 border border-border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Investment</p>
              <p className="font-medium">
                {labelForOption(INVESTMENT_CAPACITY_OPTIONS, inquiry.investmentCapacity)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{inquiry.preferredLocation || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timeline</p>
              <p className="font-medium">
                {labelForOption(OPENING_TIMELINE_OPTIONS, inquiry.openingTimeline)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Funds</p>
              <p className="font-medium">
                {labelForOption(FUNDS_AVAILABLE_OPTIONS, inquiry.fundsAvailable)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-medium">
                {labelForOption(EXPERIENCE_OPTIONS, inquiry.relevantExperience)}
              </p>
            </div>
            {inquiry.matchScore != null && (
              <div>
                <p className="text-xs text-muted-foreground">Qualification score</p>
                <p className="font-mono font-bold">{inquiry.matchScore}</p>
              </div>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {inquiry.contactEmail}
            </p>
            {inquiry.contactPhone && inquiry.status !== 'new' && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {inquiry.contactPhone}
              </p>
            )}
            <p className="text-muted-foreground whitespace-pre-wrap pt-2">{inquiry.message}</p>
          </div>

          <div className="space-y-2">
            <Label>Stage</Label>
            <Select
              value={inquiry.status}
              onValueChange={(value) => updateStatus(value as InquiryStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STATUS_ORDER.map((status) => (
                  <SelectItem key={status} value={status}>
                    {INQUIRY_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 border border-border p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <h3 className="font-semibold">Meeting</h3>
            </div>
            {inquiry.meetingAt && (
              <p className="text-sm">
                Scheduled {format(new Date(inquiry.meetingAt), 'PPpp')}
              </p>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meetingAt">Date and time</Label>
                <Input
                  id="meetingAt"
                  type="datetime-local"
                  value={meetingAt}
                  onChange={(event) => setMeetingAt(event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="meetingNotes">Notes for the candidate</Label>
                <Textarea
                  id="meetingNotes"
                  rows={3}
                  value={meetingNotes}
                  onChange={(event) => setMeetingNotes(event.target.value)}
                  placeholder="Call link, office address, or agenda"
                />
              </div>
            </div>
            <Button onClick={saveMeeting} disabled={savingMeeting}>
              {savingMeeting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save meeting'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {application ? (
              <Button asChild>
                <Link to={`/franchisor/applications?inquiry=${inquiry.id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Application ({application.status.replace('_', ' ')})
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to={`/franchisor/applications`}>No application yet</Link>
              </Button>
            )}
            {inquiry.conversationId && (
              <Button variant="outline" asChild>
                <Link to={`/messages?conversation=${inquiry.conversationId}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/franchise/${inquiry.listingId}`}>View listing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
