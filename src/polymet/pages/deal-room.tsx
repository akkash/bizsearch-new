import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface DealDocument {
    id: string;
    name: string;
    category: string;
    size: number;
    uploaded_at: string;
    access_level: 'all' | 'nda_signed';
}

interface DealActivity {
    id: string;
    user_name: string;
    action: string;
    document?: string;
    timestamp: string;
}

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
    const [documents, setDocuments] = useState<DealDocument[]>([]);
    const [activity, setActivity] = useState<DealActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (businessId) {
            loadDealRoomData();
        }
    }, [businessId]);

    const loadDealRoomData = async () => {
        if (!businessId) return;
        setLoading(true);
        try {
            // Fetch documents
            const { data: docs, error: docsError } = await supabase
                .from('deal_room_documents')
                .select('*')
                .eq('business_id', businessId)
                .order('uploaded_at', { ascending: false });

            if (docsError) throw docsError;
            setDocuments(docs || []);

            // Fetch activity
            const { data: acts, error: actsError } = await supabase
                .from('deal_room_activity')
                .select('*')
                .eq('business_id', businessId)
                .order('timestamp', { ascending: false })
                .limit(10);

            if (!actsError && acts) {
                setActivity(acts);
            }
        } catch (error) {
            console.error('Error loading deal room:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const filteredDocs = documents.filter(doc =>
        selectedCategory === 'all' || doc.category === selectedCategory
    );

    const categories = [...new Set(documents.map(d => d.category))];

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
                        <Lock className="h-6 w-6 text-primary" />
                        Deal Room
                    </h1>
                    <p className="text-muted-foreground">Secure document sharing with verified buyers</p>
                </div>
                <Button>
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
                                {categories.map(cat => (
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
                                                        <span>{formatFileSize(doc.size)}</span>
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
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
                                    {formatFileSize(documents.reduce((acc, d) => acc + d.size, 0))}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">NDA Signed Buyers</span>
                                <span className="font-semibold text-green-600">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pending Access</span>
                                <span className="font-semibold text-yellow-600">2</span>
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
                            <div className="space-y-4">
                                {activity.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-medium">{item.user_name}</span>
                                                {' '}{item.action}
                                                {item.document && (
                                                    <span className="text-muted-foreground"> "{item.document}"</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="h-4 w-4 mr-2" />
                                Manage Access
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Update
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="h-4 w-4 mr-2" />
                                Download All
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
