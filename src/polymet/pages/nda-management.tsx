import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FileText,
    Plus,
    Send,
    Download,
    CheckCircle,
    Clock,
    Eye,
    Loader2,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface NDA {
    id: string;
    business_id: string;
    buyer_id: string;
    status: 'sent' | 'viewed' | 'signed' | 'expired';
    sent_at: string;
    signed_at: string | null;
    expires_at: string;
    business: {
        name: string;
    };
    buyer: {
        display_name: string;
        email: string;
    };
}

const statusColors: Record<string, string> = {
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-600',
};

export function NDAManagementPage() {
    const { user } = useAuth();
    const [ndas, setNdas] = useState<NDA[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [sendForm, setSendForm] = useState({
        buyerEmail: '',
        businessId: '',
        customTerms: '',
    });

    useEffect(() => {
        if (user) {
            loadNDAs();
        }
    }, [user]);

    const loadNDAs = async () => {
        if (!user) return;
        setLoading(true);

        // Get NDAs for user's businesses
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
            .from('nda_agreements')
            .select(`
        id,
        business_id,
        buyer_id,
        status,
        sent_at,
        signed_at,
        expires_at,
        business:businesses!business_id (name),
        buyer:profiles!buyer_id (display_name, email)
      `)
            .in('business_id', businessIds)
            .order('sent_at', { ascending: false });

        if (!error && data) {
            setNdas(data as unknown as NDA[]);
        }
        setLoading(false);
    };

    const handleSendNDA = async () => {
        if (!user) return;

        try {
            // In production, this would send an email with NDA
            toast.success('NDA sent successfully');
            setShowSendDialog(false);
            setSendForm({ buyerEmail: '', businessId: '', customTerms: '' });
            loadNDAs();
        } catch (error) {
            toast.error('Failed to send NDA');
        }
    };

    const stats = {
        total: ndas.length,
        pending: ndas.filter(n => n.status === 'sent' || n.status === 'viewed').length,
        signed: ndas.filter(n => n.status === 'signed').length,
        expired: ndas.filter(n => n.status === 'expired').length,
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
                        <Shield className="h-6 w-6 text-primary" />
                        NDA Management
                    </h1>
                    <p className="text-muted-foreground">Manage non-disclosure agreements with buyers</p>
                </div>
                <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Send NDA
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send NDA to Buyer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Buyer Email</Label>
                                <Input
                                    type="email"
                                    placeholder="buyer@email.com"
                                    value={sendForm.buyerEmail}
                                    onChange={(e) => setSendForm(prev => ({ ...prev, buyerEmail: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Custom Terms (Optional)</Label>
                                <Textarea
                                    placeholder="Add any custom terms or conditions..."
                                    value={sendForm.customTerms}
                                    onChange={(e) => setSendForm(prev => ({ ...prev, customTerms: e.target.value }))}
                                    rows={4}
                                />
                            </div>
                            <Button onClick={handleSendNDA} className="w-full">
                                <Send className="h-4 w-4 mr-2" />
                                Send NDA
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total NDAs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
                        <p className="text-sm text-muted-foreground">Signed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
                        <p className="text-sm text-muted-foreground">Expired</p>
                    </CardContent>
                </Card>
            </div>

            {/* NDA Table */}
            <Card>
                <CardHeader>
                    <CardTitle>NDA Agreements</CardTitle>
                    <CardDescription>Track the status of all non-disclosure agreements</CardDescription>
                </CardHeader>
                <CardContent>
                    {ndas.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No NDAs sent yet</p>
                            <p className="text-sm">Send an NDA to a potential buyer to get started</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Signed</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ndas.map((nda) => (
                                    <TableRow key={nda.id}>
                                        <TableCell className="font-medium">{nda.business?.name}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p>{nda.buyer?.display_name}</p>
                                                <p className="text-xs text-muted-foreground">{nda.buyer?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[nda.status]}>{nda.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(nda.sent_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {nda.signed_at ? (
                                                <span className="text-green-600">
                                                    {format(new Date(nda.signed_at), 'MMM d, yyyy')}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                {nda.status === 'sent' && (
                                                    <Button size="sm" variant="ghost">
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* NDA Template Info */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900">About NDAs</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Non-Disclosure Agreements protect your confidential business information.
                                Once signed, buyers can access sensitive details in the Deal Room.
                            </p>
                            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                                <li>Automatically generated from our legal template</li>
                                <li>E-signature enabled for quick signing</li>
                                <li>Valid for 2 years from signing date</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
