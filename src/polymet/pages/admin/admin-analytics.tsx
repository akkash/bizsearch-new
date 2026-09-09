import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import {
    Users,
    Building2,
    TrendingUp,
    Calendar,
    Loader2,
    MessageSquare,
} from 'lucide-react';
import { AdminService, type PlatformStats, type AnalyticsTrendPoint } from '@/lib/admin-service';

const chartConfig = {
    users: { label: 'Signups', color: 'hsl(var(--chart-1))' },
    businesses: { label: 'Businesses', color: 'hsl(var(--chart-2))' },
    franchises: { label: 'Franchises', color: 'hsl(var(--chart-3))' },
    inquiries: { label: 'Inquiries', color: 'hsl(var(--chart-4))' },
    listings: { label: 'Listings', color: 'hsl(var(--chart-2))' },
};

export function AdminAnalytics() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [trends, setTrends] = useState<AnalyticsTrendPoint[]>([]);
    const [days, setDays] = useState('14');
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const dayCount = parseInt(days, 10);
            const [statsData, trendsData] = await Promise.all([
                AdminService.getPlatformStats(),
                AdminService.getAnalyticsTrends(dayCount),
            ]);
            setStats(statsData);
            setTrends(
                trendsData.map((t) => ({
                    ...t,
                    listings: t.businesses + t.franchises,
                    label: t.date.slice(5),
                }))
            );
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
            color: 'text-growth-green bg-growth-green/10',
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Platform performance and metrics</p>
                </div>
                <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="14">Last 14 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trends.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                <p>No details found in the table.</p>
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="h-64 w-full">
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Listings Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {trends.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                <p>No details found in the table.</p>
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="h-64 w-full">
                                <BarChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="businesses" fill="var(--color-businesses)" stackId="listings" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="franchises" fill="var(--color-franchises)" stackId="listings" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Inquiries Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {trends.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                            <p>No details found in the table.</p>
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-48 w-full">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="inquiries" stroke="var(--color-inquiries)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

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
                            <p className="text-2xl font-bold text-growth-green">{stats?.pendingDocuments || 0}</p>
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
