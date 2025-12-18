import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Eye,
    Globe,
    Megaphone,
} from 'lucide-react';

// Mock content data - in production, fetch from database
const mockPages = [
    { id: '1', title: 'About Us', slug: '/about', status: 'published', updatedAt: '2024-12-18' },
    { id: '2', title: 'Contact', slug: '/contact', status: 'published', updatedAt: '2024-12-17' },
    { id: '3', title: 'Terms of Service', slug: '/terms', status: 'draft', updatedAt: '2024-12-15' },
    { id: '4', title: 'Privacy Policy', slug: '/privacy', status: 'published', updatedAt: '2024-12-10' },
];

const mockAnnouncements = [
    { id: '1', title: 'New Franchise Map Feature', type: 'feature', active: true, createdAt: '2024-12-18' },
    { id: '2', title: 'Holiday Hours Notice', type: 'info', active: true, createdAt: '2024-12-15' },
    { id: '3', title: 'System Maintenance', type: 'maintenance', active: false, createdAt: '2024-12-01' },
];

export function AdminContentManagement() {
    const [pages] = useState(mockPages);
    const [announcements] = useState(mockAnnouncements);
    const [editingPage, setEditingPage] = useState<any>(null);

    const statusColors: Record<string, string> = {
        published: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        archived: 'bg-gray-100 text-gray-600',
    };

    const announcementTypeColors: Record<string, string> = {
        feature: 'bg-blue-100 text-blue-800',
        info: 'bg-purple-100 text-purple-800',
        maintenance: 'bg-orange-100 text-orange-800',
        alert: 'bg-red-100 text-red-800',
    };

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

                {/* Pages Tab */}
                <TabsContent value="pages" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Static Pages
                            </CardTitle>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Page
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Page</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Page Title</Label>
                                            <Input placeholder="e.g., FAQ" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug</Label>
                                            <Input placeholder="e.g., /faq" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Content</Label>
                                            <Textarea placeholder="Page content (supports markdown)" rows={6} />
                                        </div>
                                        <Button className="w-full">Create Page</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
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
                                            <TableCell className="text-muted-foreground">{page.slug}</TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[page.status]}>{page.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{page.updatedAt}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Announcements Tab */}
                <TabsContent value="announcements" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Announcements
                            </CardTitle>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Announcement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Announcement</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input placeholder="Announcement title" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Message</Label>
                                            <Textarea placeholder="Announcement message" rows={4} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <select className="w-full p-2 border rounded-md">
                                                <option value="feature">Feature</option>
                                                <option value="info">Info</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="alert">Alert</option>
                                            </select>
                                        </div>
                                        <Button className="w-full">Create Announcement</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
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
                                            <TableCell className="text-sm text-muted-foreground">{ann.createdAt}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900">Content Management Info</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                This is a basic CMS interface. For production use, consider integrating with:
                            </p>
                            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                                <li>A rich text editor (e.g., TipTap, Lexical)</li>
                                <li>Media library for images</li>
                                <li>Version history for pages</li>
                                <li>SEO metadata fields</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
