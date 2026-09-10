import {
  Heart,
  MapPin,
  GitCompareArrows,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Franchise } from "@/types/listings";
import { formatINR } from "@/lib/format-currency";
import {
  formatInvestmentRange,
  getFranchiseInvestmentRange,
  getStoreFormatsFromFranchise,
} from "@/lib/store-formats";
import { ListingBrandHero } from "@/components/listing-brand-hero";
import { listingCoverUrl, listingLogoUrl } from "@/lib/listing-media";

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
  variant?: "grid" | "list";
  className?: string;
}

export function FranchiseCard({
  franchise,
  onSave,
  onViewDetails,
  onCompare,
  isSaved = false,
  isCompared = false,
  variant = "grid",
  className,
}: FranchiseCardProps) {
  const brandName = franchise.brand_name || franchise.brandName || "Franchise";
  const logoUrl = listingLogoUrl(franchise);
  const coverUrl = listingCoverUrl(franchise);
  const formats = getStoreFormatsFromFranchise(franchise);
  const investRange = getFranchiseInvestmentRange(franchise);
  const franchiseFee = franchise.franchise_fee ?? franchise.franchiseFee;
  const royalty = franchise.royalty_percentage ?? franchise.royaltyPercentage;
  const breakEven =
    (franchise as any).expected_break_even ||
    (franchise as any).break_even_months ||
    (franchise as any).payback_period;
  const territories = franchise.territories || [];
  const investmentLabel = formatInvestmentRange(investRange.min, investRange.max);
  const verified = franchise.verification_status === "verified";

  return (
    <article
      className={cn(
        "group border border-border bg-card p-0 cursor-pointer card-hover-lift overflow-hidden",
        variant === "list" ? "flex flex-col sm:flex-row" : "flex flex-col",
        className
      )}
      onClick={() => onViewDetails?.(franchise.id)}
    >
      <ListingBrandHero
        brandName={brandName}
        logoUrl={logoUrl}
        coverUrl={coverUrl}
        variant={variant === "list" ? "list" : "card"}
      >
        <div className="absolute top-2 right-2 flex gap-1">
          {onCompare && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 bg-white/90 dark:bg-card/90 hover:bg-white shadow-sm",
                isCompared && "text-trust-blue"
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
            className="h-9 w-9 bg-white/90 dark:bg-card/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(franchise.id);
            }}
            aria-label={isSaved ? "Unsave franchise" : "Save franchise"}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </ListingBrandHero>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-8 min-w-0">
          <h3 className="font-display text-xl md:text-2xl font-bold uppercase leading-snug line-clamp-2">
            {brandName}
          </h3>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 line-clamp-1">
            {franchise.industry || "Franchise"}
            {territories.length ? ` · ${territories.slice(0, 2).join(", ")}` : ""}
          </p>
        </div>

        <div className="mt-auto">
          <div className="text-3xl md:text-4xl font-display font-bold font-mono tabular-nums tracking-tight leading-none mb-1 text-growth-green">
            {investmentLabel}
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
            {formats.length > 1
              ? `Investment · ${formats.length} formats`
              : "Investment range"}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mb-6 text-sm">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Fee</div>
              <div className="font-bold font-mono tabular-nums">
                {franchiseFee ? formatINR(franchiseFee) : "Not provided"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Break-even
              </div>
              <div className="font-bold">
                {breakEven
                  ? typeof breakEven === "number"
                    ? `${breakEven} mo`
                    : breakEven
                  : "Not provided"}
              </div>
            </div>
            {royalty != null && (
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Royalty</div>
                <div className="font-bold font-mono tabular-nums">{royalty}%</div>
              </div>
            )}
            {territories.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Territory</div>
                <div className="font-bold flex items-center gap-1 line-clamp-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {territories[0]}
                </div>
              </div>
            )}
          </div>

          {verified && (
            <div className="flex items-center gap-1 text-xs uppercase tracking-widest mb-4 text-trust-blue">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Franchisor verified
            </div>
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(franchise.id);
            }}
          >
            View Franchise
          </Button>
        </div>
      </div>
    </article>
  );
}
