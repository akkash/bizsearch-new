import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Lock,
    FileText,
    Upload,
    Download,
    Eye,
    Trash2,
    FolderOpen,
    Shield,
    Clock,
    Loader2,
    MessageSquare,
    Users,
    AlertTriangle,
    ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DealRoomService, type DealRoomDocument, type DealRoomActivity, type NDAgreement } from '@/lib/deal-room-service';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const categoryIcons: Record<string, any> = {
    financial: FileText,
    legal: Shield,
    operational: FolderOpen,
    overview: Eye,
};

const categoryColors: Record<string, string> = {
    financial: 'bg-green-100 text-green-800',
    legal: 'bg-purple-100 text-purple-800',
    operational: 'bg-blue-100 text-blue-800',
    overview: 'bg-orange-100 text-orange-800',
};

export function DealRoomPage() {
    const { businessId } = useParams<{ businessId: string }>();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<DealRoomDocument[]>([]);
    const [activity, setActivity] = useState<DealRoomActivity[]>([]);
    const [ndas, setNdas] = useState<NDAgreement[]>([]);
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        name: '',
        category: 'overview' as DealRoomDocument['category'],
        access_level: 'nda_signed' as DealRoomDocument['access_level'],
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (businessId) {
            loadDealRoomData();
        }
    }, [businessId]);

    const loadDealRoomData = async () => {
        if (!businessId) return;
        setLoading(true);
        try {
            const [docs, acts, ndasData] = await Promise.all([
                DealRoomService.getDocumentsForBusiness(businessId),
                DealRoomService.getActivityForBusiness(businessId),
                DealRoomService.getNDAsForBusiness(businessId),
            ]);
            setDocuments(docs);
            setActivity(acts);
            setNdas(ndasData);

            // Get business name
            const { data: biz } = await supabase
                .from('businesses')
                .select('name')
                .eq('id', businessId)
                .single();
            if (biz) setBusinessName(biz.name);
        } catch (error) {
            console.error('Error loading deal room:', error);
            toast.error('Failed to load deal room');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!uploadForm.name) {
                setUploadForm({ ...uploadForm, name: file.name.replace(/\.[^/.]+$/, '') });
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadForm.name || !businessId || !user) {
            toast.error('Please select a file and enter a name');
            return;
        }

        setUploading(true);
        try {
            // Upload to storage
            const fileName = `${businessId}/${Date.now()}_${selectedFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('deal-room-documents')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('deal-room-documents')
                .getPublicUrl(fileName);

            // Save to database
            await DealRoomService.uploadDocument(businessId, user.id, {
                name: uploadForm.name,
                file_url: urlData.publicUrl,
                category: uploadForm.category,
                size_bytes: selectedFile.size,
                access_level: uploadForm.access_level,
            });

            // Log activity
            await DealRoomService.logActivity(businessId, user.id, 'uploaded document', undefined, {
                document_name: uploadForm.name,
            });

            toast.success('Document uploaded');
            setShowUploadDialog(false);
            setSelectedFile(null);
            setUploadForm({ name: '', category: 'overview', access_level: 'nda_signed' });
            loadDealRoomData();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (doc: DealRoomDocument) => {
        if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;

        try {
            await DealRoomService.deleteDocument(doc.id);
            toast.success('Document deleted');
            loadDealRoomData();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const filteredDocs = documents.filter(doc =>
        selectedCategory === 'all' || doc.category === selectedCategory
    );

    const categories = [...new Set(documents.map(d => d.category))];
    const signedNdas = ndas.filter(n => n.status === 'signed').length;
    const pendingNdas = ndas.filter(n => n.status === 'sent' || n.status === 'viewed').length;

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
                    <Link to="/my-listings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to listings
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Lock className="h-6 w-6 text-primary" />
                        Deal Room
                    </h1>
                    <p className="text-muted-foreground">
                        {businessName && <span className="font-medium">{businessName}</span>}
                        {businessName && ' • '}Secure document sharing with verified buyers
                    </p>
                </div>
                <Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Access Warning */}
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            <strong>Confidential:</strong> Only buyers who have signed an NDA can access restricted documents.
                            All activity is logged and monitored.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Documents Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Documents</CardTitle>
                                <Badge variant="secondary">{documents.length} files</Badge>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-2">
                                <Button
                                    size="sm"
                                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    All
                                </Button>
                                {['financial', 'legal', 'operational', 'overview'].map(cat => (
                                    <Button
                                        key={cat}
                                        size="sm"
                                        variant={selectedCategory === cat ? 'default' : 'outline'}
                                        onClick={() => setSelectedCategory(cat)}
                                        className="capitalize"
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredDocs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No documents yet</p>
                                    <Button variant="link" onClick={() => setShowUploadDialog(true)}>
                                        Upload your first document
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredDocs.map((doc) => {
                                        const Icon = categoryIcons[doc.category] || FileText;
                                        return (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${categoryColors[doc.category] || 'bg-gray-100'}`}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{doc.name}</p>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <span>{formatFileSize(doc.size_bytes || 0)}</span>
                                                            <span>•</span>
                                                            <span>{formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.access_level === 'nda_signed' && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Lock className="h-3 w-3 mr-1" />
                                                            NDA Required
                                                        </Badge>
                                                    )}
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <a href={doc.file_url} download>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(doc)}
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Room Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Documents</span>
                                <span className="font-semibold">{documents.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total Size</span>
                                <span className="font-semibold">
                                    {formatFileSize(documents.reduce((acc, d) => acc + (d.size_bytes || 0), 0))}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">NDA Signed Buyers</span>
                                <span className="font-semibold text-green-600">{signedNdas}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pending NDA</span>
                                <span className="font-semibold text-yellow-600">{pendingNdas}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activity.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No activity yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {activity.slice(0, 5).map((item) => (
                                        <div key={item.id} className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                            <div>
                                                <p className="text-sm">
                                                    <span className="font-medium">{item.user?.display_name || 'User'}</span>
                                                    {' '}{item.action}
                                                    {item.document && (
                                                        <span className="text-muted-foreground"> "{item.document.name}"</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to="/nda-management">
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage NDAs
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to="/buyer-inquiries">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    View Inquiries
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>File</Label>
                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            />
                            {selectedFile && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Document Name</Label>
                            <Input
                                value={uploadForm.name}
                                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                                placeholder="e.g., Financial Statements 2023"
                            />
                        </div>
                        <div>
                            <Label>Category</Label>
                            <Select
                                value={uploadForm.category}
                                onValueChange={(v) => setUploadForm({ ...uploadForm, category: v as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="overview">Overview</SelectItem>
                                    <SelectItem value="financial">Financial</SelectItem>
                                    <SelectItem value="legal">Legal</SelectItem>
                                    <SelectItem value="operational">Operational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Access Level</Label>
                            <Select
                                value={uploadForm.access_level}
                                onValueChange={(v) => setUploadForm({ ...uploadForm, access_level: v as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Public (All buyers)</SelectItem>
                                    <SelectItem value="nda_signed">NDA Required</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                            {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
