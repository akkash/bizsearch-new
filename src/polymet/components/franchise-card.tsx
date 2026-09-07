import {
  Heart,
  MapPin,
  GitCompareArrows,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Franchise } from "@/types/listings";
import { VerificationBadge, type VerificationStatus } from "@/components/verification-badge";
import { formatINR } from "@/lib/format-currency";

interface FranchiseCardProps {
  franchise: Franchise;
  onSave?: (franchiseId: string) => void;
  onShare?: (franchiseId: string) => void;
  onContact?: (franchiseId: string) => void;
  onViewDetails?: (franchiseId: string) => void;
  onMoreLikeThis?: (franchiseId: string) => void;
  onCompare?: (franchiseId: string) => void;
  isSaved?: boolean;
  isCompared?: boolean;
  className?: string;
}

export function FranchiseCard({
  franchise,
  onSave,
  onViewDetails,
  onCompare,
  isSaved = false,
  isCompared = false,
  className,
}: FranchiseCardProps) {
  const brandName = franchise.brand_name || franchise.brandName || "Franchise";
  const logoUrl = franchise.logo_url || franchise.logo;
  const investMin =
    franchise.total_investment_min ?? franchise.investmentMin ?? 0;
  const investMax =
    franchise.total_investment_max ?? franchise.investmentMax;
  const franchiseFee = franchise.franchise_fee ?? franchise.franchiseFee;
  const royalty = franchise.royalty_percentage ?? franchise.royaltyPercentage;
  const setupCost =
    investMin && franchiseFee
      ? Math.max(0, investMin - (franchiseFee || 0))
      : (franchise as any).setup_cost;
  const breakEven =
    (franchise as any).expected_break_even ||
    (franchise as any).break_even_months ||
    (franchise as any).payback_period;
  const spaceReq =
    (franchise as any).space_requirement ||
    (franchise as any).min_area_sqft;
  const territories = franchise.territories || [];

  const investmentLabel =
    investMax && investMax !== investMin
      ? `${formatINR(investMin)}–${formatINR(investMax)}`
      : formatINR(investMin);

  return (
    <Card
      className={cn(
        "group border-border hover:border-electric-blue/40 transition-colors duration-200 cursor-pointer overflow-hidden",
        className
      )}
      onClick={() => onViewDetails?.(franchise.id)}
    >
      <CardContent className="p-0">
        {/* Brand header — distinct from business cards */}
        <div className="relative h-28 bg-secondary border-b border-border flex items-center gap-4 px-4">
          <div className="h-14 w-14 rounded-md bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {brandName.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className="text-[10px] mb-1 border-electric-blue/30 text-electric-blue">
              Franchise
            </Badge>
            <h3 className="font-semibold text-base leading-snug line-clamp-1">
              {brandName}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {franchise.industry}
            </p>
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {onCompare && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 bg-background/80",
                  isCompared && "text-growth-green"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(franchise.id);
                }}
                aria-label="Compare franchise"
              >
                <GitCompareArrows className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80"
              onClick={(e) => {
                e.stopPropagation();
                onSave?.(franchise.id);
              }}
              aria-label={isSaved ? "Unsave franchise" : "Save franchise"}
            >
              <Heart
                className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")}
              />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Total investment — primary metric for franchise */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Total investment
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight">
              {investmentLabel}
            </div>
          </div>

          {/* Franchise-specific metrics — not identical to business cards */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-y border-border text-sm">
            <div>
              <div className="text-[11px] text-muted-foreground">Franchise fee</div>
              <div className="font-semibold font-mono tabular-nums">
                {franchiseFee ? formatINR(franchiseFee) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Setup</div>
              <div className="font-semibold font-mono tabular-nums">
                {setupCost ? formatINR(setupCost) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Royalty</div>
              <div className="font-semibold font-mono tabular-nums">
                {royalty != null ? `${royalty}%` : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Break-even</div>
              <div className="font-medium">
                {breakEven
                  ? typeof breakEven === "number"
                    ? `${breakEven} mo`
                    : breakEven
                  : "—"}
              </div>
            </div>
            {spaceReq && (
              <div className="col-span-2">
                <div className="text-[11px] text-muted-foreground">Space</div>
                <div className="font-medium">
                  {typeof spaceReq === "number" ? `${spaceReq} sq ft` : spaceReq}
                </div>
              </div>
            )}
          </div>

          {/* Territories */}
          {territories.length > 0 && (
            <div>
              <div className="text-[11px] text-muted-foreground mb-1.5">
                Territories available
              </div>
              <div className="flex flex-wrap gap-1">
                {territories.slice(0, 3).map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
                  >
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {t}
                  </span>
                ))}
                {territories.length > 3 && (
                  <span className="text-xs text-muted-foreground px-1 py-0.5">
                    +{territories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {franchise.verification_status && (
            <div className="flex items-center gap-2">
              <VerificationBadge
                status={franchise.verification_status as VerificationStatus}
                verifiedAt={franchise.verified_at}
                size="sm"
              />
              {franchise.verification_status === "verified" && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growth-green" />
                  Franchisor verified
                </span>
              )}
            </div>
          )}

          <Button
            size="sm"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(franchise.id);
            }}
          >
            View Franchise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
