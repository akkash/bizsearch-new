import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    MoreVertical,
    Calendar,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    Loader2,
    MessageSquare,
    ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

interface Application {
    id: string;
    franchise_id: string;
    user_id: string;
    status: string;
    personal_info: any;
    financial_info: any;
    location_preferences: any;
    experience_info: any;
    notes: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
    applicant: {
        id: string;
        display_name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
    };
    franchise: {
        id: string;
        brand_name: string;
        logo_url: string | null;
    };
}

interface Franchise {
    id: string;
    brand_name: string;
    logo_url: string | null;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted' },
    under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Under Review' },
    interview_scheduled: { color: 'bg-purple-100 text-purple-800', icon: Calendar, label: 'Interview Scheduled' },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
    withdrawn: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Withdrawn' },
};

export function FranchisorApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFranchise, setSelectedFranchise] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');
    const [statusNotes, setStatusNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (user) {
            loadFranchises();
        }
    }, [user]);

    useEffect(() => {
        if (user && franchises.length > 0) {
            loadApplications();
        }
    }, [user, franchises, selectedFranchise, statusFilter]);

    const loadFranchises = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('franchises')
            .select('id, brand_name, logo_url')
            .eq('franchisor_id', user.id);

        if (!error && data) {
            setFranchises(data);
        }
    };

    const loadApplications = async () => {
        if (!user || franchises.length === 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const franchiseIds = franchises.map(f => f.id);

        let query = supabase
            .from('franchise_applications')
            .select(`
                id,
                franchise_id,
                user_id,
                status,
                personal_info,
                financial_info,
                location_preferences,
                experience_info,
                notes,
                reviewed_by,
                reviewed_at,
                created_at,
                updated_at,
                applicant:profiles!user_id (
                    id,
                    display_name,
                    email,
                    phone,
                    avatar_url
                ),
                franchise:franchises!franchise_id (
                    id,
                    brand_name,
                    logo_url
                )
            `)
            .in('franchise_id', franchiseIds)
            .order('created_at', { ascending: false });

        if (selectedFranchise !== 'all') {
            query = query.eq('franchise_id', selectedFranchise);
        }

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (!error && data) {
            setApplications(data as unknown as Application[]);
        }
        setLoading(false);
    };

    const updateApplicationStatus = async () => {
        if (!selectedApp || !newStatus || !user) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('franchise_applications')
                .update({
                    status: newStatus,
                    notes: statusNotes || selectedApp.notes,
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', selectedApp.id);

            if (error) throw error;

            toast.success(`Application ${newStatus.replace('_', ' ')}`);
            setShowStatusDialog(false);
            setSelectedApp(null);
            setNewStatus('');
            setStatusNotes('');
            loadApplications();
        } catch (error) {
            console.error('Error updating application:', error);
            toast.error('Failed to update application');
        } finally {
            setUpdating(false);
        }
    };

    const openStatusDialog = (app: Application, status: string) => {
        setSelectedApp(app);
        setNewStatus(status);
        setStatusNotes(app.notes || '');
        setShowStatusDialog(true);
    };

    const viewApplicationDetails = (app: Application) => {
        setSelectedApp(app);
        setShowDetailDialog(true);
    };

    const stats = {
        total: applications.length,
        pending: applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    if (loading && franchises.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (franchises.length === 0) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <Card>
                    <CardContent className="py-16 text-center">
                        <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Franchises Found</h2>
                        <p className="text-muted-foreground mb-4">
                            You need to create a franchise listing first to receive applications.
                        </p>
                        <Link to="/add-franchise-listing">
                            <Button>Create Franchise Listing</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/my-listings">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Franchise Applications
                        </h1>
                        <p className="text-muted-foreground">Review and manage applicants</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Approved</p>
                                <p className="text-2xl font-bold">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="submitted">New</TabsTrigger>
                        <TabsTrigger value="under_review">In Review</TabsTrigger>
                        <TabsTrigger value="interview_scheduled">Interview</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                </Tabs>

                {franchises.length > 1 && (
                    <select
                        value={selectedFranchise}
                        onChange={(e) => setSelectedFranchise(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        <option value="all">All Franchises</option>
                        {franchises.map(f => (
                            <option key={f.id} value={f.id}>{f.brand_name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Applications List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : applications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No Applications Yet</h3>
                        <p className="text-muted-foreground">
                            Applications will appear here when candidates apply to your franchises.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const status = statusConfig[app.status] || statusConfig.submitted;
                        const StatusIcon = status.icon;

                        return (
                            <Card key={app.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={app.applicant?.avatar_url || ''} />
                                            <AvatarFallback>
                                                {app.applicant?.display_name?.charAt(0) || app.personal_info?.fullName?.charAt(0) || 'A'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {app.applicant?.display_name || app.personal_info?.fullName || 'Unknown Applicant'}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Applied for {app.franchise?.brand_name}
                                                    </p>
                                                </div>
                                                <Badge className={`${status.color} flex items-center gap-1`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                                                {(app.applicant?.email || app.personal_info?.email) && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {app.applicant?.email || app.personal_info?.email}
                                                    </span>
                                                )}
                                                {(app.applicant?.phone || app.personal_info?.phone) && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        {app.applicant?.phone || app.personal_info?.phone}
                                                    </span>
                                                )}
                                                {app.location_preferences?.preferredCity && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {app.location_preferences.preferredCity}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => viewApplicationDetails(app)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {app.status === 'submitted' && (
                                                        <DropdownMenuItem onClick={() => openStatusDialog(app, 'under_review')}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Mark as Under Review
                                                        </DropdownMenuItem>
                                                    )}
                                                    {['submitted', 'under_review'].includes(app.status) && (
                                                        <DropdownMenuItem onClick={() => openStatusDialog(app, 'interview_scheduled')}>
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            Schedule Interview
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {!['approved', 'rejected', 'withdrawn'].includes(app.status) && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => openStatusDialog(app, 'approved')}
                                                                className="text-green-600"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openStatusDialog(app, 'rejected')}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <MessageSquare className="h-4 w-4 mr-2" />
                                                        Message Applicant
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Application Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                        <DialogDescription>
                            Review the applicant's information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApp && (
                        <div className="space-y-6">
                            {/* Applicant Info */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-2 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-muted-foreground">Name:</span>
                                            <p className="font-medium">{selectedApp.personal_info?.fullName || selectedApp.applicant?.display_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Email:</span>
                                            <p className="font-medium">{selectedApp.personal_info?.email || selectedApp.applicant?.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Phone:</span>
                                            <p className="font-medium">{selectedApp.personal_info?.phone || selectedApp.applicant?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">City:</span>
                                            <p className="font-medium">{selectedApp.personal_info?.city || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Info */}
                            {selectedApp.financial_info && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Financial Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-2 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-muted-foreground">Investment Capacity:</span>
                                                <p className="font-medium">₹{(selectedApp.financial_info.investmentCapacity || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Funding Source:</span>
                                                <p className="font-medium capitalize">{selectedApp.financial_info.fundingSource || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Experience Info */}
                            {selectedApp.experience_info && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p>{selectedApp.experience_info.businessExperience || 'No experience provided'}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {selectedApp.notes && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p>{selectedApp.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Timeline */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Applied:</span>
                                        <span>{format(new Date(selectedApp.created_at), 'PPP')}</span>
                                    </div>
                                    {selectedApp.reviewed_at && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Reviewed:</span>
                                            <span>{format(new Date(selectedApp.reviewed_at), 'PPP')}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                            Close
                        </Button>
                        {selectedApp && !['approved', 'rejected', 'withdrawn'].includes(selectedApp.status) && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setShowDetailDialog(false);
                                        openStatusDialog(selectedApp, 'rejected');
                                    }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowDetailDialog(false);
                                        openStatusDialog(selectedApp, 'approved');
                                    }}
                                >
                                    Approve
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Update Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {newStatus === 'approved' ? 'Approve Application' :
                                newStatus === 'rejected' ? 'Reject Application' :
                                    newStatus === 'under_review' ? 'Mark as Under Review' :
                                        newStatus === 'interview_scheduled' ? 'Schedule Interview' :
                                            'Update Status'}
                        </DialogTitle>
                        <DialogDescription>
                            {newStatus === 'approved'
                                ? 'This will notify the applicant that their application has been approved.'
                                : newStatus === 'rejected'
                                    ? 'This will notify the applicant that their application was not successful.'
                                    : 'Update notes and proceed with the status change.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Textarea
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                placeholder="Add internal notes about this decision..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={updateApplicationStatus}
                            disabled={updating}
                            variant={newStatus === 'rejected' ? 'destructive' : 'default'}
                        >
                            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {newStatus === 'approved' ? 'Approve' :
                                newStatus === 'rejected' ? 'Reject' :
                                    'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
