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
  const cover = Array.isArray(franchise.images) && franchise.images[0]
    ? typeof franchise.images[0] === "string"
      ? franchise.images[0]
      : franchise.images[0]?.url
    : null;

  return (
    <article
      className={cn(
        "group border border-border bg-card p-0 flex flex-col cursor-pointer card-hover-lift overflow-hidden",
        className
      )}
      onClick={() => onViewDetails?.(franchise.id)}
    >
      {cover ? (
        <img src={cover} alt="" className="h-36 w-full object-cover bg-muted" />
      ) : (
        <div className="h-1.5 w-full bg-trust-blue" />
      )}
      <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div className="flex items-start gap-3 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-12 w-12 object-contain border border-border shrink-0"
            />
          ) : (
            <div className="h-12 w-12 border border-border flex items-center justify-center font-display font-bold shrink-0">
              {brandName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-xl md:text-2xl font-bold uppercase leading-snug line-clamp-2">
              {brandName}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 line-clamp-1">
              {franchise.industry || "Franchise"}
              {territories.length ? ` · ${territories.slice(0, 2).join(", ")}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {onCompare && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", isCompared && "opacity-100")}
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
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(franchise.id);
            }}
            aria-label={isSaved ? "Unsave franchise" : "Save franchise"}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")} />
          </Button>
        </div>
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

        <div className="grid grid-cols-2 gap-4 border-t-2 border-foreground pt-4 mb-6 text-sm">
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
