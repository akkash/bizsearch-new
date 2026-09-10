import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  Upload,
  Lock,
  Unlock,
  Eye,
  Share2,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { type UserProfile } from "@/polymet/data/profile-data";
import { ProfileService } from "@/lib/profile-service";

interface Document {
  id: string;
  name: string;
  type: "financial" | "legal" | "operational" | "marketing" | "other";
  size: string;
  uploadDate: string;
  uploadedBy: string;
  isPrivate: boolean;
  requiresNDA: boolean;
  description?: string;
  downloadCount: number;
}

interface DocumentsVaultProps {
  profile: UserProfile;
  profileId?: string;
  documents?: Document[];
  isOwnVault?: boolean;
  hasSignedNDA?: boolean;
  onUploadDocument?: () => void;
  onDownloadDocument?: (documentId: string) => void;
  onSignNDA?: () => void;
  className?: string;
}

export function DocumentsVault({
  profile,
  profileId,
  documents = [],
  isOwnVault = false,
  hasSignedNDA = false,
  onUploadDocument,
  onDownloadDocument,
  onSignNDA,
  className = "",
}: DocumentsVaultProps) {
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<string>("all");

  const [vaultDocuments, setVaultDocuments] = useState<Document[]>(documents);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    const mapDocumentType = (documentType: string): Document["type"] => {
      if (documentType === "financial" || documentType === "legal" || documentType === "operational" || documentType === "marketing") {
        return documentType;
      }
      if (documentType === "business") {
        return "operational";
      }
      return "other";
    };

    const loadDocuments = async () => {
      if (!profileId) {
        setVaultDocuments([]);
        setLoadingDocuments(false);
        return;
      }

      setLoadingDocuments(true);
      try {
        const rows = await ProfileService.getVerificationDocuments(profileId);
        if (!rows?.length) {
          setVaultDocuments([]);
          return;
        }

        setVaultDocuments(
          rows.map((row) => ({
            id: row.id,
            name: row.file_name,
            type: mapDocumentType(row.document_type),
            size: "—",
            uploadDate: row.created_at?.split("T")[0] ?? "",
            uploadedBy: profile.displayName,
            isPrivate: row.document_type !== "identity",
            requiresNDA: row.document_type === "financial" || row.document_type === "legal",
            description: row.status,
            downloadCount: 0,
          }))
        );
      } catch (error) {
        console.error("Failed to load verification documents:", error);
        setVaultDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadDocuments();
  }, [profileId, profile.displayName]);

  const documentTypes = [
    "all",
    "financial",
    "legal",
    "operational",
    "marketing",
    "other",
  ];

  const filteredDocuments =
    selectedDocumentType === "all"
      ? vaultDocuments
      : vaultDocuments.filter((doc) => doc.type === selectedDocumentType);

  const publicDocuments = filteredDocuments.filter((doc) => !doc.isPrivate);
  const privateDocuments = filteredDocuments.filter((doc) => doc.isPrivate);

  const getTypeIcon = (type: Document["type"]) => {
    const icons = {
      financial: "📊",
      legal: "⚖️",
      operational: "⚙️",
      marketing: "📢",
      other: "📄",
    };
    return icons[type] || "📄";
  };

  const getTypeBadge = (type: Document["type"]) => {
    const colors = {
      financial: "bg-secondary text-foreground",
      legal: "bg-trust-blue/10 text-trust-blue",
      operational: "bg-orange-100 text-orange-800",
      marketing: "bg-growth-green/10 text-foreground",
      other: "bg-secondary text-foreground",
    };

    return (
      <Badge className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const handleDocumentAccess = (document: Document) => {
    if (document.requiresNDA && !hasSignedNDA && !isOwnVault) {
      setShowNDAModal(true);
    } else {
      onDownloadDocument?.(document.id);
    }
  };

  const handleNDASign = () => {
    if (ndaAccepted) {
      onSignNDA?.();
      setShowNDAModal(false);
      setNdaAccepted(false);
    }
  };

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents Vault
          </h3>
          <p className="text-sm text-muted-foreground">
            {isOwnVault
              ? "Manage your documents"
              : `${profile.displayName}'s documents`}
          </p>
        </div>

        {isOwnVault && (
          <Button
            onClick={onUploadDocument}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Document Type Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {documentTypes.map((type) => (
          <Button
            key={type}
            variant={selectedDocumentType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDocumentType(type)}
            className="capitalize"
          >
            {type === "all" ? "All Documents" : type}
          </Button>
        ))}
      </div>

      {/* Public Documents */}
      {publicDocuments.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Unlock className="w-4 h-4 text-foreground" />

            <h4 className="font-medium text-foreground">Public Documents</h4>
            <Badge variant="outline" className="text-xs">
              {publicDocuments.length} documents
            </Badge>
          </div>

          <div className="space-y-3">
            {publicDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(document.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-foreground">
                        {document.name}
                      </h5>
                      {getTypeBadge(document.type)}
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{document.size}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />

                        {new Date(document.uploadDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {document.downloadCount} downloads
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDocumentAccess(document)}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  {!isOwnVault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Private Documents */}
      {privateDocuments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-red-600" />

            <h4 className="font-medium text-foreground">Private Documents</h4>
            <Badge variant="outline" className="text-xs">
              {privateDocuments.length} documents
            </Badge>
            {!isOwnVault && !hasSignedNDA && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                NDA Required
              </Badge>
            )}
          </div>

          {!isOwnVault && !hasSignedNDA && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />

                <span className="font-medium text-red-900">NDA Required</span>
              </div>
              <p className="text-sm text-red-800 mb-3">
                These documents contain sensitive information. You must sign a
                Non-Disclosure Agreement to access them.
              </p>
              <Button
                size="sm"
                onClick={() => setShowNDAModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign NDA to Access
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {privateDocuments.map((document) => (
              <div
                key={document.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  !isOwnVault && !hasSignedNDA
                    ? "opacity-50 bg-muted"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(document.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-foreground">
                        {document.name}
                      </h5>
                      {getTypeBadge(document.type)}
                      {document.requiresNDA && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          NDA
                        </Badge>
                      )}
                    </div>
                    {document.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{document.size}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />

                        {new Date(document.uploadDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {document.downloadCount} downloads
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDocumentAccess(document)}
                    disabled={
                      !isOwnVault && !hasSignedNDA && document.requiresNDA
                    }
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

          <h4 className="text-lg font-medium text-foreground mb-2">
            No Documents Found
          </h4>
          <p className="text-muted-foreground mb-4">
            {selectedDocumentType === "all"
              ? "No details found in the table."
              : `No ${selectedDocumentType} documents found.`}
          </p>
          {isOwnVault && (
            <Button onClick={onUploadDocument}>
              Upload Your First Document
            </Button>
          )}
        </div>
      )}

      {/* NDA Modal */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Non-Disclosure Agreement
            </DialogTitle>
            <DialogDescription>
              Please review and accept the NDA to access private documents from{" "}
              {profile.displayName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto p-4 bg-muted rounded-lg text-sm">
              <h4 className="font-medium mb-2">
                CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT
              </h4>
              <p className="mb-2">
                This Non-Disclosure Agreement ("Agreement") is entered into
                between {profile.displayName} ("Disclosing Party") and you
                ("Receiving Party") for the purpose of preventing the
                unauthorized disclosure of Confidential Information.
              </p>
              <p className="mb-2">
                <strong>1. Definition of Confidential Information:</strong> All
                business, financial, operational, and proprietary information
                shared through this platform, including but not limited to
                financial statements, business plans, customer lists, and
                operational procedures.
              </p>
              <p className="mb-2">
                <strong>2. Obligations:</strong> The Receiving Party agrees to
                maintain confidentiality and not disclose, use, or reproduce any
                Confidential Information for any purpose other than evaluating
                potential business opportunities.
              </p>
              <p className="mb-2">
                <strong>3. Term:</strong> This Agreement shall remain in effect
                for a period of 2 years from the date of acceptance.
              </p>
              <p>
                <strong>4. Remedies:</strong> Any breach of this Agreement may
                result in irreparable harm, and the Disclosing Party shall be
                entitled to seek injunctive relief and monetary damages.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="nda-accept"
                checked={ndaAccepted}
                onCheckedChange={(checked) =>
                  setNdaAccepted(checked as boolean)
                }
              />

              <label htmlFor="nda-accept" className="text-sm font-medium">
                I have read, understood, and agree to the terms of this
                Non-Disclosure Agreement
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNDAModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleNDASign}
                disabled={!ndaAccepted}
                className="bg-red-600 hover:bg-red-700"
              >
                Sign NDA & Access Documents
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
