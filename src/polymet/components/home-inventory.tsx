import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessService } from "@/lib/business-service";
import { FranchiseService } from "@/lib/franchise-service";
import { formatINR } from "@/lib/format-currency";
import {
  formatInvestmentRange,
  getFranchiseInvestmentRange,
  getStoreFormatsFromFranchise,
} from "@/lib/store-formats";
import type { Business, Franchise } from "@/types/listings";
import { cn } from "@/lib/utils";

function RowSkeleton() {
  return (
    <div className="border-2 border-foreground py-6 px-6 animate-pulse">
      <div className="h-4 w-1/3 bg-muted mb-2" />
      <div className="h-7 w-24 bg-muted mb-2" />
      <div className="h-4 w-2/3 bg-muted" />
    </div>
  );
}

function EmptyInventory({
  title,
  suggestions,
}: {
  title: string;
  suggestions: { label: string; href: string }[];
}) {
  return (
    <div className="border-2 border-foreground border-dashed py-12 px-4 text-center text-foreground/60">
      <p className="font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm mb-4">
        Try a broader search or create a buyer requirement.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {suggestions.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            className="px-2.5 py-1 text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {s.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/businesses">
          <Button variant="outline" size="sm">
            Browse all businesses
          </Button>
        </Link>
        <Link to="/buyer/mandate">
          <Button variant="outline" size="sm">
            Create a buyer requirement
          </Button>
        </Link>
      </div>
    </div>
  );
}

/** Precise verification labels — never a vague green "Verified". */
function VerificationStatus({ business }: { business: Business }) {
  const identity = business.verification?.identityVerified;
  const documents = business.verification?.documentsVerified;
  const status = business.verification_status;
  const legacyVerified = business.verification?.verified || business.verified;

  const signals: string[] = [];
  if (identity) signals.push("Owner identity");
  if (documents) signals.push("Financial documents");

  if (signals.length > 0) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {signals.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 text-[11px] text-growth-green"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {s}
          </span>
        ))}
      </div>
    );
  }

  if (status === "verified" || legacyVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-growth-green">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Business verified
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="text-[11px] text-muted-foreground">Verification available</span>
    );
  }

  return <span className="text-[11px] text-muted-foreground">Not verified</span>;
}

