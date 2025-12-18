import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ShieldCheck,
  Clock,
  AlertCircle,
  Upload,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { type UserProfile } from "@/polymet/data/profile-data";
import { PhoneVerification } from "@/components/auth/phone-verification";

interface VerificationDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: "not_uploaded" | "uploaded" | "verified" | "rejected";
  uploadDate?: string;
  rejectionReason?: string;
}

interface VerificationPanelProps {
  profile: UserProfile;
  onUploadDocument?: (documentId: string) => void;
  onViewDocument?: (documentId: string) => void;
  onStartVerification?: () => void;
  className?: string;
}

export function VerificationPanel({
  profile,
  onUploadDocument,
  onViewDocument,
  onStartVerification,
  className = "",
}: VerificationPanelProps) {
  const getRequiredDocuments = (
    role: UserProfile["role"]
  ): VerificationDocument[] => {
    const baseDocuments = [
      {
        id: "identity",
        name: "Government ID",
        description: "Aadhaar Card, PAN Card, or Passport",
        required: true,
        status: "verified" as const,
        uploadDate: "2024-01-10",
      },
      {
        id: "address",
        name: "Address Proof",
        description: "Utility bill or bank statement (last 3 months)",
        required: true,
        status: "verified" as const,
        uploadDate: "2024-01-10",
      },
    ];

    const roleSpecificDocs: Record<
      UserProfile["role"],
      VerificationDocument[]
    > = {
      seller: [
        ...baseDocuments,
        {
          id: "business_registration",
          name: "Business Registration",
          description: "Certificate of Incorporation or Partnership Deed",
          required: true,
          status: "uploaded",
          uploadDate: "2024-01-12",
        },
        {
          id: "gst_certificate",
          name: "GST Certificate",
          description: "Valid GST registration certificate",
          required: true,
          status: "not_uploaded",
        },
        {
          id: "financial_statements",
          name: "Financial Statements",
          description: "Last 3 years P&L and Balance Sheet",
          required: true,
          status: "not_uploaded",
        },
        {
          id: "bank_statements",
          name: "Bank Statements",
          description: "Last 12 months business bank statements",
          required: false,
          status: "not_uploaded",
        },
      ],

      buyer: [
        ...baseDocuments,
        {
          id: "income_proof",
          name: "Income Proof",
          description: "ITR or salary slips for last 2 years",
          required: true,
          status: "uploaded",
          uploadDate: "2024-01-11",
        },
        {
          id: "net_worth",
          name: "Net Worth Statement",
          description: "CA certified net worth statement",
          required: true,
          status: "not_uploaded",
        },
        {
          id: "investment_experience",
          name: "Investment Experience",
          description:
            "Previous investment portfolio or business ownership proof",
          required: false,
          status: "not_uploaded",
        },
      ],

      franchisor: [
        ...baseDocuments,
        {
          id: "brand_registration",
          name: "Brand Registration",
          description: "Trademark registration certificate",
          required: true,
          status: "verified",
          uploadDate: "2024-01-08",
        },
        {
          id: "franchise_agreement",
          name: "Franchise Agreement Template",
          description: "Legal franchise agreement template",
          required: true,
          status: "uploaded",
          uploadDate: "2024-01-09",
        },
        {
          id: "financial_disclosure",
          name: "Financial Disclosure Document",
          description: "FDD with financial performance representations",
          required: true,
          status: "not_uploaded",
        },
      ],

      franchisee: [
        ...baseDocuments,
        {
          id: "financial_capacity",
          name: "Financial Capacity Proof",
          description: "Bank statements and investment capacity proof",
          required: true,
          status: "not_uploaded",
        },
        {
          id: "business_plan",
          name: "Business Plan",
          description: "Detailed business plan for franchise operation",
          required: false,
          status: "not_uploaded",
        },
      ],

      advisor: [
        ...baseDocuments,
        {
          id: "professional_license",
          name: "Professional License",
          description: "Real estate or business broker license",
          required: true,
          status: "verified",
          uploadDate: "2024-01-05",
        },
        {
          id: "experience_certificate",
          name: "Experience Certificate",
          description: "Proof of relevant industry experience",
          required: true,
          status: "uploaded",
          uploadDate: "2024-01-06",
        },
        {
          id: "client_testimonials",
          name: "Client Testimonials",
          description: "References from previous successful deals",
          required: false,
          status: "not_uploaded",
        },
      ],
    };

    return roleSpecificDocs[role] || baseDocuments;
  };

  const documents = getRequiredDocuments(profile.role);
  const totalRequired = documents.filter((doc) => doc.required).length;
  const completedRequired = documents.filter(
    (doc) =>
      doc.required && (doc.status === "verified" || doc.status === "uploaded")
  ).length;
  const verificationProgress = (completedRequired / totalRequired) * 100;

  const getStatusIcon = (status: VerificationDocument["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;

      case "uploaded":
        return <Clock className="w-4 h-4 text-yellow-600" />;

      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;

      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: VerificationDocument["status"]) => {
    const variants = {
      verified: "bg-green-100 text-green-800",
      uploaded: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      not_uploaded: "bg-gray-100 text-gray-600",
    };

    const labels = {
      verified: "Verified",
      uploaded: "Under Review",
      rejected: "Rejected",
      not_uploaded: "Not Uploaded",
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getVerificationStatusIcon = () => {
    switch (profile.verificationStatus) {
      case "verified":
        return <ShieldCheck className="w-6 h-6 text-green-600" />;

      case "pending":
        return <Clock className="w-6 h-6 text-yellow-600" />;

      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Phone Verification Section */}
      <PhoneVerification />

      {/* Document Verification Panel */}
      <div className="bg-white border rounded-lg p-6">
        {/* Verification Status Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getVerificationStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Verification Status
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {profile.verificationStatus === "verified" &&
                  "Your profile is fully verified"}
                {profile.verificationStatus === "pending" &&
                  "Verification in progress"}
                {profile.verificationStatus === "unverified" &&
                  "Complete verification to build trust"}
              </p>
            </div>
          </div>

          {profile.verificationStatus === "unverified" && (
            <Button onClick={onStartVerification}>Start Verification</Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress ({completedRequired}/{totalRequired} required documents)
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(verificationProgress)}%
            </span>
          </div>
          <Progress value={verificationProgress} className="h-2" />
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Required Documents</h4>

          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(doc.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">{doc.name}</h5>
                    {doc.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>

                  {doc.uploadDate && (
                    <p className="text-xs text-gray-500">
                      Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  )}

                  {doc.status === "rejected" && doc.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      Rejected: {doc.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(doc.status)}

                {doc.status === "not_uploaded" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUploadDocument?.(doc.id)}
                    className="flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Upload
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewDocument?.(doc.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Verification Benefits */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Verification Benefits
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Higher visibility in search results</li>
            <li>• Increased trust from potential partners</li>
            <li>• Access to premium features and tools</li>
            <li>• Priority customer support</li>
            <li>• Verified badge on your profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
