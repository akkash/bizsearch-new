import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    DollarSign,
    Loader2,
    TrendingUp,
    Clock,
    CheckCircle,
    Wallet,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdvisorService, type Commission } from '@/lib/advisor-service';
import { format } from 'date-fns';
import { toast } from 'sonner';

const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString()}`;
};

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: Wallet },
};

export function AdvisorCommissions() {
    const { user } = useAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPeriod, setFilterPeriod] = useState<string>('all');

    useEffect(() => {
        if (user) loadCommissions();
    }, [user]);

    const loadCommissions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await AdvisorService.getCommissions(user.id);
            setCommissions(data);
        } catch (error) {
            console.error('Error loading commissions:', error);
            toast.error('Failed to load commissions');
        } finally {
            setLoading(false);
        }
    };

    const filteredCommissions = commissions.filter((c) => {
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;

        let matchesPeriod = true;
        if (filterPeriod !== 'all') {
            const closedDate = new Date(c.closed_date);
            const now = new Date();
            if (filterPeriod === 'thisMonth') {
                matchesPeriod =
                    closedDate.getMonth() === now.getMonth() &&
                    closedDate.getFullYear() === now.getFullYear();
            } else if (filterPeriod === 'thisQuarter') {
                const quarter = Math.floor(now.getMonth() / 3);
                const closedQuarter = Math.floor(closedDate.getMonth() / 3);
                matchesPeriod = closedQuarter === quarter && closedDate.getFullYear() === now.getFullYear();
            } else if (filterPeriod === 'thisYear') {
                matchesPeriod = closedDate.getFullYear() === now.getFullYear();
            }
        }

        return matchesStatus && matchesPeriod;
    });

    const totals = {
        pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0),
        approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commission_amount, 0),
        paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0),
        total: commissions.reduce((sum, c) => sum + c.commission_amount, 0),
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
            <div>
                <h1 className="text-2xl font-bold">Commissions</h1>
                <p className="text-muted-foreground">Track your earnings from closed deals</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.approved)}</div>
                        <p className="text-xs text-muted-foreground">Ready for payout</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-950">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
                        <p className="text-xs text-muted-foreground">Received</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="thisQuarter">This Quarter</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Commissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Commission History
                    </CardTitle>
                    <CardDescription>
                        {filteredCommissions.length} commission{filteredCommissions.length !== 1 ? 's' : ''} •{' '}
                        {formatCurrency(filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0))} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCommissions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>{commissions.length === 0 ? 'No commissions yet' : 'No matching commissions'}</p>
                            <p className="text-sm mt-1">
                                {commissions.length === 0 && 'Close a deal to earn your first commission'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deal</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead className="text-right">Deal Value</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead className="text-right">Commission</TableHead>
                                    <TableHead>Closed</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCommissions.map((comm) => {
                                    const status = statusConfig[comm.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <TableRow key={comm.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{comm.deal_title}</p>
                                                    {comm.listing_name && (
                                                        <p className="text-sm text-muted-foreground">{comm.listing_name}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {comm.client_name || '—'}
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(comm.deal_value)}</TableCell>
                                            <TableCell className="text-right">{comm.commission_rate}%</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(comm.commission_amount)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(comm.closed_date), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={status.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
