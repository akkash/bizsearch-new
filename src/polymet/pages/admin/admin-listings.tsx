import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Loader2,
    Building2,
    Store,
    Clock,
} from 'lucide-react';
import { AdminService, type AdminListing } from '@/lib/admin-service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
    pending_review: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    sold: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-600',
};

export function AdminListings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState<AdminListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        listing: AdminListing | null;
        action: 'approve' | 'reject';
    }>({ open: false, listing: null, action: 'approve' });

    const statusFilter = searchParams.get('status') || 'pending_review';
    const typeFilter = searchParams.get('type') || 'all';

    useEffect(() => {
        loadListings();
    }, [statusFilter, typeFilter]);

    const loadListings = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getPendingListings({
                status: statusFilter as any,
                type: typeFilter as any,
            });
            setListings(data);
        } catch (error) {
            console.error('Error loading listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (listing: AdminListing) => {
        try {
            await AdminService.approveListing(listing.id, listing.type);
            toast.success(`${listing.name} has been approved`);
            loadListings();
        } catch (error) {
            toast.error('Failed to approve listing');
        }
        setActionDialog({ open: false, listing: null, action: 'approve' });
    };

    const handleReject = async (listing: AdminListing) => {
        try {
            await AdminService.rejectListing(listing.id, listing.type, 'Rejected by admin');
            toast.success(`${listing.name} has been rejected`);
            loadListings();
        } catch (error) {
            toast.error('Failed to reject listing');
        }
        setActionDialog({ open: false, listing: null, action: 'reject' });
    };

    const setStatus = (status: string) => {
        searchParams.set('status', status);
        setSearchParams(searchParams);
    };

    const setType = (type: string) => {
        searchParams.set('type', type);
        setSearchParams(searchParams);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Listing Moderation</h1>
                <p className="text-muted-foreground">Review and approve pending listings</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <Tabs value={statusFilter} onValueChange={setStatus}>
                            <TabsList>
                                <TabsTrigger value="pending_review" className="gap-2">
                                    <Clock className="h-4 w-4" />
                                    Pending
                                </TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                                <TabsTrigger value="all">All</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Tabs value={typeFilter} onValueChange={setType}>
                            <TabsList>
                                <TabsTrigger value="all">All Types</TabsTrigger>
                                <TabsTrigger value="business" className="gap-2">
                                    <Store className="h-4 w-4" />
                                    Business
                                </TabsTrigger>
                                <TabsTrigger value="franchise" className="gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Franchise
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No listings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Listing</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listings.map((listing) => (
                                        <TableRow key={`${listing.type}-${listing.id}`}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{listing.name}</p>
                                                    <p className="text-sm text-muted-foreground">{listing.industry}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={listing.type === 'franchise' ? 'default' : 'secondary'}>
                                                    {listing.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{listing.owner.display_name}</p>
                                                    <p className="text-xs text-muted-foreground">{listing.owner.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[listing.status] || ''}>
                                                    {listing.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {listing.status === 'pending_review' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-green-600"
                                                                onClick={() => setActionDialog({ open: true, listing, action: 'approve' })}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600"
                                                                onClick={() => setActionDialog({ open: true, listing, action: 'reject' })}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/${listing.type}/${listing.id}`}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Preview
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={actionDialog.open}
                onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionDialog.action === 'approve' ? 'Approve Listing' : 'Reject Listing'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.action === 'approve'
                                ? `Are you sure you want to approve "${actionDialog.listing?.name}"? It will be visible to all users.`
                                : `Are you sure you want to reject "${actionDialog.listing?.name}"? The owner will be notified.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                actionDialog.action === 'approve'
                                    ? handleApprove(actionDialog.listing!)
                                    : handleReject(actionDialog.listing!)
                            }
                            className={actionDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
