import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    FileText,
    Shield,
    CheckCircle2,
    Loader2,
    ArrowRight,
    ArrowLeft,
    X,
    AlertCircle
} from 'lucide-react';
import { ProfileService } from '@/lib/profile-service';
import type { Profile } from '@/types/auth.types';

interface OnboardingStepVerificationProps {
    profile: Profile | null;
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
}

type DocumentType = 'identity' | 'business';

interface UploadedDoc {
    type: DocumentType;
    file: File;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    error?: string;
}

const DOCUMENT_CONFIG = {
    identity: {
        title: 'Identity Document',
        description: 'Upload PAN Card, Aadhaar, or Passport',
        accept: '.pdf,.jpg,.jpeg,.png',
        maxSize: 5 * 1024 * 1024, // 5MB
        icon: Shield,
    },
    business: {
        title: 'Business Document',
        description: 'Upload GST Certificate, Company Registration, or Trade License',
        accept: '.pdf,.jpg,.jpeg,.png',
        maxSize: 10 * 1024 * 1024, // 10MB
        icon: FileText,
    },
};

export function OnboardingStepVerification({
    profile,
    onNext,
    onBack,
    onSkip,
}: OnboardingStepVerificationProps) {
    const [documents, setDocuments] = useState<UploadedDoc[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (type: DocumentType, file: File) => {
        const config = DOCUMENT_CONFIG[type];

        // Validate file size
        if (file.size > config.maxSize) {
            setError(`${config.title} must be less than ${config.maxSize / 1024 / 1024}MB`);
            return;
        }

        // Remove existing doc of same type and add new one
        setDocuments(prev => [
            ...prev.filter(d => d.type !== type),
            { type, file, status: 'pending' },
        ]);
        setError(null);
    };

    const handleRemoveDoc = (type: DocumentType) => {
        setDocuments(prev => prev.filter(d => d.type !== type));
    };

    const handleUpload = async () => {
        if (!profile?.id || documents.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            for (const doc of documents) {
                if (doc.status === 'pending') {
                    setDocuments(prev =>
                        prev.map(d => d.type === doc.type ? { ...d, status: 'uploading' } : d)
                    );

                    await ProfileService.uploadDocument(profile.id, doc.file, doc.type);

                    setDocuments(prev =>
                        prev.map(d => d.type === doc.type ? { ...d, status: 'uploaded' } : d)
                    );
                }
            }

            // All uploads complete, move to next step
            onNext();
        } catch (err: any) {
            setError(err.message || 'Failed to upload documents');
            setDocuments(prev =>
                prev.map(d => d.status === 'uploading' ? { ...d, status: 'error', error: err.message } : d)
            );
        } finally {
            setUploading(false);
        }
    };

    const getDocForType = (type: DocumentType) =>
        documents.find(d => d.type === type);

    const hasAnyDocument = documents.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold">Verify Your Identity</h2>
                <p className="text-muted-foreground mt-2">
                    Verified users get <span className="font-semibold text-purple-600">3x more responses</span> and a trust badge on their profile
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Document Upload Cards */}
            <div className="grid gap-4">
                {(['identity', 'business'] as DocumentType[]).map((type) => {
                    const config = DOCUMENT_CONFIG[type];
                    const Icon = config.icon;
                    const uploadedDoc = getDocForType(type);

                    return (
                        <Card key={type} className={uploadedDoc ? 'border-green-200 bg-green-50/50' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${uploadedDoc ? 'bg-green-100' : 'bg-muted'}`}>
                                            <Icon className={`h-5 w-5 ${uploadedDoc ? 'text-green-600' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{config.title}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {config.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {uploadedDoc && (
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                            {uploadedDoc.status === 'uploading' ? (
                                                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Uploading</>
                                            ) : uploadedDoc.status === 'uploaded' ? (
                                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Uploaded</>
                                            ) : (
                                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Ready</>
                                            )}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {uploadedDoc ? (
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="text-sm truncate">{uploadedDoc.file.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({(uploadedDoc.file.size / 1024).toFixed(0)} KB)
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveDoc(type)}
                                            disabled={uploading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept={config.accept}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(type, file);
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Click to upload or drag and drop
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Info Note */}
            <p className="text-xs text-muted-foreground text-center">
                Your documents are encrypted and securely stored. They will only be used for verification purposes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={uploading}
                    className="sm:flex-1"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                {hasAnyDocument ? (
                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="sm:flex-1"
                    >
                        {uploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                        ) : (
                            <>Upload & Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={onSkip}
                        variant="outline"
                        className="sm:flex-1"
                    >
                        Skip for Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Skip Link */}
            {hasAnyDocument && (
                <Button
                    variant="link"
                    onClick={onSkip}
                    disabled={uploading}
                    className="w-full text-muted-foreground"
                >
                    Skip verification for now
                </Button>
            )}
        </div>
    );
}
