import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FranchiseService } from "@/lib/franchise-service";
import type { Franchise } from "@/types/listings";
import { formatINR } from "@/lib/format-currency";
import {
  formatInvestmentRange,
  getFranchiseInvestmentRange,
  getStoreFormatsFromFranchise,
  formatStoreFormatSpace,
} from "@/lib/store-formats";
import { listingLogoUrl } from "@/lib/listing-media";
import { netMarginPct } from "@/lib/franchise-roi-model";
import { useFranchiseCompare } from "@/hooks/use-franchise-compare";
import { cn } from "@/lib/utils";

const EMPTY = "No details found in the table.";

function areaLabel(franchise: Franchise): string {
  const formats = getStoreFormatsFromFranchise(franchise);
  if (formats[0]) return formatStoreFormatSpace(formats[0]);
  const min = franchise.min_area_sqft ?? franchise.space_required_sqft;
  const max = franchise.max_area_sqft ?? min;
  if (!min && !max) return "Not provided";
  if (min && max && min !== max) return `${min}–${max} sq ft`;
  return `${min || max} sq ft`;
}

function marginLabel(franchise: Franchise): string {
  const rev = franchise.average_unit_revenue;
  const profit = (franchise as { average_unit_profit?: number }).average_unit_profit;
  if (rev && profit) {
    const pct = netMarginPct(rev, profit);
    return pct != null ? `${pct.toFixed(0)}%` : "Not provided";
  }
  return "Not provided";
}

export function HomeCompareTable({ className }: { className?: string }) {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleCompare, isCompared } = useFranchiseCompare();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    FranchiseService.getFranchises()
      .then((rows) => {
        if (!cancelled) setFranchises(rows || []);
      })
      .catch((error) => {
        console.error("Compare table listings failed:", error);
        if (!cancelled) setFranchises([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cohort = useMemo(() => {
    const groups = new Map<string, Franchise[]>();
    for (const row of franchises) {
      const key = (row.industry || "Other").trim();
      if (!key) continue;
      const list = groups.get(key) || [];
      list.push(row);
      groups.set(key, list);
    }
    const ranked = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    const pick = ranked.find(([, list]) => list.length >= 2);
    if (!pick) return { industry: "", brands: [] as Franchise[] };
    return { industry: pick[0], brands: pick[1].slice(0, 3) };
  }, [franchises]);

  const openCompare = () => {
    cohort.brands.forEach((brand) => {
      if (!isCompared(brand.id)) toggleCompare(brand.id);
    });
    navigate("/franchises?compare=1");
  };

  return (
    <section className={cn("py-16 md:py-24 border-b border-border", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight">
              Compare brands side by side
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Royalty, area, and returns for competing franchises in the same category.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/franchises?compare=1">Open full compare</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading comparison…</p>
        ) : cohort.brands.length < 2 ? (
          <p className="text-sm text-muted-foreground">{EMPTY}</p>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-trust-blue mb-4">
              {cohort.industry}
            </p>
            <div className="overflow-x-auto border border-border bg-card shadow-[var(--shadow-sm)]">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
                      Metric
                    </th>
                    {cohort.brands.map((brand) => (
                      <th key={brand.id} className="text-left p-4">
                        <div className="flex items-center gap-2">
                          {listingLogoUrl(brand) && (
                            <img
                              src={listingLogoUrl(brand)!}
                              alt=""
                              className="h-8 w-8 object-contain border border-border bg-white dark:bg-card p-0.5"
                            />
                          )}
                          <Link
                            to={`/franchise/${brand.slug || brand.id}`}
                            className="font-display font-bold uppercase hover:text-trust-blue"
                          >
                            {brand.brand_name || brand.brandName}
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [
                      "Investment",
                      ...cohort.brands.map((brand) => {
                        const range = getFranchiseInvestmentRange(brand);
                        return formatInvestmentRange(range.min, range.max);
                      }),
                    ],
                    [
                      "Royalty",
                      ...cohort.brands.map((brand) =>
                        brand.royalty_percentage != null || brand.royaltyPercentage != null
                          ? `${brand.royalty_percentage ?? brand.royaltyPercentage}%`
                          : "Not provided"
                      ),
                    ],
                    ["Area required", ...cohort.brands.map(areaLabel)],
                    [
                      "Payback",
                      ...cohort.brands.map((brand) =>
                        brand.payback_period_months
                          ? `${brand.payback_period_months} mo`
                          : "Not provided"
                      ),
                    ],
                    ["Est. net margin", ...cohort.brands.map(marginLabel)],
                    [
                      "Unit revenue",
                      ...cohort.brands.map((brand) => formatINR(brand.average_unit_revenue)),
                    ],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td
                          key={`${row[0]}-${index}`}
                          className={cn(
                            "p-4",
                            index === 0
                              ? "text-muted-foreground font-medium"
                              : "font-mono font-semibold"
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cohort.brands.map((brand) => (
                <Button
                  key={brand.id}
                  type="button"
                  size="sm"
                  variant={isCompared(brand.id) ? "default" : "outline"}
                  onClick={() => toggleCompare(brand.id)}
                >
                  {isCompared(brand.id) ? "In compare" : `Add ${brand.brand_name || brand.brandName}`}
                </Button>
              ))}
              <Button size="sm" onClick={openCompare}>
                Compare these brands
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
