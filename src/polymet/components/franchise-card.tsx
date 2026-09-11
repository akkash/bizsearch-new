import {
  Heart,
  GitCompareArrows,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Franchise } from "@/types/listings";
import {
  formatInvestmentRange,
  formatStoreFormatSpace,
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
  const royalty = franchise.royalty_percentage ?? franchise.royaltyPercentage;
  const outlets = franchise.total_outlets ?? franchise.outlets;
  const termYears =
    (franchise as { franchise_term_years?: number }).franchise_term_years ??
    (franchise as { term_years?: number }).term_years;
  const spaceLabel = formats[0]
    ? formatStoreFormatSpace(formats[0])
    : franchise.min_area_sqft && franchise.max_area_sqft
      ? `${franchise.min_area_sqft}–${franchise.max_area_sqft} sq ft`
      : franchise.space_required_sqft
        ? `${franchise.space_required_sqft} sq ft`
        : "Not provided";
  const investmentLabel = formatInvestmentRange(investRange.min, investRange.max);
  const verified = franchise.verification_status === "verified";

  const specs = [
    { label: "Space", value: spaceLabel },
    { label: "Royalty", value: royalty != null ? `${royalty}%` : "Not provided" },
    { label: "Term", value: termYears ? `${termYears} Years` : "Not provided" },
    {
      label: "Outlets",
      value: outlets ? `${outlets}+` : "Not provided",
    },
  ];

  return (
    <article
      className={cn(
        "group border border-border bg-card rounded-lg shadow-sm cursor-pointer card-hover-lift overflow-hidden",
        variant === "list" ? "flex flex-col sm:flex-row" : "flex flex-col",
        className
      )}
      onClick={() => onViewDetails?.(franchise.id)}
    >
      <ListingBrandHero
        brandName={brandName}
        logoUrl={logoUrl}
        coverUrl={coverUrl}
        industry={franchise.industry}
        variant={variant === "list" ? "list" : "card"}
      >
        <div className="absolute top-2 right-2 flex gap-1">
          {onCompare && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg bg-white/90 dark:bg-card/90 hover:bg-white shadow-sm",
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
            className="h-9 w-9 rounded-lg bg-white/90 dark:bg-card/90 hover:bg-white shadow-sm"
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

      <div className="px-4 pt-3 pb-4 flex flex-col flex-1 gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold uppercase leading-snug line-clamp-1">
            {brandName}
          </h3>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5 line-clamp-1">
            {franchise.industry || "Franchise"}
          </p>
          <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold tabular-nums tracking-tight text-growth-green whitespace-nowrap overflow-hidden text-ellipsis">
            {investmentLabel}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {spec.label}
              </div>
              <div className="text-xs font-semibold truncate">{spec.value}</div>
            </div>
          ))}
        </div>

        {verified && (
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-growth-green">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Franchisor verified
          </div>
        )}

        <Button
          size="sm"
          className="w-full mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(franchise.id);
          }}
        >
          View Franchise
        </Button>
      </div>
    </article>
  );
}
