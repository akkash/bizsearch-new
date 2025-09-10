import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Eye,
  Lock,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { DocumentsVault } from "@/polymet/components/documents-vault";
import { VerificationPanel } from "@/polymet/components/verification-panel";
import {
  getCurrentUserProfile,
  getProfileById,
  type UserProfile,
} from "@/polymet/data/profile-data";

interface ProfileDocumentsPageProps {
  className?: string;
}

// Mock document data
const mockDocuments = [
  {
    id: "doc1",
    name: "Financial Statements 2023",
    type: "financial",
    size: "2.4 MB",
    uploadDate: "2024-03-10",
    status: "verified",
    requiresNDA: true,
    category: "Financial",
  },
  {
    id: "doc2",
    name: "Business Registration Certificate",
    type: "legal",
    size: "1.2 MB",
    uploadDate: "2024-03-08",
    status: "verified",
    requiresNDA: false,
    category: "Legal",
  },
  {
    id: "doc3",
    name: "Tax Returns 2022-2023",
    type: "financial",
    size: "3.1 MB",
    uploadDate: "2024-03-05",
    status: "pending",
    requiresNDA: true,
    category: "Financial",
  },
  {
    id: "doc4",
    name: "Franchise Disclosure Document",
    type: "franchise",
    size: "5.8 MB",
    uploadDate: "2024-03-01",
    status: "verified",
    requiresNDA: true,
    category: "Franchise",
  },
  {
    id: "doc5",
    name: "Operational Manual",
    type: "operations",
    size: "12.3 MB",
    uploadDate: "2024-02-28",
    status: "verified",
    requiresNDA: false,
    category: "Operations",
  },
];

export function ProfileDocumentsPage({
  className = "",
}: ProfileDocumentsPageProps) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasSignedNDA, setHasSignedNDA] = useState(false);

  // Get profile data (current user or specific user)
  const profile = userId ? getProfileById(userId) : getCurrentUserProfile();
  const isOwnProfile = !userId || userId === getCurrentUserProfile().id;

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The requested profile could not be found.
          </p>
          <Button onClick={() => navigate("/profile")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(isOwnProfile ? "/profile" : `/profile/${userId}`);
  };

  const handleUploadDocument = () => {
    console.log("Upload document");
    // Open file picker or upload modal
  };

  const handleDownloadDocument = (documentId: string) => {
    console.log("Download document:", documentId);
    // Handle document download
  };

  const handleSignNDA = () => {
    console.log("Sign NDA");
    setHasSignedNDA(true);
    // Handle NDA signing process
  };

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...new Set(mockDocuments.map((doc) => doc.category)),
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;

      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;

      case "rejected":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;

      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground">
              {isOwnProfile
                ? "Manage your documents and verification status"
                : `View ${profile.displayName}'s documents`}
            </p>
          </div>
        </div>

        {isOwnProfile && (
          <Button onClick={handleUploadDocument}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Profile Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatar}
              alt={profile.displayName}
              className="w-12 h-12 rounded-full"
            />

            <div>
              <h3 className="font-semibold">{profile.displayName}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {profile.role}
                </Badge>
                <Badge
                  variant={
                    profile.verificationStatus === "verified"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    profile.verificationStatus === "verified"
                      ? "bg-green-100 text-green-800"
                      : profile.verificationStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {profile.verificationStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Vault
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verification Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />

                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Vault */}
          <DocumentsVault
            profile={profile}
            documents={filteredDocuments}
            isOwnVault={isOwnProfile}
            hasSignedNDA={hasSignedNDA}
            onUploadDocument={handleUploadDocument}
            onDownloadDocument={handleDownloadDocument}
            onSignNDA={handleSignNDA}
          />

          {/* Document List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All Documents
                <Badge variant="secondary">{filteredDocuments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />

                  <p>No documents found</p>
                  <p className="text-sm">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : isOwnProfile
                        ? "Upload your first document to get started"
                        : "No documents have been shared yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(document.status)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {document.name}
                          </h4>
                          {document.requiresNDA && (
                            <Lock className="w-4 h-4 text-orange-600" />
                          )}
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{document.category}</span>
                          <span>{document.size}</span>
                          <span>
                            Uploaded{" "}
                            {new Date(document.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {document.requiresNDA &&
                        !hasSignedNDA &&
                        !isOwnProfile ? (
                          <Button variant="outline" size="sm" disabled>
                            <Lock className="w-4 h-4 mr-2" />
                            NDA Required
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadDocument(document.id)
                              }
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}

                        {isOwnProfile && (
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <VerificationPanel
            profile={profile}
            onUploadDocument={(docId) => console.log("Upload", docId)}
            onViewDocument={(docId) => console.log("View", docId)}
            onStartVerification={() => console.log("Start verification")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
