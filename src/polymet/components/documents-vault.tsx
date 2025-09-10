import React, { useState } from "react";
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
} from "lucide-react";
import { type UserProfile } from "@/polymet/data/profile-data";

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

  // Mock documents based on role
  const getMockDocuments = (): Document[] => {
    const baseDocuments: Document[] = [
      {
        id: "doc1",
        name: "Company Profile.pdf",
        type: "marketing",
        size: "2.4 MB",
        uploadDate: "2024-01-15",
        uploadedBy: profile.displayName,
        isPrivate: false,
        requiresNDA: false,
        description: "Company overview and capabilities",
        downloadCount: 12,
      },
      {
        id: "doc2",
        name: "Business License.pdf",
        type: "legal",
        size: "1.2 MB",
        uploadDate: "2024-01-10",
        uploadedBy: profile.displayName,
        isPrivate: true,
        requiresNDA: true,
        description: "Official business registration documents",
        downloadCount: 3,
      },
    ];

    const roleSpecificDocs: Record<UserProfile["role"], Document[]> = {
      seller: [
        ...baseDocuments,
        {
          id: "doc3",
          name: "Financial_Statements_2023.xlsx",
          type: "financial",
          size: "5.8 MB",
          uploadDate: "2024-01-12",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: true,
          description: "Detailed P&L and balance sheet for 2023",
          downloadCount: 8,
        },
        {
          id: "doc4",
          name: "Asset_Inventory.pdf",
          type: "operational",
          size: "3.1 MB",
          uploadDate: "2024-01-08",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: true,
          description: "Complete inventory of business assets",
          downloadCount: 5,
        },
        {
          id: "doc5",
          name: "Customer_Contracts.zip",
          type: "legal",
          size: "12.4 MB",
          uploadDate: "2024-01-05",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: true,
          description: "Key customer contracts and agreements",
          downloadCount: 2,
        },
      ],

      buyer: [
        ...baseDocuments,
        {
          id: "doc3",
          name: "Investment_Criteria.pdf",
          type: "other",
          size: "1.8 MB",
          uploadDate: "2024-01-14",
          uploadedBy: profile.displayName,
          isPrivate: false,
          requiresNDA: false,
          description: "Investment preferences and criteria",
          downloadCount: 15,
        },
        {
          id: "doc4",
          name: "Proof_of_Funds.pdf",
          type: "financial",
          size: "2.2 MB",
          uploadDate: "2024-01-11",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: true,
          description: "Bank statements and financial capacity proof",
          downloadCount: 0,
        },
      ],

      franchisor: [
        ...baseDocuments,
        {
          id: "doc3",
          name: "Franchise_Disclosure_Document.pdf",
          type: "legal",
          size: "8.7 MB",
          uploadDate: "2024-01-13",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: true,
          description: "Complete FDD with financial performance data",
          downloadCount: 18,
        },
        {
          id: "doc4",
          name: "Operations_Manual.pdf",
          type: "operational",
          size: "15.2 MB",
          uploadDate: "2024-01-09",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: true,
          description: "Comprehensive franchise operations guide",
          downloadCount: 7,
        },
        {
          id: "doc5",
          name: "Marketing_Kit.zip",
          type: "marketing",
          size: "25.6 MB",
          uploadDate: "2024-01-07",
          uploadedBy: profile.displayName,
          isPrivate: false,
          requiresNDA: false,
          description: "Brand assets and marketing materials",
          downloadCount: 34,
        },
      ],

      franchisee: [
        ...baseDocuments,
        {
          id: "doc3",
          name: "Business_Plan_Draft.pdf",
          type: "other",
          size: "4.3 MB",
          uploadDate: "2024-01-12",
          uploadedBy: profile.displayName,
          isPrivate: true,
          requiresNDA: false,
          description: "Franchise business plan and projections",
          downloadCount: 1,
        },
      ],

      advisor: [
        ...baseDocuments,
        {
          id: "doc3",
          name: "Client_Success_Stories.pdf",
          type: "marketing",
          size: "6.1 MB",
          uploadDate: "2024-01-11",
          uploadedBy: profile.displayName,
          isPrivate: false,
          requiresNDA: false,
          description: "Case studies and client testimonials",
          downloadCount: 22,
        },
        {
          id: "doc4",
          name: "Professional_Credentials.pdf",
          type: "legal",
          size: "2.8 MB",
          uploadDate: "2024-01-06",
          uploadedBy: profile.displayName,
          isPrivate: false,
          requiresNDA: false,
          description: "Licenses and professional certifications",
          downloadCount: 9,
        },
      ],
    };

    return documents.length > 0
      ? documents
      : roleSpecificDocs[profile.role] || baseDocuments;
  };

  const vaultDocuments = getMockDocuments();
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
      financial: "bg-green-100 text-green-800",
      legal: "bg-blue-100 text-blue-800",
      operational: "bg-orange-100 text-orange-800",
      marketing: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
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
    <div className={`bg-white border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents Vault
          </h3>
          <p className="text-sm text-gray-600">
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
            <Unlock className="w-4 h-4 text-green-600" />

            <h4 className="font-medium text-gray-900">Public Documents</h4>
            <Badge variant="outline" className="text-xs">
              {publicDocuments.length} documents
            </Badge>
          </div>

          <div className="space-y-3">
            {publicDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(document.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">
                        {document.name}
                      </h5>
                      {getTypeBadge(document.type)}
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-600 mb-1">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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

            <h4 className="font-medium text-gray-900">Private Documents</h4>
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
                    ? "opacity-50 bg-gray-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(document.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">
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
                      <p className="text-sm text-gray-600 mb-1">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />

          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Documents Found
          </h4>
          <p className="text-gray-600 mb-4">
            {selectedDocumentType === "all"
              ? "No documents have been uploaded yet."
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
            <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg text-sm">
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