function getEbitda(business: Business): number | null {
  const raw =
    (business as any).annual_profit ??
    (business as any).ebitda ??
    (business as any).profit ??
    business.financials?.[0]?.profit;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function HomeBusinessInventory({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let data = await BusinessService.getFeaturedBusinesses(2);
        if (!Array.isArray(data) || data.length === 0) {
          const result = await BusinessService.getBusinesses({}, { page: 1, pageSize: 2 });
          data = result.data;
        }
        if (!cancelled) setItems((Array.isArray(data) ? data : []).slice(0, 2));
      } catch (err) {
        console.error("Home business inventory failed:", err);
        try {
          const fallback = await BusinessService.getBusinesses({}, { page: 1, pageSize: 2 });
          if (!cancelled) setItems(fallback.data.slice(0, 2));
        } catch (err2) {
          console.error("Home business fallback failed:", err2);
          if (!cancelled) setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="business-listings"
      className={cn("py-12 md:py-16 border-b border-border bg-foreground/5", className)}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10 md:mb-12">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight">
              Businesses
              <br />
              For Sale
            </h2>
            {!loading && items.length > 0 && (
              <p className="text-[12px] text-muted-foreground/80 mt-1">
                {items.length} listing{items.length === 1 ? "" : "s"} available · secondary marketplace
              </p>
            )}
          </div>
          <Link
            to="/businesses"
            className="text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:opacity-60"
          >
            Browse All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6">
            {[0, 1, 2].map((i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyInventory
            title="No details found in the table."
            suggestions={[
              { label: "Restaurant in Chennai", href: "/businesses?q=Restaurant+in+Chennai" },
              { label: "Business under ₹1Cr", href: "/businesses?q=Business+under+1Cr" },
              { label: "Franchises under ₹50L", href: "/franchises?q=under+50L" },
            ]}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {items.map((b) => {
                const ebitda = getEbitda(b);
                const hasRevenue = b.revenue != null && Number(b.revenue) > 0;
                const established = b.establishedYear || b.established_year;
                const employees = b.employees || b.employee_count;
                const margin =
                  hasRevenue && ebitda != null && ebitda > 0
                    ? ((ebitda / Number(b.revenue)) * 100).toFixed(1)
                    : null;
                const id = b.slug || b.id;
                const missingProfit = ebitda == null;

                return (
                  <article
                    key={b.id}
                    className="group border-2 border-foreground p-6 flex flex-col cursor-pointer transition-colors"
                    onClick={() => navigate(`/business/${id}`)}
                  >
                    <h3 className="font-display text-2xl font-bold uppercase mb-2 leading-snug line-clamp-1">
                      {b.name}
                    </h3>
                    <p className="text-sm opacity-60 uppercase tracking-widest line-clamp-1">
                      {b.city && b.state ? `${b.city}, ${b.state}` : b.location}
                      {b.industry ? ` · ${b.industry}` : ""}
                    </p>

                    <div className="mt-auto pt-8">
                      <div className="text-4xl font-display font-bold mb-1 font-mono tabular-nums tracking-tight leading-none">
                        {formatINR(b.price)}
                      </div>
                      <div className="text-xs uppercase tracking-widest opacity-60 mb-6">
                        Asking price
                      </div>
                    </div>

                    {/* Data-aware financial strip — no broken dashes */}
                    <div className="mb-2.5 space-y-1.5">
                      <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            Revenue
                          </span>
                          {hasRevenue ? (
                            <span className="font-semibold font-mono tabular-nums text-[0.9375rem] md:text-base">
                              {formatINR(b.revenue)}
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              Not provided
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            EBITDA
                          </span>
                          {ebitda != null ? (
                            <span className="font-semibold font-mono tabular-nums text-[0.9375rem] md:text-base text-growth-green">
                              {formatINR(ebitda)}
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>

                      {missingProfit && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            Profitability data not provided
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/business/${id}?contact=true`);
                            }}
                          >
                            Request Financials
                          </Button>
                        </div>
                      )}

                      {(margin || established || employees != null) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-muted-foreground">
                          {margin && (
                            <span>
                              Margin{" "}
                              <span className="text-foreground font-mono">{margin}%</span>
                            </span>
                          )}
                          {established && (
                            <span>
                              Est.{" "}
                              <span className="text-foreground">{established}</span>
                            </span>
                          )}
                          {employees != null && (
                            <span>
                              <span className="text-foreground">{employees}</span> emp.
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mb-2.5">
                      <VerificationStatus business={b} />
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-growth-green hover:bg-growth-green/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/business/${id}`);
                        }}
                      >
                        View Business
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/businesses?compare=${b.id}`);
                        }}
                      >
                        Compare
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            {items.length > 0 && items.length < 4 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <Link to="/businesses">
                  <Button variant="outline" size="sm" className="h-8">
                    Browse all businesses
                  </Button>
                </Link>
                <Link to="/buyer/mandate">
                  <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                    Create a buyer requirement
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export function HomeFranchiseInventory({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = (await FranchiseService.getFeaturedFranchises(6)) || [];
        if (!cancelled) setItems((Array.isArray(data) ? data : []).slice(0, 6));
      } catch (err) {
        console.error("Home franchise inventory failed:", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="marketplace-listings"
      className={cn("py-16 md:py-24 border-b border-border", className)}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12 md:mb-16">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
              Franchises
              <br />
              For You
            </h2>
            {!loading && items.length > 0 && (
              <p className="text-[12px] text-muted-foreground mt-1">
                {items.length} franchise{items.length === 1 ? "" : "s"} matching
                current availability
              </p>
            )}
          </div>
          <Link
            to="/franchises"
            className="text-sm font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:opacity-60"
          >
            Browse All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6">
            {[0, 1, 2].map((i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyInventory
            title="No details found in the table."
            suggestions={[
              { label: "Food franchise under ₹50L", href: "/franchises?q=Food+franchise+under+50L" },
              { label: "School franchise", href: "/franchises?q=school" },
              { label: "Low-investment Bangalore", href: "/franchises?q=Bangalore" },
            ]}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {items.map((f) => {
              const brand = f.brand_name || f.brandName || "Franchise";
              const formats = getStoreFormatsFromFranchise(f);
              const range = getFranchiseInvestmentRange(f);
              const fee = f.franchise_fee ?? f.franchiseFee;
              const breakEven =
                (f as any).expected_break_even ||
                (f as any).breakeven_period ||
                (f as any).breakevenPeriod;
              const territories = f.territories || [];
              const id = f.slug || f.id;
              const investLabel =
                range.min != null || range.max != null
                  ? formatInvestmentRange(range.min, range.max)
                  : null;

                return (
                  <article
                    key={f.id}
                    className="group border-2 border-foreground p-6 flex flex-col cursor-pointer transition-colors"
                    onClick={() => navigate(`/franchise/${id}`)}
                  >
                    <h3 className="font-display text-2xl font-bold uppercase mb-2 leading-snug line-clamp-1">
                      {brand}
                    </h3>
                    <p className="text-sm opacity-60 uppercase tracking-widest line-clamp-1">
                      {f.industry || "Franchise"}
                      {territories.length
                        ? ` · ${territories.slice(0, 2).join(", ")}`
                        : ""}
                    </p>

                    <div className="mt-auto pt-8">
                      {investLabel ? (
                        <div className="text-4xl font-display font-bold mb-1 font-mono tabular-nums tracking-tight leading-none">
                          {investLabel}
                        </div>
                      ) : (
                        <div className="text-[13px] text-muted-foreground">
                          Investment not provided
                        </div>
                      )}
                      <div className="text-xs uppercase tracking-widest opacity-60 mb-6">
                        {formats.length > 1
                          ? `Investment · ${formats.length} formats`
                          : "Investment range"}
                      </div>
                      {formats.length > 1 && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                          {formats.map((fmt) => fmt.name).join(" · ")}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 text-sm mb-2.5">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">
                          Franchise fee
                        </span>
                        {fee ? (
                          <span className="font-semibold font-mono tabular-nums text-[0.9375rem]">
                            {formatINR(fee)}
                          </span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">
                            Not provided
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">
                          Break-even
                        </span>
                        {breakEven ? (
                          <span className="font-semibold text-[0.9375rem]">{breakEven}</span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">
                            Not provided
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-growth-green hover:bg-growth-green/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/franchise/${id}`);
                        }}
                      >
                        View Franchise
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/franchises?compare=${f.id}`);
                        }}
                      >
                        Compare
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            {items.length > 0 && items.length < 4 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <Link to="/franchises">
                  <Button variant="outline" size="sm" className="h-8">
                    Browse all franchises
                  </Button>
                </Link>
                <Link to="/add-franchise-listing">
                  <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                    List your franchise
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
