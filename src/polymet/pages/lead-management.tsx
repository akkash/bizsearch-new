import { useState, useEffect } from 'react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    MoreVertical,
    Mail,
    Phone,
    MessageSquare,
    Star,
    TrendingUp,
    Loader2,
    CheckCircle,
    Clock,
    XCircle,
    Send,
    FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InquiryService } from '@/lib/inquiry-service';
import {
    INQUIRY_STATUS_LABELS,
    INQUIRY_STATUS_ORDER,
    type FranchiseInquiry,
    type InquiryStatus,
} from '@/types/franchise-domain';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusConfig: Record<InquiryStatus, { label: string; color: string; icon: typeof Star }> = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Star },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: Phone },
    qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    information_sent: { label: 'Information Sent', color: 'bg-indigo-100 text-indigo-800', icon: Send },
    meeting: { label: 'Meeting', color: 'bg-purple-100 text-purple-800', icon: Clock },
    application: { label: 'Application', color: 'bg-cyan-100 text-cyan-800', icon: FileText },
    negotiation: { label: 'Negotiation', color: 'bg-orange-100 text-orange-800', icon: TrendingUp },
    converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800', icon: TrendingUp },
    lost: { label: 'Lost', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    hot: { label: '🔥 Hot', color: 'bg-red-100 text-red-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
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
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<FranchiseInquiry | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [notesDraft, setNotesDraft] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadLeads();
        }
    }, [user]);

    const loadLeads = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const inquiries = await InquiryService.getReceivedInquiries(user.id);
            setLeads(inquiries);
        } catch (error) {
            console.error('Error loading leads:', error);
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId: string, status: InquiryStatus) => {
        try {
            await InquiryService.updateInquiry(leadId, { status });
            setLeads((prev) =>
                prev.map((l) => (l.id === leadId ? { ...l, status } : l))
            );
            if (selectedLead?.id === leadId) {
                setSelectedLead((prev) => (prev ? { ...prev, status } : prev));
            }
            toast.success(`Lead marked as ${INQUIRY_STATUS_LABELS[status]}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const updateLeadPriority = async (leadId: string, priority: string) => {
        try {
            await InquiryService.updateInquiry(leadId, {
                priority: priority as FranchiseInquiry['priority'],
            });
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === leadId ? { ...l, priority: priority as FranchiseInquiry['priority'] } : l
                )
            );
            toast.success('Priority updated');
        } catch (error) {
            toast.error('Failed to update priority');
        }
    };

    const saveNotes = async () => {
        if (!selectedLead) return;
        setSaving(true);
        try {
            await InquiryService.updateInquiry(selectedLead.id, { notes: notesDraft });
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === selectedLead.id ? { ...l, notes: notesDraft } : l
                )
            );
            setSelectedLead((prev) => (prev ? { ...prev, notes: notesDraft } : prev));
            toast.success('Notes saved');
        } catch (error) {
            toast.error('Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const sendReply = async () => {
        if (!selectedLead || !replyMessage.trim()) return;

        setSaving(true);
        try {
            await InquiryService.updateInquiry(selectedLead.id, {
                status: 'contacted',
                notes: replyMessage,
            });

            setLeads((prev) =>
                prev.map((l) =>
                    l.id === selectedLead.id
                        ? { ...l, status: 'contacted', notes: replyMessage }
                        : l
                )
            );

            toast.success('Reply saved and lead marked as contacted');
            setReplyMessage('');
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setSaving(false);
        }
    };

    const openLead = (lead: FranchiseInquiry) => {
        setSelectedLead(lead);
        setNotesDraft(lead.notes || '');
        setReplyMessage('');
    };

    const filteredLeads = leads.filter((lead) => {
        const senderName = getSenderName(lead);
        const matchesSearch =
            senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.listingName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = {
        total: leads.length,
        new: leads.filter((l) => l.status === 'new').length,
        hot: leads.filter((l) => l.priority === 'hot').length,
        converted: leads.filter((l) => l.status === 'converted').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Lead Management
                    </h1>
                    <p className="text-muted-foreground">Track and manage inquiries for your listings</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                        <p className="text-sm text-blue-600">New Leads</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
                        <p className="text-sm text-red-600">Hot Leads</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                        <p className="text-sm text-green-600">Converted</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {INQUIRY_STATUS_ORDER.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {INQUIRY_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="hot">🔥 Hot</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {filteredLeads.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="font-medium text-lg mb-2">No Leads Found</h3>
                            <p className="text-muted-foreground">
                                {leads.length === 0
                                    ? 'Inquiries from potential franchisees will appear here.'
                                    : 'No leads match your current filters.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredLeads.map((lead) => {
                        const status = statusConfig[lead.status] || statusConfig.new;
                        const priority = priorityConfig[lead.priority] || priorityConfig.medium;
                        const StatusIcon = status.icon;
                        const senderName = getSenderName(lead);
                        const meta = lead.metadata as {
                            sender_name?: string;
                            budget_range?: string;
                        } | null;

                        return (
                            <Card key={lead.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={lead.sender?.avatarUrl || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {senderName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold">{senderName}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Inquired about:{' '}
                                                        <span className="font-medium">{lead.listingName || 'Listing'}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={priority.color}>{priority.label}</Badge>
                                                    <Badge className={status.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {lead.message}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    {lead.contactEmail}
                                                </span>
                                                {lead.contactPhone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        {lead.contactPhone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                                </span>
                                                {meta?.budget_range && (
                                                    <span className="text-primary font-medium">
                                                        Budget: {meta.budget_range.replace('_', '-')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button size="sm" onClick={() => openLead(lead)}>
                                                <MessageSquare className="h-4 w-4 mr-1" />
                                                Manage
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {INQUIRY_STATUS_ORDER.filter((s) => s !== lead.status).map(
                                                        (statusValue) => (
                                                            <DropdownMenuItem
                                                                key={statusValue}
                                                                onClick={() => updateLeadStatus(lead.id, statusValue)}
                                                            >
                                                                Mark as {INQUIRY_STATUS_LABELS[statusValue]}
                                                            </DropdownMenuItem>
                                                        )
                                                    )}
                                                    <DropdownMenuItem onClick={() => updateLeadPriority(lead.id, 'hot')}>
                                                        Set as Hot Lead 🔥
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Lead: {selectedLead ? getSenderName(selectedLead) : ''}</DialogTitle>
                    </DialogHeader>
                    {selectedLead && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Franchise:</span>{' '}
                                    {selectedLead.listingName || 'Unknown'}
                                </p>
                                <p>
                                    <span className="font-medium">Received:</span>{' '}
                                    {formatDistanceToNow(new Date(selectedLead.createdAt), { addSuffix: true })}
                                </p>
                                <p className="font-medium mb-1">Original Message:</p>
                                <p className="text-muted-foreground">{selectedLead.message}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pipeline Status</label>
                                <Select
                                    value={selectedLead.status}
                                    onValueChange={(value) =>
                                        updateLeadStatus(selectedLead.id, value as InquiryStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INQUIRY_STATUS_ORDER.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {INQUIRY_STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Internal Notes</label>
                                <Textarea
                                    value={notesDraft}
                                    onChange={(e) => setNotesDraft(e.target.value)}
                                    placeholder="Add notes about this lead..."
                                    rows={3}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={saveNotes}
                                    disabled={saving}
                                >
                                    Save Notes
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reply to Lead</label>
                                <Textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={sendReply}
                                    disabled={saving || !replyMessage.trim()}
                                    className="flex-1"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Send Reply & Mark Contacted
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
