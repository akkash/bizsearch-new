import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Building2,
    TrendingUp,
    Calendar,
    Loader2,
} from 'lucide-react';
import { AdminService, type PlatformStats } from '@/lib/admin-service';

export function AdminAnalytics() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await AdminService.getPlatformStats();
                setStats(data);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const metrics = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            subtitle: `+${stats?.newUsersThisWeek || 0} this week`,
            icon: Users,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            title: 'Total Businesses',
            value: stats?.totalBusinesses || 0,
            subtitle: 'Listed on platform',
            icon: Building2,
            color: 'text-green-600 bg-green-100',
        },
        {
            title: 'Total Franchises',
            value: stats?.totalFranchises || 0,
            subtitle: 'Listed on platform',
            icon: TrendingUp,
            color: 'text-purple-600 bg-purple-100',
        },
        {
            title: 'New This Week',
            value: stats?.newListingsThisWeek || 0,
            subtitle: 'Businesses + Franchises',
            icon: Calendar,
            color: 'text-orange-600 bg-orange-100',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Platform performance and metrics</p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <Card key={metric.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                                    <p className="text-3xl font-bold mt-1">{metric.value.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${metric.color}`}>
                                    <metric.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Signups Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                                <p className="text-sm">Connect to analytics service for detailed charts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Listings Created Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Chart visualization coming soon</p>
                                <p className="text-sm">Connect to analytics service for detailed charts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{stats?.pendingListings || 0}</p>
                            <p className="text-sm text-muted-foreground">Pending Listings</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{stats?.pendingDocuments || 0}</p>
                            <p className="text-sm text-muted-foreground">Pending Documents</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                                {((stats?.totalBusinesses || 0) + (stats?.totalFranchises || 0)).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Listings</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
