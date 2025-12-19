import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    Users,
    Plus,
    Search,
    Loader2,
    Mail,
    Phone,
    Building2,
    Edit,
    Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdvisorService, type AdvisorClient } from '@/lib/advisor-service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    prospect: 'bg-blue-100 text-blue-800',
};

const typeColors = {
    buyer: 'bg-purple-100 text-purple-800',
    seller: 'bg-orange-100 text-orange-800',
    both: 'bg-indigo-100 text-indigo-800',
};

interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    type: 'buyer' | 'seller' | 'both';
    status: 'active' | 'inactive' | 'prospect';
    budget_min: string;
    budget_max: string;
    notes: string;
}

const defaultFormData: ClientFormData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'buyer',
    status: 'prospect',
    budget_min: '',
    budget_max: '',
    notes: '',
};

export function AdvisorClients() {
    const { user } = useAuth();
    const [clients, setClients] = useState<AdvisorClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingClient, setEditingClient] = useState<AdvisorClient | null>(null);
    const [formData, setFormData] = useState<ClientFormData>(defaultFormData);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) loadClients();
    }, [user]);

    const loadClients = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await AdvisorService.getClients(user.id);
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (client?: AdvisorClient) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                company: client.company || '',
                type: client.type,
                status: client.status,
                budget_min: client.budget_min?.toString() || '',
                budget_max: client.budget_max?.toString() || '',
                notes: client.notes || '',
            });
        } else {
            setEditingClient(null);
            setFormData(defaultFormData);
        }
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!user || !formData.name || !formData.email) {
            toast.error('Name and email are required');
            return;
        }

        setSaving(true);
        try {
            const clientData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                company: formData.company || undefined,
                type: formData.type,
                status: formData.status,
                budget_min: formData.budget_min ? parseInt(formData.budget_min) : undefined,
                budget_max: formData.budget_max ? parseInt(formData.budget_max) : undefined,
                notes: formData.notes || undefined,
            };

            if (editingClient) {
                await AdvisorService.updateClient(editingClient.id, clientData);
                toast.success('Client updated');
            } else {
                await AdvisorService.createClient(user.id, clientData);
                toast.success('Client added');
            }

            setShowDialog(false);
            loadClients();
        } catch (error) {
            toast.error('Failed to save client');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (client: AdvisorClient) => {
        if (!confirm(`Delete ${client.name}? This cannot be undone.`)) return;

        try {
            await AdvisorService.deleteClient(client.id);
            toast.success('Client deleted');
            loadClients();
        } catch (error) {
            toast.error('Failed to delete client');
        }
    };

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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
                    <h1 className="text-2xl font-bold">Clients</h1>
                    <p className="text-muted-foreground">Manage your client relationships</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {filteredClients.length} Clients
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredClients.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>{clients.length === 0 ? 'No clients yet' : 'No matching clients'}</p>
                            {clients.length === 0 && (
                                <Button variant="link" onClick={() => handleOpenDialog()}>
                                    Add your first client
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{client.name}</p>
                                                {client.company && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {client.company}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {client.email}
                                                </p>
                                                {client.phone && (
                                                    <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {client.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={typeColors[client.type]}>{client.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[client.status]}>{client.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(client.last_contact), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(client)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(client)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div>
                                <Label>Company</Label>
                                <Input
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Acme Inc"
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="buyer">Buyer</SelectItem>
                                        <SelectItem value="seller">Seller</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="prospect">Prospect</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Min Budget</Label>
                                <Input
                                    type="number"
                                    value={formData.budget_min}
                                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                                    placeholder="1000000"
                                />
                            </div>
                            <div>
                                <Label>Max Budget</Label>
                                <Input
                                    type="number"
                                    value={formData.budget_max}
                                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                                    placeholder="5000000"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingClient ? 'Update' : 'Add'} Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
