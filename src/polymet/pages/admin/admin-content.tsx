import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    FileText,
    Plus,
    Edit,
    Trash2,
    Globe,
    Megaphone,
    Loader2,
} from 'lucide-react';
import { AdminService, type CmsPage, type PlatformAnnouncement } from '@/lib/admin-service';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
    published: 'bg-secondary text-foreground',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-secondary text-muted-foreground',
};

const announcementTypeColors: Record<string, string> = {
    feature: 'bg-trust-blue/10 text-trust-blue',
    info: 'bg-growth-green/10 text-foreground',
    maintenance: 'bg-orange-100 text-orange-800',
    alert: 'bg-red-100 text-red-800',
};

const emptyPage = (): Partial<CmsPage> & { title: string; slug: string; body: string; status: CmsPage['status'] } => ({
    title: '',
    slug: '',
    body: '',
    status: 'draft',
});

const emptyAnnouncement = (): Partial<PlatformAnnouncement> & { title: string; body: string; type: PlatformAnnouncement['type']; active: boolean } => ({
    title: '',
    body: '',
    type: 'info',
    active: false,
});

export function AdminContentManagement() {
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageDialogOpen, setPageDialogOpen] = useState(false);
    const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(emptyPage());
    const [editingAnnouncement, setEditingAnnouncement] = useState(emptyAnnouncement());

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [pagesData, announcementsData] = await Promise.all([
                AdminService.getCmsPages(),
                AdminService.getAnnouncements(),
            ]);
            setPages(pagesData);
            setAnnouncements(announcementsData);
        } catch (error) {
            console.error('Error loading CMS data:', error);
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openNewPage = () => {
        setEditingPage(emptyPage());
        setPageDialogOpen(true);
    };

    const openEditPage = (page: CmsPage) => {
        setEditingPage({ ...page });
        setPageDialogOpen(true);
    };

    const savePage = async () => {
        if (!editingPage.title || !editingPage.slug) {
            toast.error('Title and slug are required');
            return;
        }
        setSaving(true);
        try {
            await AdminService.upsertCmsPage({
                id: editingPage.id,
                title: editingPage.title,
                slug: editingPage.slug.replace(/^\//, ''),
                body: editingPage.body || '',
                status: editingPage.status || 'draft',
            });
            toast.success('Page saved');
            setPageDialogOpen(false);
            await loadData();
        } catch (error) {
            console.error('Failed to save page:', error);
            toast.error('Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    const deletePage = async (id: string) => {
        if (!window.confirm('Delete this page?')) return;
        try {
            await AdminService.deleteCmsPage(id);
            toast.success('Page deleted');
            await loadData();
        } catch (error) {
            console.error('Failed to delete page:', error);
            toast.error('Failed to delete page');
        }
    };

    const openNewAnnouncement = () => {
        setEditingAnnouncement(emptyAnnouncement());
        setAnnouncementDialogOpen(true);
    };

    const openEditAnnouncement = (ann: PlatformAnnouncement) => {
        setEditingAnnouncement({ ...ann });
        setAnnouncementDialogOpen(true);
    };

    const saveAnnouncement = async () => {
        if (!editingAnnouncement.title) {
            toast.error('Title is required');
            return;
        }
        setSaving(true);
        try {
            await AdminService.upsertAnnouncement({
                id: editingAnnouncement.id,
                title: editingAnnouncement.title,
                body: editingAnnouncement.body || '',
                type: editingAnnouncement.type || 'info',
                active: editingAnnouncement.active ?? false,
                starts_at: editingAnnouncement.starts_at || null,
                ends_at: editingAnnouncement.ends_at || null,
            });
            toast.success('Announcement saved');
            setAnnouncementDialogOpen(false);
            await loadData();
        } catch (error) {
            console.error('Failed to save announcement:', error);
            toast.error('Failed to save announcement');
        } finally {
            setSaving(false);
        }
    };

    const deleteAnnouncement = async (id: string) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await AdminService.deleteAnnouncement(id);
            toast.success('Announcement deleted');
            await loadData();
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            toast.error('Failed to delete announcement');
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
            <div>
                <h1 className="text-2xl font-bold">Content Management</h1>
                <p className="text-muted-foreground">Manage static pages and platform announcements</p>
            </div>

            <Tabs defaultValue="pages">
                <TabsList>
                    <TabsTrigger value="pages" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Pages
                    </TabsTrigger>
                    <TabsTrigger value="announcements" className="gap-2">
                        <Megaphone className="h-4 w-4" />
                        Announcements
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pages" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Static Pages
                            </CardTitle>
                            <Button onClick={openNewPage}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Page
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {pages.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No details found in the table.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pages.map((page) => (
                                            <TableRow key={page.id}>
                                                <TableCell className="font-medium">{page.title}</TableCell>
                                                <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[page.status]}>{page.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {format(new Date(page.updated_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => openEditPage(page)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deletePage(page.id)}>
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
                </TabsContent>

                <TabsContent value="announcements" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Announcements
                            </CardTitle>
                            <Button onClick={openNewAnnouncement}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Announcement
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {announcements.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No details found in the table.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {announcements.map((ann) => (
                                            <TableRow key={ann.id}>
                                                <TableCell className="font-medium">{ann.title}</TableCell>
                                                <TableCell>
                                                    <Badge className={announcementTypeColors[ann.type]}>{ann.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={ann.active ? 'default' : 'secondary'}>
                                                        {ann.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {format(new Date(ann.created_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => openEditAnnouncement(ann)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteAnnouncement(ann.id)}>
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
                </TabsContent>
            </Tabs>

            <Dialog open={pageDialogOpen} onOpenChange={setPageDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPage.id ? 'Edit Page' : 'Create New Page'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Page Title</Label>
                            <Input
                                value={editingPage.title}
                                onChange={(e) => setEditingPage((p) => ({ ...p, title: e.target.value }))}
                                placeholder="e.g., FAQ"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={editingPage.slug}
                                onChange={(e) => setEditingPage((p) => ({ ...p, slug: e.target.value }))}
                                placeholder="e.g., faq"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={editingPage.status}
                                onValueChange={(v) => setEditingPage((p) => ({ ...p, status: v as CmsPage['status'] }))}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                                value={editingPage.body}
                                onChange={(e) => setEditingPage((p) => ({ ...p, body: e.target.value }))}
                                placeholder="Page content (supports markdown)"
                                rows={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPageDialogOpen(false)}>Cancel</Button>
                        <Button onClick={savePage} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Page'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingAnnouncement.id ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={editingAnnouncement.title}
                                onChange={(e) => setEditingAnnouncement((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Announcement title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                value={editingAnnouncement.body}
                                onChange={(e) => setEditingAnnouncement((p) => ({ ...p, body: e.target.value }))}
                                placeholder="Announcement message"
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={editingAnnouncement.type}
                                onValueChange={(v) => setEditingAnnouncement((p) => ({ ...p, type: v as PlatformAnnouncement['type'] }))}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feature">Feature</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="alert">Alert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Switch
                                checked={editingAnnouncement.active}
                                onCheckedChange={(v) => setEditingAnnouncement((p) => ({ ...p, active: v }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveAnnouncement} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Announcement'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
