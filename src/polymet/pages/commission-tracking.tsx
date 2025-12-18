import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DollarSign,
    Download,
    CheckCircle,
    Clock,
    Percent,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Commission {
    id: string;
    deal_title: string;
    listing_name: string;
    client_name: string;
    deal_value: number;
    commission_rate: number;
    commission_amount: number;
    status: 'pending' | 'approved' | 'paid';
    closed_date: string;
    payment_date: string | null;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    paid: { color: 'bg-green-100 text-green-800', icon: DollarSign },
};

export function CommissionTrackingPage() {
    const { user } = useAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (user) {
            loadCommissions();
        }
    }, [user]);

    const loadCommissions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('commissions')
                .select('*')
                .eq('advisor_id', user.id)
                .order('closed_date', { ascending: false });

            if (error) throw error;
            setCommissions(data || []);
        } catch (error) {
            console.error('Error loading commissions:', error);
            setCommissions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const filteredCommissions = commissions.filter(c =>
        statusFilter === 'all' || c.status === statusFilter
    );

    const stats = {
        totalEarned: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        avgRate: commissions.length > 0 ? commissions.reduce((sum, c) => sum + (c.commission_rate || 0), 0) / commissions.length : 0,
        totalDeals: commissions.length,
        totalDealValue: commissions.reduce((sum, c) => sum + (c.deal_value || 0), 0),
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
                        <DollarSign className="h-6 w-6 text-primary" />
                        Commission Tracking
                    </h1>
                    <p className="text-muted-foreground">Track your earnings from closed deals</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Earned</p>
                                <p className="text-3xl font-bold text-green-700">{formatCurrency(stats.totalEarned)}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Approved</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.approved)}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Commission Rate</p>
                                <p className="text-2xl font-bold">{stats.avgRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Percent className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="commissions">
                <TabsList className="mb-6">
                    <TabsTrigger value="commissions">Commissions</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="commissions">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Commission History</CardTitle>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deal</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead className="text-right">Deal Value</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">Commission</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Closed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCommissions.map((commission) => {
                                        const status = statusConfig[commission.status];
                                        const StatusIcon = status.icon;
                                        return (
                                            <TableRow key={commission.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{commission.deal_title}</p>
                                                        <p className="text-xs text-muted-foreground">{commission.listing_name}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{commission.client_name}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(commission.deal_value)}</TableCell>
                                                <TableCell className="text-right">{commission.commission_rate}%</TableCell>
                                                <TableCell className="text-right font-semibold text-primary">
                                                    {formatCurrency(commission.commission_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={status.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {commission.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {format(new Date(commission.closed_date), 'MMM d, yyyy')}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="summary">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Deals Closed</span>
                                        <span className="font-semibold">{stats.totalDeals}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Deal Value</span>
                                        <span className="font-semibold">{formatCurrency(stats.totalDealValue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Commissions</span>
                                        <span className="font-semibold text-primary">
                                            {formatCurrency(stats.totalEarned + stats.pending + stats.approved)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Average Deal Size</span>
                                        <span className="font-semibold">{formatCurrency(stats.totalDealValue / stats.totalDeals)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Commission Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-600">Paid</span>
                                            <span>{formatCurrency(stats.totalEarned)}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{ width: `${(stats.totalEarned / (stats.totalEarned + stats.pending + stats.approved)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-blue-600">Approved (Awaiting Payment)</span>
                                            <span>{formatCurrency(stats.approved)}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(stats.approved / (stats.totalEarned + stats.pending + stats.approved)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-yellow-600">Pending Approval</span>
                                            <span>{formatCurrency(stats.pending)}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500 rounded-full"
                                                style={{ width: `${(stats.pending / (stats.totalEarned + stats.pending + stats.approved)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
