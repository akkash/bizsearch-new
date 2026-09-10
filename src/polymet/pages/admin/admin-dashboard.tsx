import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Users,
    Building2,
    FileCheck,
    TrendingUp,
    Clock,
    AlertTriangle,
    ArrowRight,
    Loader2,
    RefreshCw,
    Activity,
} from 'lucide-react';
import {
    AdminService,
    type PlatformStats,
    type AdminListing,
    type AdminDocument,
    type ActivityLog,
} from '@/lib/admin-service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [pendingListings, setPendingListings] = useState<AdminListing[]>([]);
    const [pendingDocs, setPendingDocs] = useState<AdminDocument[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [statsData, listingsData, docsData, logsData] = await Promise.all([
                AdminService.getPlatformStats(),
                AdminService.getPendingListings({ status: 'pending_review', limit: 5 }),
                AdminService.getPendingDocuments(),
                AdminService.getActivityLogs(20),
            ]);
            setStats(statsData);
            setPendingListings(listingsData.slice(0, 5));
            setPendingDocs(docsData.slice(0, 5));
            setActivityLogs(logsData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadData(true), 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            change: `+${stats?.newUsersThisWeek || 0} this week`,
            icon: Users,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            title: 'Total Listings',
            value: (stats?.totalBusinesses || 0) + (stats?.totalFranchises || 0),
            change: `+${stats?.newListingsThisWeek || 0} this week`,
            icon: Building2,
            color: 'text-foreground bg-secondary',
        },
        {
            title: 'Pending Review',
            value: stats?.pendingListings || 0,
            change: 'needs attention',
            icon: Clock,
            color: 'text-yellow-600 bg-yellow-100',
            urgent: (stats?.pendingListings || 0) > 0,
        },
        {
            title: 'Pending Documents',
            value: stats?.pendingDocuments || 0,
            change: 'awaiting verification',
            icon: FileCheck,
            color: 'text-growth-green bg-growth-green/10',
            urgent: (stats?.pendingDocuments || 0) > 0,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-card rounded-lg p-6 border border-border">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor platform activity, moderate content, and manage users.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className={stat.urgent ? 'border-yellow-400' : ''}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            Pending Listings
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/admin/listings?status=pending_review">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pendingListings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No details found in the table.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-64">
                                <div className="space-y-3">
                                    {pendingListings.map((listing) => (
                                        <div
                                            key={listing.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{listing.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    by {listing.owner.display_name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={listing.type === 'franchise' ? 'default' : 'secondary'}>
                                                    {listing.type}
                                                </Badge>
                                                <Button size="sm" asChild>
                                                    <Link to={`/admin/listings/${listing.type}/${listing.id}`}>
                                                        Review
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-growth-green" />
                            Pending Documents
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/admin/documents">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pendingDocs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No details found in the table.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-64">
                                <div className="space-y-3">
                                    {pendingDocs.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{doc.file_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    by {doc.profile.display_name}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{doc.document_type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.totalBusinesses || 0}</p>
                                <p className="text-sm text-muted-foreground">Businesses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-secondary text-foreground">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.totalFranchises || 0}</p>
                                <p className="text-sm text-muted-foreground">Franchises</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={(stats?.pendingFraudAlerts || 0) > 0 ? 'border-red-400' : ''}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats?.pendingFraudAlerts || 0}</p>
                                    <p className="text-sm text-muted-foreground">Fraud Alerts</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/admin/fraud">View</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Admin Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activityLogs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No details found in the table.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-72">
                            <div className="space-y-3">
                                {activityLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start justify-between p-3 bg-muted/50 rounded-lg gap-4"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">
                                                {log.profile?.display_name || 'System'}{' '}
                                                <span className="text-muted-foreground font-normal">
                                                    — {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </p>
                                            {log.entity_type && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {log.entity_type}
                                                    {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}…` : ''}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
