import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Franchise ROI preview. Sample figures clearly labeled. */
export function ValuationPreviewSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-7 md:py-9 border-b border-border", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-[1.75rem] font-bold tracking-tight mb-4 max-w-xl leading-tight">
          See franchise investment, returns and payback before you commit.
        </h2>

        <div className="max-w-3xl border border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
              Franchise ROI
            </span>
            <span className="text-[10px] uppercase tracking-wider text-warning border border-warning/30 px-1.5 py-0.5">
              Sample
            </span>
          </div>

          <div className="p-4 md:p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-5">
              <div className="col-span-2 md:col-span-1">
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  Initial investment
                </div>
                <div className="text-3xl md:text-[2rem] font-bold font-mono tabular-nums leading-none">
                  ₹45L
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  Monthly revenue
                </div>
                <div className="text-xl md:text-2xl font-semibold font-mono tabular-nums leading-none">
                  ₹8L–₹12L
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  Operating costs
                </div>
                <div className="text-lg md:text-xl font-semibold font-mono tabular-nums leading-none">
                  ₹5.5L
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  EBITDA
                </div>
                <div className="text-lg md:text-xl font-semibold font-mono tabular-nums text-growth-green leading-none">
                  ₹2.5L–₹4L / mo
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  Payback
                </div>
                <div className="text-base font-medium font-mono tabular-nums leading-none">
                  18–24 mo
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  Assumptions
                </div>
                <div className="text-sm font-medium leading-none text-muted-foreground">
                  Exposed
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
                Key observations
              </div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growth-green" />
                  Investment fits ₹40–60L band
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-growth-green" />
                  Payback within 2 years under base case
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  Rent and labour assumptions need local verification
                </li>
              </ul>
            </div>

            <Link to="/franchises">
              <Button size="sm" className="h-8 bg-growth-green hover:bg-growth-green/90 text-white">
                Explore Franchise ROI
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
            <p className="text-[11px] text-muted-foreground mt-3">
              Illustrative sample. Assumptions vary by brand and territory. Not a formal appraisal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
