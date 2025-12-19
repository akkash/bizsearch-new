import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    FileCheck,
    FileText,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    Download,
    Clock,
    Shield,
    AlertTriangle,
} from 'lucide-react';
import { AdminService, type AdminDocument } from '@/lib/admin-service';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const documentTypeColors: Record<string, string> = {
    identity: 'bg-blue-100 text-blue-800',
    business: 'bg-green-100 text-green-800',
    financial: 'bg-purple-100 text-purple-800',
    legal: 'bg-orange-100 text-orange-800',
};

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    verified: { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

type StatusFilter = 'pending' | 'verified' | 'rejected' | 'all';

export function AdminDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<AdminDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<StatusFilter>('pending');
    const [previewDoc, setPreviewDoc] = useState<AdminDocument | null>(null);
    const [rejectDoc, setRejectDoc] = useState<AdminDocument | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, [activeTab]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getAllDocuments({
                status: activeTab === 'all' ? 'all' : activeTab
            });
            setDocuments(data);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (doc: AdminDocument) => {
        if (!user) return;
        setProcessing(true);
        try {
            await AdminService.approveDocument(doc.id, user.id);
            toast.success('Document approved', {
                description: `${doc.profile.display_name}'s verification status has been updated`,
            });
            loadDocuments();
            setPreviewDoc(null);
        } catch (error) {
            toast.error('Failed to approve document');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!user || !rejectDoc) return;
        setProcessing(true);
        try {
            await AdminService.rejectDocument(rejectDoc.id, user.id, rejectionReason);
            toast.success('Document rejected', {
                description: rejectionReason ? 'User will be notified with your feedback' : undefined,
            });
            loadDocuments();
            setRejectDoc(null);
            setPreviewDoc(null);
            setRejectionReason('');
        } catch (error) {
            toast.error('Failed to reject document');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusCounts = () => {
        // In real implementation, this would be fetched from server
        return { pending: documents.length, verified: 0, rejected: 0 };
    };

    const renderDocTable = () => (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((doc) => {
                        const status = statusConfig[doc.status as keyof typeof statusConfig];
                        const StatusIcon = status?.icon || Clock;
                        return (
                            <TableRow key={doc.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <span className="font-medium">{doc.file_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={documentTypeColors[doc.document_type] || ''}>
                                        {doc.document_type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-sm">{doc.profile.display_name}</p>
                                        <p className="text-xs text-muted-foreground">{doc.profile.email}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={status?.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status?.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setPreviewDoc(doc)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        {doc.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:bg-green-50"
                                                    onClick={() => handleApprove(doc)}
                                                    disabled={processing}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() => setRejectDoc(doc)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Document Verification</h1>
                    <p className="text-muted-foreground">Review and verify user-submitted documents</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Approving identity docs verifies the user</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)}>
                        <TabsList>
                            <TabsTrigger value="pending" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                            </TabsTrigger>
                            <TabsTrigger value="verified" className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Verified
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="gap-2">
                                <XCircle className="h-4 w-4" />
                                Rejected
                            </TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No {activeTab === 'all' ? '' : activeTab} documents</p>
                            {activeTab === 'pending' && (
                                <p className="text-sm">All documents have been reviewed</p>
                            )}
                        </div>
                    ) : (
                        renderDocTable()
                    )}
                </CardContent>
            </Card>

            {/* Document Preview Dialog */}
            <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {previewDoc?.file_name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Type:</span>
                                <Badge className={`ml-2 ${documentTypeColors[previewDoc?.document_type || '']}`}>
                                    {previewDoc?.document_type}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Submitted by:</span>
                                <span className="ml-2 font-medium">{previewDoc?.profile.display_name}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status:</span>
                                <Badge className={`ml-2 ${statusConfig[previewDoc?.status as keyof typeof statusConfig]?.color}`}>
                                    {previewDoc?.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Document Preview */}
                        <div className="border rounded-lg p-4 bg-muted/50 min-h-[300px] flex items-center justify-center">
                            {previewDoc?.file_url ? (
                                previewDoc.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                        src={previewDoc.file_url}
                                        alt="Document preview"
                                        className="max-h-[400px] object-contain"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                                        <Button asChild>
                                            <a href={previewDoc.file_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download File
                                            </a>
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <p className="text-muted-foreground">No preview available</p>
                            )}
                        </div>

                        {previewDoc?.status === 'pending' && (
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => {
                                        setRejectDoc(previewDoc);
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => previewDoc && handleApprove(previewDoc)}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Approve & Verify User
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Reason Dialog */}
            <Dialog open={!!rejectDoc} onOpenChange={() => { setRejectDoc(null); setRejectionReason(''); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Reject Document
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            You are about to reject <strong>{rejectDoc?.file_name}</strong> from{' '}
                            <strong>{rejectDoc?.profile.display_name}</strong>.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Reason for rejection (optional)</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="e.g., Document is blurry, expired, or doesn't match user name..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                This reason will be visible to the user
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setRejectDoc(null); setRejectionReason(''); }}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
