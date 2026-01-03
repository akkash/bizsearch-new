import React from "react";
import {
  Heart,
  Share2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Shield,
  Star,
  Building,
  Percent,
  Users2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Franchise } from "@/types/listings";
import { VerificationBadge, LastVerifiedLabel, type VerificationStatus } from "@/components/verification-badge";

interface FranchiseCardProps {
  franchise: Franchise;
  onSave?: (franchiseId: string) => void;
  onShare?: (franchiseId: string) => void;
  onContact?: (franchiseId: string) => void;
  onViewDetails?: (franchiseId: string) => void;
  onMoreLikeThis?: (franchiseId: string) => void;
  isSaved?: boolean;
  className?: string;
}

export function FranchiseCard({
  franchise,
  onSave,
  onShare,
  onContact,
  onViewDetails,
  onMoreLikeThis,
  isSaved = false,
  className,
}: FranchiseCardProps) {
  const formatInvestment = (amount?: number | null) => {
    if (!amount || amount === 0) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 1000000) return `₹${(amount / 1000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  // Updated: Use neutral colors instead of red for low ROI to avoid "stop sign" psychology
  const getROIColor = (roi: number) => {
    if (roi >= 50) return "text-emerald-600";
    if (roi >= 30) return "text-green-600";
    if (roi >= 15) return "text-amber-600";
    return "text-muted-foreground"; // Neutral instead of red
  };

  const firstYearROI = franchise.expected_roi_percentage || 0;
  const brandName = franchise.brand_name || franchise.brandName || 'Franchise';
  const logoUrl = franchise.logo_url || franchise.logo;
  const totalOutlets = franchise.total_outlets || franchise.outlets || 0;

  return (
    <Card
      className={`group hover:shadow-2xl transition-all duration-300 card-hover-lift cursor-pointer ${className}`}
      onClick={() => onViewDetails?.(franchise.id)}
    >
      <CardContent className="p-0">
        {/* Header with Logo and Brand */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg overflow-hidden">
            {franchise.images && franchise.images.length > 0 ? (
              <img
                src={typeof franchise.images === 'string' ? franchise.images : franchise.images[0]}
                alt={brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-600">
                  {brandName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Logo overlay */}
          <Avatar className="absolute -bottom-6 left-4 h-12 w-12 border-2 border-background">
            <AvatarImage src={logoUrl} alt={brandName} />

            <AvatarFallback className="bg-primary text-primary-foreground">
              {brandName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(franchise.id);
            }}
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {franchise.featured && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {franchise.trending && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            {franchise.badges && franchise.badges.includes && franchise.badges.includes("Hot Deal") && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse">
                🔥 Hot Deal
              </Badge>
            )}
            {franchise.badges && franchise.badges.includes && franchise.badges.includes("New") && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                ✨ New
              </Badge>
            )}
            {firstYearROI >= 50 && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                📈 High ROI
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 pt-8">
          {/* Brand Name and Industry */}
          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">
              {brandName}
            </h3>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{franchise.industry}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building className="h-4 w-4 mr-1" />

                <span>{totalOutlets} outlets</span>
              </div>
            </div>
          </div>

          {/* Verification Status Badge */}
          {franchise.verification_status && (
            <div className="flex items-center gap-2 mb-2">
              <VerificationBadge
                status={franchise.verification_status as VerificationStatus}
                verifiedAt={franchise.verified_at}
                size="sm"
              />
              {franchise.verified_at && (
                <LastVerifiedLabel verifiedAt={franchise.verified_at} />
              )}
            </div>
          )}

          {/* Investment and ROI - Investment is now the visual hero */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Investment</div>
              <div className="font-bold text-xl text-trust-blue">
                {formatInvestment(franchise.total_investment_min || 0)}
                {franchise.total_investment_max && franchise.total_investment_max !== franchise.total_investment_min && (
                  <span className="text-base font-semibold"> - {formatInvestment(franchise.total_investment_max)}</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expected ROI</div>
              {/* Hide 0% ROI to avoid negative impression */}
              {firstYearROI > 0 ? (
                <div className={`font-semibold text-lg ${getROIColor(firstYearROI)}`}>
                  {firstYearROI}% (Y1)
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Contact for details
                </div>
              )}
            </div>
          </div>

          {/* Franchise Details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Franchise Fee:</span>
              <span className="font-medium">
                {formatInvestment(franchise.franchise_fee)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Royalty:</span>
              <span className="font-medium flex items-center">
                <Percent className="h-3 w-3 mr-1" />
                {franchise.royalty_percentage || 0}%
              </span>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap gap-1 mb-4">
            {franchise.badges && Array.isArray(franchise.badges) && franchise.badges.map((badge) => (
              <Badge
                key={badge}
                variant={badge === "Verified" ? "default" : "secondary"}
                className={`text-xs ${badge === "Verified" ? "bg-green-500 hover:bg-green-600" : ""
                  }`}
              >
                {badge === "Verified" && <Shield className="h-3 w-3 mr-1" />}
                {badge}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {franchise.description}
          </p>

          {/* Key Features */}
          {franchise.highlights &&
            franchise.highlights.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Key Highlights</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {franchise.highlights.slice(0, 2).map((highlight: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <Star className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0 text-yellow-500" />

                      <span className="line-clamp-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Additional Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {franchise.support_provided && franchise.support_provided.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Users2 className="h-3 w-3 mr-1" />
                Training & Support
              </Badge>
            )}
            {franchise.marketing_support && (
              <Badge variant="outline" className="text-xs">
                Financing Available
              </Badge>
            )}
          </div>

          {/* Territories */}
          {franchise.territories && franchise.territories.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">
                Available Territories
              </div>
              <div className="flex flex-wrap gap-1">
                {franchise.territories.slice(0, 3).map((territory, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />

                    {territory}
                  </Badge>
                ))}
                {franchise.territories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{franchise.territories.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-3">
          <Separator />

          {/* Contact Info */}
          {franchise.contact?.franchiseDeveloper && (
            <div className="text-sm text-muted-foreground">
              Contact: {franchise.contact.franchiseDeveloper}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onContact?.(franchise.id);
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(franchise.id);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(franchise.id);
                }}
              >
                View Details
              </Button>
            </div>

            {/* AI-Powered More Like This */}
            {onMoreLikeThis && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreLikeThis?.(franchise.id);
                }}
              >
                🤖 More Like This (AI)
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
