import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  Edit,
  Share2,
  Building2,
  Users,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react";
import { type UserProfile } from "@/polymet/data/profile-data";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ProfileHeader({
  profile,
  isOwnProfile = false,
  onEdit,
  onShare,
  className = "",
}: ProfileHeaderProps) {
  const getVerificationIcon = () => {
    switch (profile.verificationStatus) {
      case "verified":
        return <ShieldCheck className="w-4 h-4 text-foreground" />;

      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;

      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getVerificationBadge = () => {
    const variants = {
      verified: "bg-secondary text-foreground border-border",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      unverified: "bg-secondary text-muted-foreground border-border",
    };

    return (
      <Badge variant="outline" className={variants[profile.verificationStatus]}>
        {getVerificationIcon()}
        <span className="ml-1 capitalize">{profile.verificationStatus}</span>
      </Badge>
    );
  };

  const getRoleBadge = () => {
    const roleConfig = {
      seller: {
        label: "Business Seller",
        icon: Building2,
        color: "bg-trust-blue/10 text-trust-blue border-trust-blue/20",
      },
      buyer: {
        label: "Business Buyer",
        icon: TrendingUp,
        color: "bg-secondary text-foreground border-border",
      },
      franchisor: {
        label: "Franchisor",
        icon: Users,
        color: "bg-orange-100 text-orange-800 border-orange-200",
      },
      franchisee: {
        label: "Franchisee",
        icon: Award,
        color: "bg-growth-green/10 text-foreground border-growth-green/30",
      },
      advisor: {
        label: "Advisor/Broker",
        icon: Globe,
        color: "bg-secondary text-foreground border-border",
      },
    };

    const config = roleConfig[profile.role];
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <IconComponent className="w-4 h-4 mr-1" />

        {config.label}
      </Badge>
    );
  };

  const getCompanyInfo = () => {
    switch (profile.role) {
      case "seller": {
        const sellerProfile = profile as any;
        return {
          name: sellerProfile.companyName,
          logo: sellerProfile.companyLogo,
          subtitle: `${sellerProfile.industry} • ${sellerProfile.employees} employees`,
        };
      }
      case "buyer": {
        const buyerProfile = profile as any;
        return {
          name: buyerProfile.firmName || "Individual Investor",
          logo: buyerProfile.firmLogo,
          subtitle: `${buyerProfile.buyerType.replace("-", " ").toUpperCase()} • ₹${(buyerProfile.investmentRange.min / 10000000).toFixed(1)}-${(buyerProfile.investmentRange.max / 10000000).toFixed(1)}Cr range`,
        };
      }
      case "franchisor": {
        const franchisorProfile = profile as any;
        return {
          name: franchisorProfile.brandName,
          logo: franchisorProfile.brandLogo,
          subtitle: `${franchisorProfile.industry} • ${franchisorProfile.totalOutlets} outlets`,
        };
      }
      case "franchisee": {
        const franchiseeProfile = profile as any;
        return {
          name: "Franchise Investor",
          logo: undefined,
          subtitle: `Budget: ₹${(franchiseeProfile.investmentBudget.min / 10000000).toFixed(1)}-${(franchiseeProfile.investmentBudget.max / 10000000).toFixed(1)}Cr`,
        };
      }
      case "advisor": {
        const advisorProfile = profile as any;
        return {
          name: advisorProfile.firmName,
          logo: advisorProfile.firmLogo,
          subtitle: `${advisorProfile.experience} years experience • ${advisorProfile.services.length} services`,
        };
      }
      default:
        return { name: "", logo: undefined, subtitle: "" };
    }
  };

  const companyInfo = getCompanyInfo();

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex gap-4">
            <img
              src={profile.avatar || "https://github.com/polymet-ai.png"}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />

            {companyInfo.logo && (
              <img
                src={companyInfo.logo}
                alt={companyInfo.name}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile.displayName}
              </h1>
              {companyInfo.name && (
                <p className="text-lg text-muted-foreground font-medium">
                  {companyInfo.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{companyInfo.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {getRoleBadge()}
              {getVerificationBadge()}
              {profile.isPublic && (
                <Badge
                  variant="outline"
                  className="bg-trust-blue/10 text-trust-blue border-trust-blue/20"
                >
                  <Globe className="w-3 h-3 mr-1" />
                  Public Profile
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />

                <span>
                  {profile.location.city}, {profile.location.state}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />

                <span>
                  Joined {new Date(profile.joinedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 md:w-auto">
          {isOwnProfile ? (
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="space-y-2">
              <Button className="w-full">Connect</Button>
              <Button variant="outline" className="w-full">
                Message
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-foreground leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Role-specific Quick Stats */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile.role === "seller" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).listings?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).inquiries || 0}
                </div>
                <div className="text-sm text-muted-foreground">Inquiries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).offers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).employees || 0}
                </div>
                <div className="text-sm text-muted-foreground">Employees</div>
              </div>
            </>
          )}

          {profile.role === "buyer" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).savedBusinesses?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).ndaRequests?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">NDAs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).preferredIndustries?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Industries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ₹
                  {((profile as any).investmentRange?.max / 10000000).toFixed(
                    0
                  )}
                  Cr
                </div>
                <div className="text-sm text-muted-foreground">Max Budget</div>
              </div>
            </>
          )}

          {profile.role === "franchisor" && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).totalOutlets || 0}
                </div>
                <div className="text-sm text-muted-foreground">Outlets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).leads || 0}
                </div>
                <div className="text-sm text-muted-foreground">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).royaltyPercentage || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Royalty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {(profile as any).yearFounded
                    ? new Date().getFullYear() - (profile as any).yearFounded
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Years</div>
              </div>
            </>
          )}

          {(profile.role === "franchisee" || profile.role === "advisor") && (
            <div className="col-span-2 md:col-span-4 text-center text-muted-foreground">
              <p>Profile statistics will appear here based on activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
