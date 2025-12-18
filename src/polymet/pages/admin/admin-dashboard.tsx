import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { AdminService, type PlatformStats, type AdminListing, type AdminDocument } from '@/lib/admin-service';

export function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [pendingListings, setPendingListings] = useState<AdminListing[]>([]);
    const [pendingDocs, setPendingDocs] = useState<AdminDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, listingsData, docsData] = await Promise.all([
                    AdminService.getPlatformStats(),
                    AdminService.getPendingListings({ status: 'pending_review', limit: 5 }),
                    AdminService.getPendingDocuments(),
                ]);
                setStats(statsData);
                setPendingListings(listingsData.slice(0, 5));
                setPendingDocs(docsData.slice(0, 5));
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

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
            color: 'text-green-600 bg-green-100',
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
            color: 'text-purple-600 bg-purple-100',
            urgent: (stats?.pendingDocuments || 0) > 0,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-6 border">
                <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor platform activity, moderate content, and manage users.
                </p>
            </div>

            {/* Stats Grid */}
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

            {/* Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Listings */}
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
                                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No pending listings</p>
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

                {/* Pending Documents */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-purple-600" />
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
                                <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No pending documents</p>
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

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
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
                            <div className="p-3 rounded-lg bg-green-100 text-green-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.totalFranchises || 0}</p>
                                <p className="text-sm text-muted-foreground">Franchises</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Fraud Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
