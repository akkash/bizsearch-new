import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Kanban,
    Plus,
    MoreVertical,
    ArrowRight,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Deal {
    id: string;
    title: string;
    client_name: string;
    listing_name: string;
    value: number;
    stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    probability: number;
    expected_close: string;
    last_activity: string;
    notes?: string;
}

const stageConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    lead: { label: 'Lead', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    qualified: { label: 'Qualified', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    proposal: { label: 'Proposal', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    negotiation: { label: 'Negotiation', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    closed_won: { label: 'Won', color: 'text-green-700', bgColor: 'bg-green-100' },
    closed_lost: { label: 'Lost', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];

export function DealPipelinePage() {
    const { user } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [showAddDialog, setShowAddDialog] = useState(false);

    useEffect(() => {
        if (user) {
            loadDeals();
        }
    }, [user]);

    const loadDeals = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('deals')
                .select('*')
                .eq('advisor_id', user.id)
                .order('last_activity', { ascending: false });

            if (error) throw error;
            setDeals(data || []);
        } catch (error) {
            console.error('Error loading deals:', error);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(0)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const getStageDeals = (stage: string) => deals.filter(d => d.stage === stage);

    const getTotalValue = (stageDeals: Deal[]) =>
        stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    const moveToNextStage = async (dealId: string) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        const currentIndex = stages.indexOf(deal.stage);
        if (currentIndex < stages.length - 1) {
            const nextStage = stages[currentIndex + 1] as Deal['stage'];

            try {
                const { error } = await supabase
                    .from('deals')
                    .update({ stage: nextStage, last_activity: new Date().toISOString() })
                    .eq('id', dealId);

                if (error) throw error;

                setDeals(prev => prev.map(d =>
                    d.id === dealId ? { ...d, stage: nextStage } : d
                ));
                toast.success(`Deal moved to ${stageConfig[nextStage].label}`);
            } catch (error) {
                toast.error('Failed to update deal');
            }
        }
    };

    const pipelineStats = {
        totalDeals: deals.filter(d => d.stage !== 'closed_lost').length,
        totalValue: deals.filter(d => d.stage !== 'closed_lost' && d.stage !== 'closed_won')
            .reduce((sum, d) => sum + (d.value || 0), 0),
        weightedValue: deals.filter(d => d.stage !== 'closed_lost' && d.stage !== 'closed_won')
            .reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0),
        wonValue: deals.filter(d => d.stage === 'closed_won')
            .reduce((sum, d) => sum + (d.value || 0), 0),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Kanban className="h-6 w-6 text-primary" />
                        Deal Pipeline
                    </h1>
                    <p className="text-muted-foreground">Track and manage your active deals</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'kanban' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('kanban')}
                    >
                        Kanban
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        List
                    </Button>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Deal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Deal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Deal Title</Label>
                                    <Input placeholder="e.g., Tech Startup Acquisition" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Client</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Rajesh Kumar</SelectItem>
                                                <SelectItem value="2">Priya Sharma</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deal Value</Label>
                                        <Input type="number" placeholder="₹" />
                                    </div>
                                </div>
                                <Button className="w-full" onClick={() => {
                                    toast.success('Deal created');
                                    setShowAddDialog(false);
                                }}>
                                    Create Deal
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{pipelineStats.totalDeals}</p>
                        <p className="text-sm text-muted-foreground">Active Deals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{formatCurrency(pipelineStats.totalValue)}</p>
                        <p className="text-sm text-muted-foreground">Pipeline Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{formatCurrency(pipelineStats.weightedValue)}</p>
                        <p className="text-sm text-muted-foreground">Weighted Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(pipelineStats.wonValue)}</p>
                        <p className="text-sm text-muted-foreground">Won (This Month)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid gap-4 lg:grid-cols-5 overflow-x-auto">
                    {stages.map((stage) => {
                        const stageDeals = getStageDeals(stage);
                        const config = stageConfig[stage];
                        return (
                            <div key={stage} className="min-w-[280px]">
                                <div className={cn('p-3 rounded-t-lg', config.bgColor)}>
                                    <div className="flex items-center justify-between">
                                        <span className={cn('font-medium', config.color)}>{config.label}</span>
                                        <Badge variant="secondary">{stageDeals.length}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {formatCurrency(getTotalValue(stageDeals))}
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-b-lg min-h-[400px] space-y-2">
                                    {stageDeals.map((deal) => (
                                        <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-medium text-sm line-clamp-1">{deal.title}</h4>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => moveToNextStage(deal.id)}>
                                                                <ArrowRight className="h-4 w-4 mr-2" />
                                                                Move to Next Stage
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">{deal.listing_name}</p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs">{deal.client_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{deal.client_name}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-primary">
                                                        {formatCurrency(deal.value)}
                                                    </span>
                                                    <span className="text-muted-foreground">{deal.probability}%</span>
                                                </div>
                                                <Progress value={deal.probability} className="h-1 mt-2" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {deals.filter(d => d.stage !== 'closed_lost').map((deal) => {
                                const config = stageConfig[deal.stage];
                                return (
                                    <div key={deal.id} className="p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-medium">{deal.title}</h4>
                                                    <Badge className={cn(config.bgColor, config.color)}>{config.label}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {deal.client_name} • {deal.listing_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(deal.value)}</p>
                                                <p className="text-sm text-muted-foreground">{deal.probability}% probability</p>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => moveToNextStage(deal.id)}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
