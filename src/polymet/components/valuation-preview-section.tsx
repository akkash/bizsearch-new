import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ValuationPreviewSectionProps {
  className?: string;
}

/**
 * Product preview of business analysis — clearly labeled as sample data.
 * Demonstrates intelligence through UI, not "Smart" marketing copy.
 */
export function ValuationPreviewSection({ className }: ValuationPreviewSectionProps) {
  return (
    <section className={cn("py-14 md:py-16 bg-muted/40 border-y border-border", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-growth-green mb-3">
            Understand before you buy
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Evaluate the economics, not just the listing
          </h2>
          <p className="text-muted-foreground">
            Review asking price against estimated value, margins, and risks —
            before you contact the seller.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-secondary/50">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Is this business worth ₹68L?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Business analysis</p>
            </div>
            <Badge variant="outline" className="text-xs font-medium border-warning/40 text-warning">
              Sample analysis
            </Badge>
          </div>

          <div className="p-5 md:p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Asking price", value: "₹68L" },
                { label: "Estimated value", value: "₹61–70L" },
                { label: "Revenue", value: "₹2.1Cr" },
                { label: "EBITDA", value: "₹24L" },
                { label: "EBITDA multiple", value: "2.8×" },
                { label: "Risk", value: "Moderate", accent: "warning" as const },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {row.label}
                  </div>
                  <div
                    className={cn(
                      "text-xl md:text-2xl font-semibold font-mono tabular-nums",
                      row.accent === "warning" ? "text-warning" : "text-foreground"
                    )}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Key observations
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-growth-green mt-0.5 shrink-0" />
                  <span>Revenue growing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-growth-green mt-0.5 shrink-0" />
                  <span>Healthy operating margin</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <span>Customer concentration needs review</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <span>Lease renewal due in 11 months</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/business-valuation">
                <Button className="bg-growth-green hover:bg-growth-green/90 text-white">
                  Try valuation tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/businesses">
                <Button variant="outline">Browse businesses</Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Figures above are illustrative. Estimates depend on uploaded financials
              and are not a guarantee of fair market value.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
