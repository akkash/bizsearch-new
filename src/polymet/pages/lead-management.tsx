import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Calendar,
    MessageSquare,
    Star,
    TrendingUp,
    Filter,
    Loader2,
    CheckCircle,
    Clock,
    XCircle,
    Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Lead {
    id: string;
    sender_id: string | null;
    listing_id: string;
    listing_type: 'business' | 'franchise';
    subject: string;
    message: string;
    contact_email: string;
    contact_phone: string | null;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    priority: 'low' | 'medium' | 'high' | 'hot';
    notes: string | null;
    metadata: {
        sender_name?: string;
        budget_range?: string;
        timeline?: string;
        nda_accepted?: boolean;
    } | null;
    created_at: string;
    sender?: {
        display_name: string;
        email: string;
        avatar_url: string | null;
    };
    listing?: {
        name: string;
    };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Star },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: Phone },
    qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    converted: { label: 'Converted', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
    lost: { label: 'Lost', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    hot: { label: '🔥 Hot', color: 'bg-red-100 text-red-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
};

export function LeadManagementPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (user) {
            loadLeads();
        }
    }, [user]);

    const loadLeads = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Get all franchises owned by user
            const { data: franchises } = await supabase
                .from('franchises')
                .select('id, brand_name')
                .eq('owner_id', user.id);

            // Get all businesses owned by user
            const { data: businesses } = await supabase
                .from('businesses')
                .select('id, name')
                .eq('owner_id', user.id);

            const franchiseIds = franchises?.map(f => f.id) || [];
            const businessIds = businesses?.map(b => b.id) || [];
            const allListingIds = [...franchiseIds, ...businessIds];

            if (allListingIds.length === 0) {
                setLeads([]);
                setLoading(false);
                return;
            }

            // Get inquiries for all listings
            const { data: inquiries, error } = await supabase
                .from('inquiries')
                .select(`
          *,
          sender:profiles!sender_id(display_name, email, avatar_url)
        `)
                .in('listing_id', allListingIds)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map listing names
            const leadsWithNames = (inquiries || []).map(inquiry => {
                let listingName = 'Unknown Listing';
                if (inquiry.listing_type === 'franchise') {
                    const franchise = franchises?.find(f => f.id === inquiry.listing_id);
                    listingName = franchise?.brand_name || listingName;
                } else {
                    const business = businesses?.find(b => b.id === inquiry.listing_id);
                    listingName = business?.name || listingName;
                }
                return {
                    ...inquiry,
                    status: inquiry.status || 'new',
                    priority: inquiry.priority || 'medium',
                    listing: { name: listingName },
                };
            });

            setLeads(leadsWithNames);
        } catch (error) {
            console.error('Error loading leads:', error);
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('inquiries')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', leadId);

            if (error) throw error;

            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, status: status as Lead['status'] } : l
            ));
            toast.success('Lead status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updateLeadPriority = async (leadId: string, priority: string) => {
        try {
            const { error } = await supabase
                .from('inquiries')
                .update({ priority })
                .eq('id', leadId);

            if (error) throw error;

            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, priority: priority as Lead['priority'] } : l
            ));
            toast.success('Priority updated');
        } catch (error) {
            toast.error('Failed to update priority');
        }
    };

    const sendReply = async () => {
        if (!selectedLead || !replyMessage.trim()) return;

        setSending(true);
        try {
            // In production, this would send an email or create a message
            // For now, we'll update the status to 'contacted' and add a note
            const { error } = await supabase
                .from('inquiries')
                .update({
                    status: 'contacted',
                    notes: replyMessage,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedLead.id);

            if (error) throw error;

            setLeads(prev => prev.map(l =>
                l.id === selectedLead.id ? { ...l, status: 'contacted', notes: replyMessage } : l
            ));

            toast.success('Reply sent and lead marked as contacted');
            setReplyMessage('');
            setSelectedLead(null);
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            (lead.metadata?.sender_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.listing?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        hot: leads.filter(l => l.priority === 'hot').length,
        converted: leads.filter(l => l.status === 'converted').length,
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

            {/* Stats */}
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

            {/* Filters */}
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
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
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

            {/* Leads List */}
            <div className="space-y-4">
                {filteredLeads.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="font-medium text-lg mb-2">No Leads Found</h3>
                            <p className="text-muted-foreground">
                                {leads.length === 0
                                    ? "Inquiries from potential buyers will appear here"
                                    : "No leads match your current filters"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredLeads.map((lead) => {
                        const status = statusConfig[lead.status];
                        const priority = priorityConfig[lead.priority];
                        const StatusIcon = status.icon;
                        const senderName = lead.metadata?.sender_name || lead.sender?.display_name || 'Unknown';

                        return (
                            <Card key={lead.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={lead.sender?.avatar_url || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold">{senderName}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Inquired about: <span className="font-medium">{lead.listing?.name}</span>
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
                                                    {lead.contact_email}
                                                </span>
                                                {lead.contact_phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        {lead.contact_phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                                                </span>
                                                {lead.metadata?.budget_range && (
                                                    <span className="text-primary font-medium">
                                                        Budget: {lead.metadata.budget_range.replace('_', '-')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button size="sm" onClick={() => setSelectedLead(lead)}>
                                                <MessageSquare className="h-4 w-4 mr-1" />
                                                Reply
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                                                        Mark as Contacted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'qualified')}>
                                                        Mark as Qualified
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'converted')}>
                                                        Mark as Converted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadPriority(lead.id, 'hot')}>
                                                        Set as Hot Lead 🔥
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'lost')}>
                                                        Mark as Lost
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

            {/* Reply Dialog */}
            <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Reply to {selectedLead?.metadata?.sender_name || 'Lead'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Original Message:</p>
                            <p className="text-sm text-muted-foreground">{selectedLead?.message}</p>
                        </div>
                        <div className="space-y-2">
                            <Textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply..."
                                rows={4}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={sendReply} disabled={sending || !replyMessage.trim()} className="flex-1">
                                {sending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Send Reply
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedLead(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
