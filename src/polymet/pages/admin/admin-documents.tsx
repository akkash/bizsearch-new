import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import {
    FileCheck,
    FileText,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    Download,
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

export function AdminDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<AdminDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState<AdminDocument | null>(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getPendingDocuments();
            setDocuments(data);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (doc: AdminDocument) => {
        if (!user) return;
        try {
            await AdminService.approveDocument(doc.id, user.id);
            toast.success('Document approved');
            loadDocuments();
            setPreviewDoc(null);
        } catch (error) {
            toast.error('Failed to approve document');
        }
    };

    const handleReject = async (doc: AdminDocument) => {
        if (!user) return;
        try {
            await AdminService.rejectDocument(doc.id, user.id);
            toast.success('Document rejected');
            loadDocuments();
            setPreviewDoc(null);
        } catch (error) {
            toast.error('Failed to reject document');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Document Verification</h1>
                <p className="text-muted-foreground">Review and verify user-submitted documents</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Pending Documents ({documents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No pending documents</p>
                            <p className="text-sm">All documents have been reviewed</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
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
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600"
                                                        onClick={() => handleApprove(doc)}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600"
                                                        onClick={() => handleReject(doc)}
                                                    >
                                                        <XCircle className="h-4 w-4" />
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

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                className="text-red-600"
                                onClick={() => previewDoc && handleReject(previewDoc)}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => previewDoc && handleApprove(previewDoc)}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
