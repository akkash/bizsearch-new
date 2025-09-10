import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Edit,
  Share2,
  MessageSquare,
  FileText,
  Users,
  Activity,
  Shield,
  Eye,
  Building,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
} from "lucide-react";
import { ProfileHeader } from "@/polymet/components/profile-header";
import { RoleTabs } from "@/polymet/components/role-tabs";
import { VerificationPanel } from "@/polymet/components/verification-panel";
import { DocumentsVault } from "@/polymet/components/documents-vault";
import { ActivityTimeline } from "@/polymet/components/activity-timeline";
import { TeamManagement } from "@/polymet/components/team-management";
import { BusinessCard } from "@/polymet/components/business-card";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import {
  getCurrentUserProfile,
  getProfileById,
  type UserProfile,
} from "@/polymet/data/profile-data";
import { businessesData } from "@/polymet/data/businesses-data";
import { franchisesData } from "@/polymet/data/franchises-data";

interface ProfilePageProps {
  className?: string;
}

export function ProfilePage({ className = "" }: ProfilePageProps) {
  const { userId } = useParams();
  const [activeRole, setActiveRole] = useState<UserProfile["role"]>("seller");

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
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    console.log("Edit profile");
    // Navigate to edit page
  };

  const handleShare = () => {
    console.log("Share profile");
    navigator.clipboard.writeText(window.location.href);
  };

  const handleMessage = () => {
    console.log("Send message to", profile.displayName);
  };

  // Get user's listings based on role
  const getUserListings = () => {
    if (profile.role === "seller") {
      return businessesData.filter((b) => b.id === "b1" || b.id === "b2"); // Mock user's businesses
    } else if (profile.role === "franchisor") {
      return franchisesData.filter((f) => f.id === "f1" || f.id === "f2"); // Mock user's franchises
    }
    return [];
  };

  const userListings = getUserListings();

  const renderRoleSpecificContent = () => {
    switch (profile.role) {
      case "seller":
        const sellerProfile = profile as any;
        return (
          <div className="space-y-6">
            {/* Business Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {sellerProfile.foundedYear}
                    </div>
                    <div className="text-sm text-muted-foreground">Founded</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {sellerProfile.employees}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Employees
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {sellerProfile.industry}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Industry
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ₹
                      {(
                        sellerProfile.privateInfo?.askingPrice / 10000000
                      ).toFixed(1)}
                      Cr
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Asking Price
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Business Description</h4>
                  <p className="text-muted-foreground">
                    {sellerProfile.description}
                  </p>
                </div>

                {sellerProfile.keyProducts && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Key Products/Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerProfile.keyProducts.map((product: string) => (
                        <Badge key={product} variant="secondary">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Listings */}
            {userListings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Active Listings
                    <Badge variant="secondary">{userListings.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userListings.map((business) => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                        onViewDetails={() => console.log("View", business.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "buyer":
        const buyerProfile = profile as any;
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary capitalize">
                      {buyerProfile.buyerType?.replace("_", " ")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Buyer Type
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      ₹
                      {(buyerProfile.investmentRange?.min / 10000000).toFixed(
                        1
                      )}
                      -
                      {(buyerProfile.investmentRange?.max / 10000000).toFixed(
                        1
                      )}
                      Cr
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Investment Range
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {buyerProfile.preferredIndustries?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Industries
                    </div>
                  </div>
                </div>

                {buyerProfile.preferredIndustries && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Preferred Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {buyerProfile.preferredIndustries.map(
                        (industry: string) => (
                          <Badge key={industry} variant="secondary">
                            {industry}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {buyerProfile.investmentCriteria && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Investment Criteria</h4>
                    <p className="text-muted-foreground">
                      {buyerProfile.investmentCriteria}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "franchisor":
        const franchisorProfile = profile as any;
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Franchise Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {franchisorProfile.totalOutlets}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Outlets
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {franchisorProfile.royaltyPercentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Royalty</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ₹{(franchisorProfile.franchiseFee / 100000).toFixed(0)}L
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Franchise Fee
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      ₹{(franchisorProfile.investmentMin / 100000).toFixed(0)}-
                      {(franchisorProfile.investmentMax / 100000).toFixed(0)}L
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Investment
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Brand Description</h4>
                  <p className="text-muted-foreground">
                    {franchisorProfile.description}
                  </p>
                </div>

                {franchisorProfile.support && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Training Support</h5>
                      <p className="text-sm text-muted-foreground">
                        {franchisorProfile.support.training}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Marketing Support</h5>
                      <p className="text-sm text-muted-foreground">
                        {franchisorProfile.support.marketing}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Operations Support</h5>
                      <p className="text-sm text-muted-foreground">
                        {franchisorProfile.support.operations}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Franchise Listings */}
            {userListings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Franchise Opportunities
                    <Badge variant="secondary">{userListings.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userListings.map((franchise) => (
                      <FranchiseCard
                        key={franchise.id}
                        franchise={franchise}
                        onViewDetails={() => console.log("View", franchise.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Profile content for {profile.role} role is coming soon.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 space-y-8 ${className}`}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={handleEdit}
        onShare={handleShare}
      />

      {/* Action Buttons for External Profiles */}
      {!isOwnProfile && (
        <div className="flex gap-3">
          <Button onClick={handleMessage} className="flex-1 sm:flex-none">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="team">Team</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Role Tabs for Multi-role Users */}
          {isOwnProfile && (
            <RoleTabs
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              showAddRole={true}
              onAddRole={() => console.log("Add new role")}
            />
          )}

          {/* Role-specific Content */}
          {renderRoleSpecificContent()}
        </TabsContent>

        <TabsContent value="verification">
          <VerificationPanel
            profile={profile}
            onUploadDocument={(docId) => console.log("Upload", docId)}
            onViewDocument={(docId) => console.log("View", docId)}
            onStartVerification={() => console.log("Start verification")}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsVault
            profile={profile}
            isOwnVault={isOwnProfile}
            hasSignedNDA={false}
            onUploadDocument={() => console.log("Upload document")}
            onDownloadDocument={(docId) => console.log("Download", docId)}
            onSignNDA={() => console.log("Sign NDA")}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline userId={profile.id} limit={20} showFilters={true} />
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="team">
            <TeamManagement
              onInviteMember={(email, role) =>
                console.log("Invite", email, role)
              }
              onUpdateRole={(id, role) => console.log("Update role", id, role)}
              onRemoveMember={(id) => console.log("Remove", id)}
              onResendInvite={(id) => console.log("Resend", id)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
