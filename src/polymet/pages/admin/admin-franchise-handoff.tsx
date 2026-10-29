import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    AdminService,
    type AdminUser,
    type CatalogFranchise,
} from '@/lib/admin-service';

export function AdminFranchiseHandoff() {
    const [franchises, setFranchises] = useState<CatalogFranchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [selected, setSelected] = useState<CatalogFranchise | null>(null);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [lookupState, setLookupState] = useState<'idle' | 'found' | 'missing'>('idle');
    const [matchedOwner, setMatchedOwner] = useState<AdminUser | null>(null);
    const [acting, setActing] = useState(false);

    const loadFranchises = async () => {
        setLoading(true);
        setLoadError(false);
        try {
            const rows = await AdminService.getCatalogFranchises();
            setFranchises(rows);
        } catch (error) {
            console.error('Error loading catalog franchises:', error);
            setLoadError(true);
            toast.error('Failed to load franchises');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadFranchises();
    }, []);

    const openAssign = (franchise: CatalogFranchise) => {
        setSelected(franchise);
        setEmail('');
        setDisplayName('');
        setLookupState('idle');
        setMatchedOwner(null);
    };

    const closeAssign = () => {
        if (acting) return;
        setSelected(null);
    };

    const lookupOwner = async () => {
        const trimmed = email.trim();
        if (!trimmed) {
            toast.error('Enter the owner email');
            return;
        }

        setActing(true);
        try {
            const profile = await AdminService.findProfileByEmail(trimmed);
            if (profile) {
                setMatchedOwner(profile);
                setLookupState('found');
                setDisplayName(profile.display_name || '');
            } else {
                setMatchedOwner(null);
                setLookupState('missing');
            }
        } catch (error) {
            console.error('Owner lookup failed:', error);
            toast.error('Failed to look up that email');
        } finally {
            setActing(false);
        }
    };

    const assignExisting = async () => {
        if (!selected || !matchedOwner) return;
        setActing(true);
        try {
            const result = await AdminService.mapFranchiseOwner(selected.id, matchedOwner.id);
            toast.success(
                `${selected.brand_name} is now owned by ${matchedOwner.display_name || matchedOwner.email}. ${result.inquiries_moved} enquiries moved.`
            );
            setSelected(null);
            await loadFranchises();
        } catch (error) {
            console.error('Franchise map failed:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to map the franchise');
        } finally {
            setActing(false);
        }
    };

    const inviteOwner = async () => {
        if (!selected) return;
        if (!displayName.trim()) {
            toast.error('Enter the owner name');
            return;
        }

        setActing(true);
        try {
            const result = await AdminService.inviteAndMapFranchiseOwner(
                selected.id,
                email,
                displayName
            );
            toast.success(
                result.invited
                    ? `Invite sent. ${selected.brand_name} is mapped to ${email}. ${result.inquiriesMoved} enquiries moved.`
                    : `${selected.brand_name} is mapped to ${email}. ${result.inquiriesMoved} enquiries moved.`
            );
            setSelected(null);
            await loadFranchises();
        } catch (error) {
            console.error('Franchise invite failed:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to invite the owner');
        } finally {
            setActing(false);
        }
    };

    const ownerBlocked = Boolean(
        matchedOwner &&
        (matchedOwner.is_catalog_account || matchedOwner.id === selected?.franchisor_id)
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Franchise handoff</h1>
                <p className="text-muted-foreground">
                    Assign a catalog-held franchise to the owner after you agree terms with them.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <p className="text-sm text-muted-foreground">
                    Franchises still owned by a catalog account
                    </p>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : loadError ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Failed to load franchises.</p>
                        </div>
                    ) : franchises.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No details found in the table.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Enquiries</TableHead>
                                        <TableHead>Held by</TableHead>
                                        <TableHead className="w-28"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {franchises.map((franchise) => (
                                        <TableRow key={franchise.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{franchise.brand_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {franchise.industry || '—'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={franchise.status === 'active' ? 'default' : 'secondary'}>
                                                    {franchise.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{franchise.enquiry_count}</TableCell>
                                            <TableCell>
                                                <p className="text-sm">{franchise.owner_name || 'Catalog account'}</p>
                                                <p className="text-sm text-muted-foreground">{franchise.owner_email}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link to={`/franchise/${franchise.slug || franchise.id}`} target="_blank">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" onClick={() => openAssign(franchise)}>
                                                        Assign owner
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selected} onOpenChange={(open) => !open && closeAssign()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign {selected?.brand_name}</DialogTitle>
                        <DialogDescription>
                            Look up an existing account, or invite the franchise owner. Existing enquiries move with the listing.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="owner-email">Owner email</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="owner-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setLookupState('idle');
                                        setMatchedOwner(null);
                                    }}
                                    placeholder="owner@brand.com"
                                    disabled={acting}
                                />
                                <Button type="button" variant="outline" onClick={lookupOwner} disabled={acting}>
                                    {acting && lookupState === 'idle' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Look up'}
                                </Button>
                            </div>
                        </div>

                        {lookupState === 'found' && matchedOwner && (
                            <div className="rounded-lg border p-3 space-y-2">
                                <p className="font-medium">{matchedOwner.display_name || 'No name'}</p>
                                <p className="text-sm text-muted-foreground">{matchedOwner.email}</p>
                                <Badge variant="secondary">{matchedOwner.role}</Badge>
                                {matchedOwner.is_catalog_account && (
                                    <p className="text-sm text-destructive">This is a catalog account. Choose the real owner.</p>
                                )}
                                {matchedOwner.role !== 'franchisor' && matchedOwner.role !== 'seller' && !matchedOwner.is_catalog_account && (
                                    <p className="text-sm text-muted-foreground">
                                        Give this account the franchisor role so they can open the franchisor dashboard.
                                    </p>
                                )}
                            </div>
                        )}

                        {lookupState === 'missing' && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">No details found in the table.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="owner-name">Owner name</Label>
                                    <Input
                                        id="owner-name"
                                        value={displayName}
                                        onChange={(event) => setDisplayName(event.target.value)}
                                        placeholder="Brand owner"
                                        disabled={acting}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    An invite email lets them set a password. The franchise is mapped when the invite is sent.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeAssign} disabled={acting}>
                            Cancel
                        </Button>
                        {lookupState === 'found' ? (
                            <Button onClick={assignExisting} disabled={acting || ownerBlocked}>
                                {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign owner'}
                            </Button>
                        ) : (
                            <Button onClick={inviteOwner} disabled={acting || lookupState !== 'missing'}>
                                {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite and assign'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
