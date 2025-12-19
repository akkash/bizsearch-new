import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    TrendingUp,
    DollarSign,
    Target,
    Plus,
    ArrowUpRight,
    Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdvisorService, type DashboardStats, type Deal, type AdvisorClient, DEAL_STAGES } from '@/lib/advisor-service';
import { formatDistanceToNow } from 'date-fns';

const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
};

export function AdvisorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
    const [recentClients, setRecentClients] = useState<AdvisorClient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [statsData, deals, clients] = await Promise.all([
                AdvisorService.getDashboardStats(user.id),
                AdvisorService.getDeals(user.id),
                AdvisorService.getClients(user.id),
            ]);
            setStats(statsData);
            setRecentDeals(deals.slice(0, 5));
            setRecentClients(clients.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link to="/advisor/clients">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Client
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to="/advisor/deals">
                            <Plus className="h-4 w-4 mr-2" />
                            New Deal
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.activeClients || 0} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.pipelineValue || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.totalDeals || 0} active deals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Deals Won</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.wonValue || 0)}</div>
                        <p className="text-xs text-muted-foreground">Total closed value</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.pendingCommissions || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats?.paidCommissions || 0)} paid
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Deals */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Deals</CardTitle>
                            <CardDescription>Your latest deal activity</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/advisor/deals">
                                View all <ArrowUpRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentDeals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No deals yet</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link to="/advisor/deals">Create your first deal</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentDeals.map((deal) => {
                                    const stage = DEAL_STAGES.find(s => s.value === deal.stage);
                                    return (
                                        <div key={deal.id} className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{deal.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(deal.value)} • {formatDistanceToNow(new Date(deal.last_activity), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <Badge className={stage?.color}>{stage?.label}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Clients */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Clients</CardTitle>
                            <CardDescription>Your latest client contacts</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/advisor/clients">
                                View all <ArrowUpRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentClients.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No clients yet</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link to="/advisor/clients">Add your first client</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentClients.map((client) => (
                                    <div key={client.id} className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{client.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                                        </div>
                                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                            {client.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
