import {
  Heart,
  Share2,
  Phone,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Business } from "@/types/listings";
import { VerificationIcon } from "@/components/verification/VerificationBadge";
import type { VerificationTier } from "@/hooks/use-verification-tier";
import { usePhoneVerification } from "@/hooks/use-phone-verification";
import { PhoneVerificationModal } from "@/polymet/components/phone-verification-modal";

interface BusinessCardProps {
  business: Business;
  onSave?: (businessId: string) => void;
  onShare?: (businessId: string) => void;
  onContact?: (businessId: string) => void;
  onViewDetails?: (businessId: string) => void;
  onEdit?: (businessId: string) => void;
  onMoreLikeThis?: (businessId: string) => void;
  isSaved?: boolean;
  className?: string;
}

export function BusinessCard({
  business,
  onSave,
  onShare,
  onContact,
  onViewDetails,
  onEdit,
  onMoreLikeThis,
  isSaved = false,
  className,
}: BusinessCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 1000000) return `₹${(price / 1000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatRevenue = (revenue: number) => {
    if (revenue >= 10000000) return `₹${(revenue / 10000000).toFixed(1)}Cr`;
    if (revenue >= 1000000) return `₹${(revenue / 1000000).toFixed(1)}Cr`;
    if (revenue >= 100000) return `₹${(revenue / 100000).toFixed(1)}L`;
    return `₹${revenue.toLocaleString()}`;
  };

  const { isVerified, verifyPhone, isOpen: isPhoneModalOpen, setIsOpen: setIsPhoneModalOpen, onVerificationComplete } = usePhoneVerification();


  return (
    <Card
      className={`group hover:shadow-2xl transition-all duration-300 card-hover-lift cursor-pointer ${className}`}
      onClick={() => onViewDetails?.(business.id)}
    >
      <CardContent className="p-0">
        {/* Image and Logo */}
        <div className="relative">
          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
            {business.images && business.images.length > 0 ? (
              <img
                src={business.images[0]}
                alt={business.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {business.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Logo overlay */}
          {business.logo && (
            <Avatar className="absolute -bottom-6 left-4 h-12 w-12 border-2 border-background">
              <AvatarImage src={business.logo} alt={business.name} />

              <AvatarFallback>{business.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(business.id);
            }}
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {business.trending && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            {business.featured && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {business.badges.includes("Hot Deal") && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse">
                🔥 Hot Deal
              </Badge>
            )}
            {business.badges.includes("New") && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                ✨ New
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 pt-8">
          {/* Title and Location */}
          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">
              {business.name}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />

              <span className="line-clamp-1">{business.location}</span>
            </div>
          </div>

          {/* Industry, Type, and Verification */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{business.industry}</Badge>
            <Badge variant="outline">{business.businessType}</Badge>
            {business.verification?.verified && (
              <VerificationIcon
                tier={(business.verification.documentsVerified ? 4 : 3) as VerificationTier}
              />
            )}
          </div>

          {/* Key Metrics - Price is the visual hero */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Asking Price</div>
              <div className="font-bold text-xl text-trust-blue">
                {formatPrice(business.price)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Annual Revenue</div>
              <div className="font-semibold text-lg text-green-600">
                {business.revenue ? formatRevenue(business.revenue) : <span className="text-muted-foreground text-sm italic">Not disclosed</span>}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />

              <span>Est. {business.establishedYear}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />

              <span>{business.employees} employees</span>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap gap-1 mb-4">
            {business.badges && business.badges.map((badge: any) => (
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
            {business.description}
          </p>

          {/* Highlights */}
          {business.highlights && business.highlights.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Key Highlights</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {business.highlights.slice(0, 2).map((highlight: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <Star className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0 text-yellow-500" />

                    <span className="line-clamp-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-3">
          <Separator />

          {/* Contact Info */}
          {business.broker_name && (
            <div className="text-sm text-muted-foreground">
              Contact: {business.broker_name}
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
                  if (!isVerified) {
                    const proceed = verifyPhone();
                    if (!proceed) return;
                  }
                  onContact?.(business.id);
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
              {onEdit ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(business.id);
                  }}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(business.id);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(business.id);
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
                  onMoreLikeThis?.(business.id);
                }}
              >
                🤖 More Like This (AI)
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
        onVerified={onVerificationComplete}
      />
    </Card>
  );
}
