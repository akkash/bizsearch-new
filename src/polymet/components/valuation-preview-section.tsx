import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FranchiseService } from "@/lib/franchise-service";
import type { Franchise } from "@/types/listings";
import { formatINR } from "@/lib/format-currency";
import {
  estimateFranchiseEconomics,
  listingSpaceRange,
  netMarginPct,
  type CityTier,
} from "@/lib/franchise-roi-model";
import { listingLogoUrl } from "@/lib/listing-media";

const EMPTY = "No details found in the table.";

export function ValuationPreviewSection({
  className,
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [space, setSpace] = useState(800);
  const [tier, setTier] = useState<CityTier>("tier1");

  useEffect(() => {
    let cancelled = false;
    FranchiseService.getFranchises()
      .then((rows) => {
        if (cancelled) return;
        const usable = (rows || []).filter((row) => {
          const min = row.total_investment_min ?? row.investmentMin;
          return min != null && Number(min) > 0;
        });
        setFranchises(usable);
        setSelectedId(usable[0]?.id || "");
      })
      .catch((error) => {
        console.error("ROI listings failed:", error);
        if (!cancelled) setFranchises([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = franchises.find((row) => row.id === selectedId) ?? franchises[0] ?? null;
  const spaceBand = selected ? listingSpaceRange(selected) : null;

  useEffect(() => {
    if (!spaceBand) return;
    setSpace((current) => Math.min(spaceBand.max, Math.max(spaceBand.min, current)));
  }, [selectedId, spaceBand?.min, spaceBand?.max]);

  const model = useMemo(() => {
    if (!selected) return null;
    return estimateFranchiseEconomics(selected, spaceBand ? space : null, tier);
  }, [selected, space, spaceBand, tier]);

  const brandName = selected?.brand_name || selected?.brandName || "Franchise";
  const margin = model ? netMarginPct(model.monthlyGross, model.monthlyNet) : null;

  const metric = (label: string, value: string) => (
    <div key={label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-right">{value}</span>
    </div>
  );

  return (
    <section className={cn(embedded ? "" : "py-16 md:py-24 border-b border-border", className)}>
      <div className={cn(embedded ? "h-full" : "container mx-auto px-4 md:px-6")}>
        {!embedded && (
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-10 md:mb-12 max-w-2xl leading-tight">
            See franchise investment, returns and payback before you commit.
          </h2>
        )}

        <div className="h-full border border-border bg-card shadow-[var(--shadow-sm)] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/40">
            <span className="text-sm font-bold uppercase tracking-widest">
              Live ROI & payback
            </span>
          </div>

          <div className="p-6 md:p-8 flex-1 flex flex-col">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading franchise economics…</p>
            ) : !selected || !model ? (
              <p className="text-sm text-muted-foreground">{EMPTY}</p>
            ) : (
              <>
                <label className="block mb-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Brand
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    {listingLogoUrl(selected) && (
                      <img
                        src={listingLogoUrl(selected)!}
                        alt=""
                        className="h-10 w-10 object-contain border border-border bg-white dark:bg-card p-1"
                      />
                    )}
                    <select
                      value={selected.id}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="h-11 flex-1 border border-border bg-card px-3 text-sm font-medium"
                      aria-label="Franchise brand"
                    >
                      {franchises.map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.brand_name || row.brandName}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {spaceBand ? (
                  <label className="block mb-6">
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Space size
                      </span>
                      <span className="font-mono text-lg font-bold">{space} sq ft</span>
                    </div>
                    <Slider
                      min={spaceBand.min}
                      max={Math.max(spaceBand.min + 1, spaceBand.max)}
                      step={10}
                      value={[space]}
                      onValueChange={(v) => setSpace(v[0] ?? spaceBand.min)}
                      aria-label="Outlet space in square feet"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                      <span>{spaceBand.min} sq ft</span>
                      <span>{spaceBand.max} sq ft</span>
                    </div>
                  </label>
                ) : (
                  <p className="text-xs text-muted-foreground mb-6">
                    Space not provided on this listing. Economics use the published investment band.
                  </p>
                )}

                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    City tier
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={tier === "tier1" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTier("tier1")}
                    >
                      Tier 1
                    </Button>
                    <Button
                      type="button"
                      variant={tier === "tier2" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTier("tier2")}
                    >
                      Tier 2 / 3
                    </Button>
                  </div>
                </div>

                <div className="border border-border divide-y mb-6">
                  {metric("Estimated investment", formatINR(model.investment))}
                  {metric(
                    "Monthly gross",
                    model.monthlyGross != null ? formatINR(model.monthlyGross) : "Not provided"
                  )}
                  {metric(
                    "Monthly net",
                    model.monthlyNet != null ? formatINR(model.monthlyNet) : "Not provided"
                  )}
                  {metric(
                    "Net margin",
                    margin != null ? `${margin.toFixed(0)}%` : "Not provided"
                  )}
                  {metric(
                    "Breakeven",
                    model.paybackMonths != null
                      ? `${Math.max(6, model.paybackMonths - 3)}–${model.paybackMonths + 3} mo`
                      : "Not provided"
                  )}
                  {metric(
                    "Working capital buffer",
                    model.workingCapital != null ? formatINR(model.workingCapital) : "Not provided"
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground mb-6 flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                  Scaled from {brandName} listing figures. Tier 1 applies higher rent and opex. Not a formal appraisal.
                </p>

                <Button asChild className="h-12 px-6 mt-auto w-fit">
                  <Link to={`/franchise/${selected.slug || selected.id}`}>
                    View {brandName}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
