import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileService } from "@/lib/profile-service";
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
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";
import type { Database } from "@/types/supabase";
import type { UserProfile } from "@/polymet/data/profile-data";
import { adaptSupabaseProfileToUserProfile } from "@/lib/profile-adapter";
import { businessesData } from "@/polymet/data/businesses-data";
import { franchisesData } from "@/polymet/data/franchises-data";
import type { Business } from "@/polymet/data/businesses-data";
import type { Franchise } from "@/polymet/data/franchises-data";

type SupabaseProfile = Database['public']['Tables']['profiles']['Row'];

interface ProfilePageProps {
  className?: string;
}

export function ProfilePage({ className = "" }: ProfilePageProps) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserProfile["role"]>("seller");

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;

      try {
        if (userId) {
          // Load specific user profile
          const data = await ProfileService.getProfile(userId);
          const adaptedProfile = adaptSupabaseProfileToUserProfile(data);
          setProfile(adaptedProfile);
        } else {
          // Load current user profile
          if (currentUserProfile) {
            const adaptedProfile = adaptSupabaseProfileToUserProfile(currentUserProfile);
            setProfile(adaptedProfile);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUserProfile, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The requested profile could not be found.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const handleShare = () => {
    console.log("Share profile");
    navigator.clipboard.writeText(window.location.href);
  };

  const handleMessage = () => {
    console.log("Send message to", profile.displayName);
    // TODO: Implement messaging
  };

  // Get user's listings based on role
  const getUserListings = (): Business[] | Franchise[] => {
    // TODO: Fetch actual user listings from Supabase
    if (profile.role === "seller") {
      return businessesData.filter((b) => b.id === "biz-001" || b.id === "biz-002");
    } else if (profile.role === "franchisor") {
      return franchisesData.filter((f) => f.id === "fran-001" || f.id === "fran-002");
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
                      {sellerProfile.yearEstablished || 'N/A'}
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
                      {sellerProfile.privateInfo?.askingPrice
                        ? `₹${(sellerProfile.privateInfo.askingPrice / 10000000).toFixed(1)} Cr`
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Asking Price
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Business Description</h4>
                  <p className="text-muted-foreground">
                    {sellerProfile.publicInfo?.shortDescription || sellerProfile.bio}
                  </p>
                </div>

                {sellerProfile.publicInfo?.keyFeatures && Array.isArray(sellerProfile.publicInfo.keyFeatures) && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Key Products/Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerProfile.publicInfo.keyFeatures.map((product: string) => (
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
                    {(userListings as Business[]).map((business) => (
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
                      {buyerProfile.buyerType?.replace("_", " ") || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Buyer Type
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {buyerProfile.investmentRange?.min && buyerProfile.investmentRange?.max
                        ? `₹${(buyerProfile.investmentRange.min / 10000000).toFixed(1)}-${(buyerProfile.investmentRange.max / 10000000).toFixed(1)} Cr`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Investment Range
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {Array.isArray(buyerProfile.preferredIndustries) ? buyerProfile.preferredIndustries.length : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Industries
                    </div>
                  </div>
                </div>

                {Array.isArray(buyerProfile.preferredIndustries) && buyerProfile.preferredIndustries.length > 0 && (
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

                {buyerProfile.experience && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Investment Criteria</h4>
                    <p className="text-muted-foreground">
                      {buyerProfile.experience}
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
                      {franchisorProfile.totalOutlets || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Outlets
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {franchisorProfile.royaltyPercentage || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Royalty</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {franchisorProfile.franchiseFee
                        ? `₹${(franchisorProfile.franchiseFee / 100000).toFixed(0)}L`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Franchise Fee
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {franchisorProfile.investmentRange?.min && franchisorProfile.investmentRange?.max
                        ? `₹${(franchisorProfile.investmentRange.min / 10000000).toFixed(1)}-${(franchisorProfile.investmentRange.max / 10000000).toFixed(1)} Cr`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Investment
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Brand Description</h4>
                  <p className="text-muted-foreground">
                    {franchisorProfile.publicInfo?.brandStory || franchisorProfile.bio}
                  </p>
                </div>

                {franchisorProfile.publicInfo?.supportProvided && franchisorProfile.publicInfo.supportProvided.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Training Support</h5>
                      <p className="text-sm text-muted-foreground">
                        {franchisorProfile.publicInfo.supportProvided[0] || 'Comprehensive training provided'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Marketing Support</h5>
                      <p className="text-sm text-muted-foreground">
                        {franchisorProfile.publicInfo.supportProvided[1] || 'Marketing assistance available'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2">Operations Support</h5>
                      <p className="text-sm text-muted-foreground">
                        {franchisorProfile.publicInfo.supportProvided[2] || 'Ongoing operational support'}
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
                    {(userListings as Franchise[]).map((franchise) => (
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
          {/* Profile Completeness Card for Own Profile */}
          {isOwnProfile && (
            <ProfileCompletenessCard className="mb-4" />
          )}

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
