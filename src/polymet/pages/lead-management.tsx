import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  Mail,
  Phone,
  Loader2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InquiryService } from '@/lib/inquiry-service';
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
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusColor: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  qualified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  information_sent: 'bg-secondary text-muted-foreground',
  meeting: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  application: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
  negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  agreement: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
  opened: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-secondary text-muted-foreground',
};

function getSenderName(lead: FranchiseInquiry): string {
  const meta = lead.metadata as { sender_name?: string } | null;
  return meta?.sender_name || lead.sender?.displayName || 'Unknown';
}

export function LeadManagementPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<FranchiseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<FranchiseInquiry | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadLeads();
  }, [user]);

  const loadLeads = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const inquiries = await InquiryService.getFranchisePipeline(user.id);
      setLeads(inquiries);
    } catch (error) {
      console.error('Error loading pipeline:', error);
      try {
        const fallback = await InquiryService.getReceivedInquiries(user.id);
        setLeads(fallback.filter((l) => l.listingType === 'franchise'));
      } catch (err2) {
        console.error(err2);
        toast.error('Failed to load franchise pipeline');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: InquiryStatus) => {
    try {
      await InquiryService.updateInquiry(leadId, { status });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status } : prev));
      }
      toast.success(`Moved to ${INQUIRY_STATUS_LABELS[status]}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stage');
    }
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      await InquiryService.updateInquiry(selectedLead.id, { notes: notesDraft });
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: notesDraft } : l))
      );
      setSelectedLead((prev) => (prev ? { ...prev, notes: notesDraft } : prev));
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const openLead = (lead: FranchiseInquiry) => {
    setSelectedLead(lead);
    setNotesDraft(lead.notes || '');
  };

  const filteredLeads = leads.filter((lead) => {
    const senderName = getSenderName(lead);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      senderName.toLowerCase().includes(q) ||
      lead.contactEmail.toLowerCase().includes(q) ||
      (lead.listingName || '').toLowerCase().includes(q) ||
      (lead.preferredLocation || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = useMemo(() => {
    const newCount = leads.filter((l) => l.status === 'new').length;
    const meeting = leads.filter((l) => l.status === 'meeting').length;
    const applications = leads.filter(
      (l) => l.status === 'application' || l.linkedApplicationId
    ).length;
    const won = leads.filter((l) =>
      ['opened', 'converted', 'agreement'].includes(l.status)
    ).length;
    const conversion =
      leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;
    return { newCount, meeting, applications, conversion, total: leads.length };
  }, [leads]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STATUS_ORDER.forEach((s) => {
      counts[s] = leads.filter((l) => l.status === s).length;
    });
    return counts;
  }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-growth-green" />
            Franchise Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Qualified franchisee leads → meetings → applications → opened units
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/franchisor/applications">Applications</Link>
          </Button>
          <Button size="sm" asChild className="bg-growth-green hover:bg-growth-green/90 text-white">
            <Link to="/add-franchise-listing">List Franchise</Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5 mb-6">
        {[
          { label: 'Total leads', value: metrics.total },
          { label: 'New', value: metrics.newCount },
          { label: 'Meetings', value: metrics.meeting },
          { label: 'Applications', value: metrics.applications },
          { label: 'Win rate', value: `${metrics.conversion}%` },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold font-mono tabular-nums">{m.value}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                {m.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage strip */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
        {PIPELINE_STATUS_ORDER.filter((s) => s !== 'lost').map((status) => (
          <button
            key={status}
            type="button"
            onClick={() =>
              setStatusFilter((prev) => (prev === status ? 'all' : status))
            }
            className={cn(
              'shrink-0 px-2.5 py-1.5 rounded-md border text-xs transition-colors',
              statusFilter === status
                ? 'border-growth-green bg-growth-green/10 text-foreground'
                : 'border-border text-muted-foreground hover:bg-secondary/50'
            )}
          >
            {INQUIRY_STATUS_LABELS[status]}{' '}
            <span className="font-mono">{stageCounts[status] || 0}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className="shrink-0 px-2.5 py-1.5 rounded-md border text-xs text-muted-foreground"
        >
          All
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, brand, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium text-lg mb-2">No leads in pipeline</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                Qualified franchisee enquiries will appear here. Share your franchise
                listing to start receiving leads.
              </p>
              <Button asChild variant="outline">
                <Link to="/franchises">View franchise listings</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const senderName = getSenderName(lead);
            return (
              <Card
                key={lead.id}
                className="hover:bg-secondary/20 transition-colors cursor-pointer"
                onClick={() => openLead(lead)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={lead.sender?.avatarUrl || ''} />
                      <AvatarFallback className="text-xs">
                        {senderName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">{senderName}</h3>
                        <Badge className={statusColor[lead.status]}>
                          {INQUIRY_STATUS_LABELS[lead.status]}
                        </Badge>
                        {lead.linkedApplicationId && (
                          <Badge variant="outline" className="text-[10px]">
                            App linked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {lead.listingName || 'Franchise'} ·{' '}
                        {formatDistanceToNow(new Date(lead.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                        <span>
                          Invest:{' '}
                          <span className="text-foreground">
                            {labelForOption(
                              INVESTMENT_CAPACITY_OPTIONS,
                              lead.investmentCapacity
                            )}
                          </span>
                        </span>
                        <span>
                          Location:{' '}
                          <span className="text-foreground">
                            {lead.preferredLocation || 'Not provided'}
                          </span>
                        </span>
                        <span>
                          Start:{' '}
                          <span className="text-foreground">
                            {labelForOption(
                              OPENING_TIMELINE_OPTIONS,
                              lead.openingTimeline
                            )}
                          </span>
                        </span>
                        <span>
                          Funds:{' '}
                          <span className="text-foreground">
                            {labelForOption(
                              FUNDS_AVAILABLE_OPTIONS,
                              lead.fundsAvailable
                            )}
                          </span>
                        </span>
                        {lead.selectedStoreFormatName && (
                          <span>
                            Format:{' '}
                            <span className="text-foreground">
                              {lead.selectedStoreFormatName}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Select
                      value={lead.status}
                      onValueChange={(v) => {
                        updateLeadStatus(lead.id, v as InquiryStatus);
                      }}
                    >
                      <SelectTrigger
                        className="w-[140px] h-8 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STATUS_ORDER.map((s) => (
                          <SelectItem key={s} value={s}>
                            {INQUIRY_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Candidate detail */}
      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>{getSenderName(selectedLead)}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColor[selectedLead.status]}>
                    {INQUIRY_STATUS_LABELS[selectedLead.status]}
                  </Badge>
                  <span className="text-muted-foreground">
                    {selectedLead.listingName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Investment capacity</p>
                    <p className="font-medium">
                      {labelForOption(
                        INVESTMENT_CAPACITY_OPTIONS,
                        selectedLead.investmentCapacity
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Preferred location</p>
                    <p className="font-medium">
                      {selectedLead.preferredLocation || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Opening timeline</p>
                    <p className="font-medium">
                      {labelForOption(
                        OPENING_TIMELINE_OPTIONS,
                        selectedLead.openingTimeline
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Funds</p>
                    <p className="font-medium">
                      {labelForOption(
                        FUNDS_AVAILABLE_OPTIONS,
                        selectedLead.fundsAvailable
                      )}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {labelForOption(
                        EXPERIENCE_OPTIONS,
                        selectedLead.relevantExperience
                      )}
                    </p>
                  </div>
                  {selectedLead.selectedStoreFormatName && (
                    <div className="col-span-2">
                      <p className="text-[11px] text-muted-foreground">Outlet format</p>
                      <p className="font-medium">{selectedLead.selectedStoreFormatName}</p>
                    </div>
                  )}
                  {selectedLead.matchScore != null && (
                    <div>
                      <p className="text-[11px] text-muted-foreground">Match score</p>
                      <p className="font-mono font-bold">{selectedLead.matchScore}%</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    Contact
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {selectedLead.contactEmail}
                  </p>
                  {selectedLead.contactPhone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> {selectedLead.contactPhone}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                    Message
                  </p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedLead.message}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                    Notes / history
                  </p>
                  <Textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={3}
                    placeholder="Call notes, next steps..."
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={saveNotes}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save notes'}
                  </Button>
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">
                    Move stage
                  </p>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(v) =>
                      updateLeadStatus(selectedLead.id, v as InquiryStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {INQUIRY_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedLead.linkedApplicationId ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/franchisor/applications">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View application
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-growth-green hover:bg-growth-green/90 text-white"
                      onClick={async () => {
                        await updateLeadStatus(selectedLead.id, 'application');
                        const params = new URLSearchParams({
                          inquiryId: selectedLead.id,
                        });
                        if (selectedLead.selectedStoreFormatId) {
                          params.set('formatId', selectedLead.selectedStoreFormatId);
                        }
                        const url = `${window.location.origin}/franchise/${selectedLead.listingId}/apply?${params}`;
                        try {
                          await navigator.clipboard.writeText(url);
                          toast.success('Application link copied — send it to the candidate');
                        } catch {
                          toast.message('Share this application link', { description: url });
                        }
                      }}
                    >
                      Request application
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/messages">Message</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
