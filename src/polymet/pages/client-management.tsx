import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    MoreVertical,
    Phone,
    Mail,
    Building2,
    Calendar,
    MessageSquare,
    FileText,
    Loader2,
    Tag,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    type: 'buyer' | 'seller' | 'both';
    status: 'active' | 'inactive' | 'prospect';
    budget_min: number | null;
    budget_max: number | null;
    interests: string[];
    notes: string | null;
    last_contact: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    prospect: 'bg-blue-100 text-blue-800',
};

const typeColors: Record<string, string> = {
    buyer: 'bg-purple-100 text-purple-800',
    seller: 'bg-orange-100 text-orange-800',
    both: 'bg-pink-100 text-pink-800',
};

export function ClientManagementPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'buyer',
        notes: '',
    });

    useEffect(() => {
        if (user) {
            loadClients();
        }
    }, [user]);

    const loadClients = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('advisor_clients')
                .select('*')
                .eq('advisor_id', user.id)
                .order('last_contact', { ascending: false });

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(0)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const handleAddClient = async () => {
        if (!user || !newClient.name || !newClient.email) {
            toast.error('Please fill in required fields');
            return;
        }
        try {
            const { error } = await supabase
                .from('advisor_clients')
                .insert({
                    advisor_id: user.id,
                    name: newClient.name,
                    email: newClient.email,
                    phone: newClient.phone || null,
                    company: newClient.company || null,
                    type: newClient.type,
                    notes: newClient.notes || null,
                    status: 'prospect',
                    interests: [],
                    last_contact: new Date().toISOString(),
                });

            if (error) throw error;

            toast.success('Client added successfully');
            setShowAddDialog(false);
            setNewClient({ name: '', email: '', phone: '', company: '', type: 'buyer', notes: '' });
            loadClients();
        } catch (error) {
            toast.error('Failed to add client');
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || client.type === filterType;
        const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        buyers: clients.filter(c => c.type === 'buyer' || c.type === 'both').length,
        sellers: clients.filter(c => c.type === 'seller' || c.type === 'both').length,
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
                        <Users className="h-6 w-6 text-primary" />
                        Client Management
                    </h1>
                    <p className="text-muted-foreground">Manage your buyer and seller relationships</p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        value={newClient.name}
                                        onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input
                                        value={newClient.company}
                                        onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                                        placeholder="Company Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Client Type</Label>
                                <Select value={newClient.type} onValueChange={(v) => setNewClient(prev => ({ ...prev, type: v }))}>
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
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={newClient.notes}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Initial notes about the client..."
                                    rows={3}
                                />
                            </div>
                            <Button onClick={handleAddClient} className="w-full">Add Client</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Clients</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-sm text-muted-foreground">Active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.buyers}</p>
                        <p className="text-sm text-muted-foreground">Buyers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.sellers}</p>
                        <p className="text-sm text-muted-foreground">Sellers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="buyer">Buyers</SelectItem>
                                <SelectItem value="seller">Sellers</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
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
                </CardContent>
            </Card>

            {/* Client List */}
            <div className="space-y-4">
                {filteredClients.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="font-medium text-lg mb-2">No Clients Found</h3>
                            <p className="text-muted-foreground">Add your first client to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {client.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{client.name}</h3>
                                                {client.company && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Building2 className="h-4 w-4" />
                                                        {client.company}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={typeColors[client.type]}>{client.type}</Badge>
                                                <Badge className={statusColors[client.status]}>{client.status}</Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                {client.email}
                                            </span>
                                            {client.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    {client.phone}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Last contact: {formatDistanceToNow(new Date(client.last_contact), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {client.budget_min && client.budget_max && (
                                            <p className="text-sm mb-2">
                                                <span className="font-medium">Budget:</span>{' '}
                                                {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                                            </p>
                                        )}

                                        {client.interests.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {client.interests.map((interest, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {client.notes && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{client.notes}</p>
                                        )}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Send Message
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="h-4 w-4 mr-2" />
                                                View History
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Building2 className="h-4 w-4 mr-2" />
                                                Match Listings
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
