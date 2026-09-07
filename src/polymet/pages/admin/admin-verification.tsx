import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Shield,
    ShieldCheck,
    ShieldX,
    Search,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    FileText,
    Building2,
    Store,
    Calendar,
    Eye,
    TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Listing {
    id: string;
    name: string;
    type: 'business' | 'franchise';
    industry: string;
    location: string;
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'unverified';
    dataCompletenessScore: number;
    createdAt: string;
    updatedAt: string;
    verifiedAt: string | null;
    isStale: boolean;
    ownerEmail: string;
}

function computeCompletenessScore(row: Record<string, unknown>, type: 'business' | 'franchise'): number {
    const fields =
        type === 'franchise'
            ? ['brand_name', 'industry', 'description', 'franchise_fee', 'total_investment_min', 'logo_url', 'contact_email']
            : ['name', 'industry', 'description', 'price', 'city', 'state', 'contact_email'];
    const filled = fields.filter((field) => {
        const value = row[field];
        return value !== null && value !== undefined && String(value).trim() !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
}

function mapRowToListing(
    row: Record<string, unknown>,
    type: 'business' | 'franchise',
    ownerEmail = '—'
): Listing {
    const updatedAt = String(row.updated_at || row.created_at || new Date().toISOString());
    const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const verificationStatus = String(row.verification_status || 'unverified') as Listing['verificationStatus'];
    const location =
        type === 'franchise'
            ? [row.headquarters_city, row.headquarters_state].filter(Boolean).join(', ')
            : [row.city, row.state].filter(Boolean).join(', ');

    return {
        id: String(row.id),
        name: String(type === 'franchise' ? row.brand_name : row.name),
        type,
        industry: String(row.industry || '—'),
        location: location || '—',
        verificationStatus,
        dataCompletenessScore: computeCompletenessScore(row, type),
        createdAt: String(row.created_at || updatedAt),
        updatedAt,
        verifiedAt: row.verified_at ? String(row.verified_at) : null,
        isStale: daysSinceUpdate >= 90,
        ownerEmail,
    };
}

async function resolveOwnerEmails(userIds: string[]): Promise<Map<string, string>> {
    const emails = new Map<string, string>();
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    if (uniqueIds.length === 0) return emails;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', uniqueIds);

    if (error) {
        console.error('Failed to resolve owner emails:', error);
        return emails;
    }

    data?.forEach((profile) => {
        emails.set(profile.id, profile.email || '—');
    });
    return emails;
}

const statusColors = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    unverified: 'bg-secondary text-foreground dark:bg-gray-800 dark:text-gray-300',
};

const statusIcons = {
    pending: Clock,
    verified: ShieldCheck,
    rejected: ShieldX,
    unverified: Shield,
};

export function AdminVerification() {
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'verify' | 'reject' | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadListings();
    }, [statusFilter, typeFilter]);

    const loadListings = async () => {
        setLoading(true);
        try {
            const results: Listing[] = [];

            if (typeFilter === 'all' || typeFilter === 'franchise') {
                let franchiseQuery = supabase
                    .from('franchises')
                    .select('*')
                    .neq('status', 'draft');

                if (statusFilter !== 'all') {
                    franchiseQuery = franchiseQuery.eq('verification_status', statusFilter);
                }

                const { data: franchises, error: franchiseError } = await franchiseQuery;
                if (franchiseError) throw franchiseError;

                const ownerEmails = await resolveOwnerEmails(
                    (franchises || []).map((row) => String(row.franchisor_id))
                );

                franchises?.forEach((row) => {
                    results.push(
                        mapRowToListing(
                            row as Record<string, unknown>,
                            'franchise',
                            ownerEmails.get(String(row.franchisor_id)) || '—'
                        )
                    );
                });
            }

            if (typeFilter === 'all' || typeFilter === 'business') {
                let businessQuery = supabase
                    .from('businesses')
                    .select('*')
                    .neq('status', 'draft');

                if (statusFilter !== 'all') {
                    businessQuery = businessQuery.eq('verification_status', statusFilter);
                }

                const { data: businesses, error: businessError } = await businessQuery;
                if (businessError) throw businessError;

                const sellerEmails = await resolveOwnerEmails(
                    (businesses || []).map((row) => String(row.seller_id))
                );

                businesses?.forEach((row) => {
                    results.push(
                        mapRowToListing(
                            row as Record<string, unknown>,
                            'business',
                            sellerEmails.get(String(row.seller_id)) || '—'
                        )
                    );
                });
            }

            let filtered = results;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (l) =>
                        l.name.toLowerCase().includes(query) ||
                        l.location.toLowerCase().includes(query) ||
                        l.industry.toLowerCase().includes(query)
                );
            }

            setListings(filtered);
        } catch (error) {
            console.error('Failed to load verification queue:', error);
            toast.error('Failed to load verification records');
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = (listing: Listing) => {
        setSelectedListing(listing);
        setDialogAction('verify');
        setVerificationNotes('');
        setShowDialog(true);
    };

    const handleReject = (listing: Listing) => {
        setSelectedListing(listing);
        setDialogAction('reject');
        setVerificationNotes('');
        setShowDialog(true);
    };

    const confirmAction = async () => {
        if (!selectedListing || !dialogAction) return;

        const newStatus = dialogAction === 'verify' ? 'verified' : 'rejected';
        const table = selectedListing.type === 'franchise' ? 'franchises' : 'businesses';
        const now = new Date().toISOString();

        try {
            const { error } = await supabase
                .from(table)
                .update({
                    verification_status: newStatus,
                    verified_at: dialogAction === 'verify' ? now : null,
                    updated_at: now,
                })
                .eq('id', selectedListing.id);

            if (error) throw error;

            const { error: logError } = await supabase.from('verification_logs').insert({
                listing_id: selectedListing.id,
                listing_type: selectedListing.type,
                previous_status: selectedListing.verificationStatus,
                new_status: newStatus,
                verified_by: user?.id ?? null,
                notes: verificationNotes.trim() || null,
                verification_method: 'manual',
            });

            if (logError) {
                console.error('Could not write verification log:', logError);
                toast.error('Listing updated, but verification log could not be saved.');
            }

            toast.success(
                dialogAction === 'verify'
                    ? `${selectedListing.name} has been verified`
                    : `${selectedListing.name} has been rejected`
            );

            setShowDialog(false);
            setSelectedListing(null);
            setDialogAction(null);
            setVerificationNotes('');
            loadListings();
        } catch (error) {
            console.error('Verification update failed:', error);
            toast.error('Failed to update verification status');
        }
    };

    const flagStaleListings = async () => {
        setRefreshing(true);
        await loadListings();
        const staleCount = listings.filter((l) => l.isStale).length;
        toast.success(`Stale listing check complete. ${staleCount} listings flagged as stale (90+ days).`);
        setRefreshing(false);
    };

    // Stats from loaded listings
    const stats = {
        total: listings.length,
        pending: listings.filter((l) => l.verificationStatus === 'pending').length,
        verified: listings.filter((l) => l.verificationStatus === 'verified').length,
        rejected: listings.filter((l) => l.verificationStatus === 'rejected').length,
        stale: listings.filter((l) => l.isStale).length,
        lowCompleteness: listings.filter((l) => l.dataCompletenessScore < 50).length,
    };

    const getDaysAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Verification Workflow</h1>
                    <p className="text-muted-foreground">Review and verify business and franchise listings</p>
                </div>
                <Button onClick={flagStaleListings} disabled={refreshing} variant="outline">
                    <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                    Check Stale Listings
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Total</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-muted-foreground">Pending</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-muted-foreground">Verified</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.verified}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <ShieldX className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">Rejected</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-muted-foreground">Stale (90d+)</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{stats.stale}</div>
                    </CardContent>
                </Card>
                <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">Low Data (&lt;50%)</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{stats.lowCompleteness}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search listings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="business">Businesses</SelectItem>
                                <SelectItem value="franchise">Franchises</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={loadListings}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Listings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Listings Queue</CardTitle>
                    <CardDescription>Review listings and update their verification status</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No listings match your filters</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Listing</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data Score</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Flags</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listings.map((listing) => {
                                    const StatusIcon = statusIcons[listing.verificationStatus];
                                    const daysSinceUpdate = getDaysAgo(listing.updatedAt);

                                    return (
                                        <TableRow key={listing.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                        {listing.type === 'business' ? (
                                                            <Store className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{listing.name}</div>
                                                        <div className="text-sm text-muted-foreground">{listing.location}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {listing.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(statusColors[listing.verificationStatus], "gap-1")}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {listing.verificationStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress
                                                        value={listing.dataCompletenessScore}
                                                        className={cn(
                                                            "h-2 w-16",
                                                            listing.dataCompletenessScore < 50 && "[&>div]:bg-red-500"
                                                        )}
                                                    />
                                                    <span className={cn(
                                                        "text-sm",
                                                        listing.dataCompletenessScore < 50 && "text-red-500"
                                                    )}>
                                                        {listing.dataCompletenessScore}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {daysSinceUpdate}d ago
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {listing.isStale && (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Stale
                                                        </Badge>
                                                    )}
                                                    {listing.dataCompletenessScore < 50 && (
                                                        <Badge variant="outline" className="text-red-600 border-red-300">
                                                            <TrendingDown className="h-3 w-3 mr-1" />
                                                            Low Data
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {listing.verificationStatus !== 'verified' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleVerify(listing)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {listing.verificationStatus !== 'rejected' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50"
                                                            onClick={() => handleReject(listing)}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Verification Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogAction === 'verify' ? 'Verify Listing' : 'Reject Listing'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogAction === 'verify'
                                ? `Confirm verification for "${selectedListing?.name}". This listing will be marked as verified.`
                                : `Confirm rejection for "${selectedListing?.name}". Please provide a reason.`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedListing && (
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-sm">
                                    <div><strong>Name:</strong> {selectedListing.name}</div>
                                    <div><strong>Type:</strong> {selectedListing.type}</div>
                                    <div><strong>Data Score:</strong> {selectedListing.dataCompletenessScore}%</div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium">Notes (optional)</label>
                            <Textarea
                                placeholder={dialogAction === 'verify'
                                    ? "Any notes about this verification..."
                                    : "Reason for rejection (will be sent to owner)..."
                                }
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAction}
                            className={dialogAction === 'verify'
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                        >
                            {dialogAction === 'verify' ? 'Confirm Verification' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
