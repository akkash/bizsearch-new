import {
  Heart,
  MapPin,
  GitCompareArrows,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Business } from "@/types/listings";
import { VerificationBadge, type VerificationStatus } from "@/components/verification-badge";
import { formatINR } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  business: Business;
  onSave?: (businessId: string) => void;
  onShare?: (businessId: string) => void;
  onContact?: (businessId: string) => void;
  onViewDetails?: (businessId: string) => void;
  onEdit?: (businessId: string) => void;
  onMoreLikeThis?: (businessId: string) => void;
  onCompare?: (businessId: string) => void;
  isSaved?: boolean;
  isCompared?: boolean;
  className?: string;
}

export function BusinessCard({
  business,
  onSave,
  onViewDetails,
  onEdit,
  onCompare,
  isSaved = false,
  isCompared = false,
  className,
}: BusinessCardProps) {
  const established =
    business.establishedYear || business.established_year;
  const employees = business.employees || business.employee_count;
  const profit =
    (business as any).annual_profit ||
    (business as any).ebitda ||
    (business as any).profit ||
    business.financials?.[0]?.profit;
  const isVerified =
    business.verification_status === "verified" ||
    business.verification?.verified ||
    business.verified;
  const hasFinancials =
    Boolean(business.revenue) ||
    Boolean(profit) ||
    (Array.isArray(business.badges) && business.badges.includes("Verified"));

  return (
    <Card
      className={cn(
        "group border-border hover:border-growth-green/40 transition-colors duration-200 cursor-pointer overflow-hidden",
        className
      )}
      onClick={() => onViewDetails?.(business.id)}
    >
      <CardContent className="p-0">
        {/* Compact image strip */}
        <div className="relative h-36 bg-muted overflow-hidden">
          {business.images && business.images.length > 0 ? (
            <img
              src={business.images[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-2xl font-semibold text-muted-foreground">
                {business.name?.charAt(0) || "B"}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-background/90 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(business.id);
            }}
            aria-label={isSaved ? "Unsave business" : "Save business"}
          >
            <Heart
              className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")}
            />
          </Button>
          {business.featured && (
            <Badge className="absolute top-2 left-2 bg-secondary text-foreground text-[10px] font-medium">
              Featured
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Identity */}
          <div>
            <h3 className="font-semibold text-base md:text-lg leading-snug line-clamp-1">
              {business.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">
                {business.city && business.state
                  ? `${business.city}, ${business.state}`
                  : business.location}
              </span>
              <span className="text-border">·</span>
              <span className="line-clamp-1">{business.industry}</span>
            </div>
          </div>

          {/* Asking price — strongest hierarchy */}
          <div className="pt-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Asking price
            </div>
            <div className="text-2xl md:text-[1.75rem] font-bold font-mono tabular-nums text-foreground tracking-tight">
              {formatINR(business.price)}
            </div>
          </div>

          {/* Financial metrics grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-y border-border">
            <div>
              <div className="text-[11px] text-muted-foreground">Revenue</div>
              <div className="text-sm font-semibold font-mono tabular-nums">
                {business.revenue ? formatINR(business.revenue) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">EBITDA / Profit</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-growth-green">
                {profit ? formatINR(profit) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Established</div>
              <div className="text-sm font-medium">{established || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Employees</div>
              <div className="text-sm font-medium">{employees ?? "—"}</div>
            </div>
          </div>

          {/* Verification */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {business.verification_status && (
              <VerificationBadge
                status={business.verification_status as VerificationStatus}
                verifiedAt={business.verified_at}
                size="sm"
              />
            )}
            {isVerified && !business.verification_status && (
              <span className="inline-flex items-center gap-1 text-growth-green">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Owner verified
              </span>
            )}
            {hasFinancials && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-growth-green" />
                Financials available
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {onEdit ? (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(business.id);
                }}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-growth-green hover:bg-growth-green/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(business.id);
                  }}
                >
                  View Business
                </Button>
                {onCompare && (
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(isCompared && "border-growth-green text-growth-green")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompare(business.id);
                    }}
                  >
                    <GitCompareArrows className="h-4 w-4 mr-1" />
                    Compare
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
