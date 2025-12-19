import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TrendingUp,
    Plus,
    Loader2,
    DollarSign,
    Calendar,
    User,
    Edit,
    Trash2,
    ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    AdvisorService,
    type Deal,
    type AdvisorClient,
    DEAL_STAGES,
    type DealStage,
} from '@/lib/advisor-service';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
};

interface DealFormData {
    title: string;
    client_id: string;
    listing_name: string;
    listing_type: 'business' | 'franchise';
    value: string;
    stage: DealStage;
    expected_close: string;
    notes: string;
}

const defaultFormData: DealFormData = {
    title: '',
    client_id: '',
    listing_name: '',
    listing_type: 'business',
    value: '',
    stage: 'lead',
    expected_close: '',
    notes: '',
};

export function AdvisorDeals() {
    const { user } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [clients, setClients] = useState<AdvisorClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [formData, setFormData] = useState<DealFormData>(defaultFormData);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [dealsData, clientsData] = await Promise.all([
                AdvisorService.getDeals(user.id),
                AdvisorService.getClients(user.id),
            ]);
            setDeals(dealsData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading deals:', error);
            toast.error('Failed to load deals');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (deal?: Deal) => {
        if (deal) {
            setEditingDeal(deal);
            setFormData({
                title: deal.title,
                client_id: deal.client_id || '',
                listing_name: deal.listing_name || '',
                listing_type: deal.listing_type || 'business',
                value: deal.value.toString(),
                stage: deal.stage,
                expected_close: deal.expected_close || '',
                notes: deal.notes || '',
            });
        } else {
            setEditingDeal(null);
            setFormData(defaultFormData);
        }
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!user || !formData.title || !formData.value) {
            toast.error('Title and value are required');
            return;
        }

        setSaving(true);
        try {
            const dealData = {
                title: formData.title,
                client_id: formData.client_id || undefined,
                listing_name: formData.listing_name || undefined,
                listing_type: formData.listing_type,
                value: parseInt(formData.value),
                stage: formData.stage,
                probability: AdvisorService.getStageProbability(formData.stage),
                expected_close: formData.expected_close || undefined,
                notes: formData.notes || undefined,
            };

            if (editingDeal) {
                await AdvisorService.updateDeal(editingDeal.id, dealData);
                toast.success('Deal updated');
            } else {
                await AdvisorService.createDeal(user.id, dealData);
                toast.success('Deal created');
            }

            setShowDialog(false);
            loadData();
        } catch (error) {
            toast.error('Failed to save deal');
        } finally {
            setSaving(false);
        }
    };

    const handleStageChange = async (deal: Deal, newStage: DealStage) => {
        try {
            await AdvisorService.updateDealStage(deal.id, newStage);
            toast.success(`Deal moved to ${DEAL_STAGES.find(s => s.value === newStage)?.label}`);
            loadData();
        } catch (error) {
            toast.error('Failed to update deal');
        }
    };

    const handleDelete = async (deal: Deal) => {
        if (!confirm(`Delete "${deal.title}"? This cannot be undone.`)) return;

        try {
            await AdvisorService.deleteDeal(deal.id);
            toast.success('Deal deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete deal');
        }
    };

    const activeStages = DEAL_STAGES.filter(s => !['closed_won', 'closed_lost'].includes(s.value));
    const closedStages = DEAL_STAGES.filter(s => ['closed_won', 'closed_lost'].includes(s.value));

    const getDealsByStage = (stage: DealStage) => deals.filter(d => d.stage === stage);

    const getPipelineValue = () =>
        deals
            .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
            .reduce((sum, d) => sum + d.value, 0);

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
                    <h1 className="text-2xl font-bold">Deal Pipeline</h1>
                    <p className="text-muted-foreground">
                        {formatCurrency(getPipelineValue())} in active pipeline
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="flex border rounded-lg">
                        <Button
                            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('kanban')}
                        >
                            Kanban
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </Button>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Deal
                    </Button>
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {activeStages.map((stage) => {
                        const stageDeals = getDealsByStage(stage.value);
                        const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

                        return (
                            <div key={stage.value} className="flex-shrink-0 w-72">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <Badge className={stage.color}>{stage.label}</Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {stageDeals.length} • {formatCurrency(stageValue)}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {stageDeals.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No deals
                                            </p>
                                        ) : (
                                            stageDeals.map((deal) => (
                                                <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between">
                                                            <h4 className="font-medium text-sm truncate flex-1">{deal.title}</h4>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleOpenDialog(deal)}
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-medium">{formatCurrency(deal.value)}</span>
                                                        </div>
                                                        {deal.client && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <User className="h-3 w-3" />
                                                                <span className="truncate">{deal.client.name}</span>
                                                            </div>
                                                        )}
                                                        {deal.expected_close && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{format(new Date(deal.expected_close), 'MMM d, yyyy')}</span>
                                                            </div>
                                                        )}
                                                        {/* Quick stage change */}
                                                        <div className="flex gap-1 pt-2">
                                                            {activeStages
                                                                .filter(s => s.value !== deal.stage)
                                                                .slice(0, 2)
                                                                .map(s => (
                                                                    <Button
                                                                        key={s.value}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs h-6 px-2"
                                                                        onClick={() => handleStageChange(deal, s.value)}
                                                                    >
                                                                        <ArrowRight className="h-3 w-3 mr-1" />
                                                                        {s.label}
                                                                    </Button>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}

                    {/* Closed section */}
                    <div className="flex-shrink-0 w-72">
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <span className="font-medium">Closed</span>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {closedStages.map((stage) => {
                                    const stageDeals = getDealsByStage(stage.value);
                                    return (
                                        <div key={stage.value}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={stage.color}>{stage.label}</Badge>
                                                <span className="text-xs text-muted-foreground">({stageDeals.length})</span>
                                            </div>
                                            {stageDeals.slice(0, 3).map((deal) => (
                                                <div key={deal.id} className="text-sm py-1 text-muted-foreground truncate">
                                                    {deal.title} • {formatCurrency(deal.value)}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="pt-6">
                        {deals.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No deals yet</p>
                                <Button variant="link" onClick={() => handleOpenDialog()}>
                                    Create your first deal
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {deals.map((deal) => {
                                    const stage = DEAL_STAGES.find(s => s.value === deal.stage);
                                    return (
                                        <div
                                            key={deal.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-medium truncate">{deal.title}</h4>
                                                    <Badge className={stage?.color}>{stage?.label}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span>{formatCurrency(deal.value)}</span>
                                                    {deal.client && <span>{deal.client.name}</span>}
                                                    <span>{formatDistanceToNow(new Date(deal.last_activity), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(deal)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(deal)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingDeal ? 'Edit Deal' : 'New Deal'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Deal Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Restaurant Acquisition - Mumbai"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Value (₹) *</Label>
                                <Input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder="5000000"
                                />
                            </div>
                            <div>
                                <Label>Stage</Label>
                                <Select
                                    value={formData.stage}
                                    onValueChange={(v) => setFormData({ ...formData, stage: v as DealStage })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEAL_STAGES.map((stage) => (
                                            <SelectItem key={stage.value} value={stage.value}>
                                                {stage.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Client</Label>
                            <Select
                                value={formData.client_id}
                                onValueChange={(v) => setFormData({ ...formData, client_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No client</SelectItem>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Listing Name</Label>
                                <Input
                                    value={formData.listing_name}
                                    onChange={(e) => setFormData({ ...formData, listing_name: e.target.value })}
                                    placeholder="Business name"
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.listing_type}
                                    onValueChange={(v) => setFormData({ ...formData, listing_type: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="franchise">Franchise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Expected Close Date</Label>
                            <Input
                                type="date"
                                value={formData.expected_close}
                                onChange={(e) => setFormData({ ...formData, expected_close: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Deal notes..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingDeal ? 'Update' : 'Create'} Deal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
