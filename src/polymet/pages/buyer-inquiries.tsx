import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MessageSquare,
    Mail,
    Phone,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Eye,
    FileText,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Inquiry {
    id: string;
    business_id: string;
    buyer_id: string;
    message: string;
    status: 'pending' | 'responded' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    buyer: {
        id: string;
        display_name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
    };
    business: {
        id: string;
        name: string;
        slug: string | null;
    };
    nda_signed: boolean;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    responded: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export function BuyerInquiriesPage() {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user) {
            loadInquiries();
        }
    }, [user]);

    const loadInquiries = async () => {
        if (!user) return;
        setLoading(true);

        // Get user's businesses first
        const { data: businesses } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id);

        if (!businesses || businesses.length === 0) {
            setLoading(false);
            return;
        }

        const businessIds = businesses.map(b => b.id);

        const { data, error } = await supabase
            .from('business_inquiries')
            .select(`
        id,
        business_id,
        buyer_id,
        message,
        status,
        created_at,
        updated_at,
        nda_signed,
        buyer:profiles!buyer_id (
          id,
          display_name,
          email,
          phone,
          avatar_url
        ),
        business:businesses!business_id (
          id,
          name,
          slug
        )
      `)
            .in('business_id', businessIds)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInquiries(data as unknown as Inquiry[]);
        }
        setLoading(false);
    };

    const updateStatus = async (inquiryId: string, status: string) => {
        const { error } = await supabase
            .from('business_inquiries')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', inquiryId);

        if (!error) {
            toast.success(`Inquiry ${status}`);
            loadInquiries();
        } else {
            toast.error('Failed to update inquiry');
        }
    };

    const filteredInquiries = inquiries.filter(inq => {
        if (filter === 'all') return true;
        return inq.status === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Buyer Inquiries</h1>
                    <p className="text-muted-foreground">Manage inquiries from potential buyers</p>
                </div>
                <Badge variant="secondary" className="text-lg py-1 px-3">
                    {inquiries.filter(i => i.status === 'pending').length} Pending
                </Badge>
            </div>

            <Tabs value={filter} onValueChange={setFilter} className="mb-6">
                <TabsList>
                    <TabsTrigger value="all">All ({inquiries.length})</TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending ({inquiries.filter(i => i.status === 'pending').length})
                    </TabsTrigger>
                    <TabsTrigger value="responded">
                        Responded ({inquiries.filter(i => i.status === 'responded').length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        Approved ({inquiries.filter(i => i.status === 'approved').length})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {filteredInquiries.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium text-lg mb-2">No Inquiries Yet</h3>
                        <p className="text-muted-foreground">
                            {filter === 'all'
                                ? "You haven't received any inquiries yet"
                                : `No ${filter} inquiries`}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredInquiries.map((inquiry) => {
                        const status = statusConfig[inquiry.status];
                        const StatusIcon = status.icon;

                        return (
                            <Card key={inquiry.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={inquiry.buyer?.avatar_url || ''} />
                                            <AvatarFallback>
                                                {inquiry.buyer?.display_name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold">{inquiry.buyer?.display_name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Interested in: {inquiry.business?.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={status.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {inquiry.status}
                                                    </Badge>
                                                    {inquiry.nda_signed && (
                                                        <Badge variant="outline" className="text-green-600">
                                                            <FileText className="h-3 w-3 mr-1" />
                                                            NDA Signed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {inquiry.message}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {inquiry.buyer?.email}
                                                    </span>
                                                    {inquiry.buyer?.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-4 w-4" />
                                                            {inquiry.buyer.phone}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link to={`/messages?with=${inquiry.buyer_id}`}>
                                                            <MessageSquare className="h-4 w-4 mr-1" />
                                                            Message
                                                        </Link>
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="ghost">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {inquiry.status === 'pending' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => updateStatus(inquiry.id, 'approved')}>
                                                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                                        Approve & Send NDA
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateStatus(inquiry.id, 'rejected')}>
                                                                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                                                        Reject
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/business/${inquiry.business?.slug || inquiry.business_id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Listing
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
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
