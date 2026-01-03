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

const mockListings: Listing[] = [
    {
        id: '1',
        name: 'Mumbai Cafe Chain',
        type: 'business',
        industry: 'Food & Beverage',
        location: 'Mumbai, Maharashtra',
        verificationStatus: 'pending',
        dataCompletenessScore: 72,
        createdAt: '2025-11-15',
        updatedAt: '2025-12-20',
        verifiedAt: null,
        isStale: false,
        ownerEmail: 'owner@cafe.com',
    },
    {
        id: '2',
        name: '5K Car Care',
        type: 'franchise',
        industry: 'Automotive',
        location: 'Delhi, NCR',
        verificationStatus: 'verified',
        dataCompletenessScore: 95,
        createdAt: '2024-06-01',
        updatedAt: '2025-12-28',
        verifiedAt: '2025-12-15',
        isStale: false,
        ownerEmail: 'franchise@5k.com',
    },
    {
        id: '3',
        name: 'Old Retail Shop',
        type: 'business',
        industry: 'Retail',
        location: 'Chennai, Tamil Nadu',
        verificationStatus: 'unverified',
        dataCompletenessScore: 35,
        createdAt: '2024-01-10',
        updatedAt: '2024-08-15',
        verifiedAt: null,
        isStale: true,
        ownerEmail: 'old@retail.com',
    },
];

const statusColors = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    unverified: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const statusIcons = {
    pending: Clock,
    verified: ShieldCheck,
    rejected: ShieldX,
    unverified: Shield,
};

export function AdminVerification() {
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
        // TODO: Replace with actual Supabase query
        await new Promise(resolve => setTimeout(resolve, 500));

        let filtered = [...mockListings];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(l => l.verificationStatus === statusFilter);
        }
        if (typeFilter !== 'all') {
            filtered = filtered.filter(l => l.type === typeFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(l =>
                l.name.toLowerCase().includes(query) ||
                l.location.toLowerCase().includes(query)
            );
        }

        setListings(filtered);
        setLoading(false);
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

        // TODO: Call actual API
        const newStatus = dialogAction === 'verify' ? 'verified' : 'rejected';

        setListings(prev => prev.map(l =>
            l.id === selectedListing.id
                ? { ...l, verificationStatus: newStatus as any, verifiedAt: new Date().toISOString() }
                : l
        ));

        toast.success(
            dialogAction === 'verify'
                ? `${selectedListing.name} has been verified`
                : `${selectedListing.name} has been rejected`
        );

        setShowDialog(false);
        setSelectedListing(null);
        setDialogAction(null);
        setVerificationNotes('');
    };

    const flagStaleListings = async () => {
        setRefreshing(true);
        // TODO: Call actual API to run stale listing check
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Stale listing check complete. 3 listings flagged.');
        setRefreshing(false);
        loadListings();
    };

    // Stats
    const stats = {
        total: mockListings.length,
        pending: mockListings.filter(l => l.verificationStatus === 'pending').length,
        verified: mockListings.filter(l => l.verificationStatus === 'verified').length,
        rejected: mockListings.filter(l => l.verificationStatus === 'rejected').length,
        stale: mockListings.filter(l => l.isStale).length,
        lowCompleteness: mockListings.filter(l => l.dataCompletenessScore < 50).length,
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
