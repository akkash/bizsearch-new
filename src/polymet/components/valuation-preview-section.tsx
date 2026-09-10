import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Franchise ROI preview. Sample figures clearly labeled. */
export function ValuationPreviewSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-16 md:py-24 border-b border-border", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-10 md:mb-12 max-w-2xl leading-tight">
          See franchise investment, returns and payback before you commit.
        </h2>

        <div className="max-w-4xl border-2 border-foreground">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-foreground/5">
            <span className="text-sm font-bold uppercase tracking-widest">
              Franchise ROI
            </span>
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-foreground text-background">
              Sample
            </span>
          </div>

          <div className="p-6 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                  Initial Investment
                </div>
                <div className="font-mono text-3xl font-bold leading-none">
                  ₹45L
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                  Monthly Revenue
                </div>
                <div className="font-mono text-2xl font-bold leading-none">
                  ₹8L–₹12L
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                  Payback
                </div>
                <div className="font-mono text-2xl font-bold leading-none">
                  18–24 mo
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                  Operating costs
                </div>
                <div className="font-mono text-2xl font-bold leading-none">
                  ₹5.5L
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-8">
              <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">
                Key observations
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Investment fits ₹40–60L band
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Payback within 2 years under base case
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  Rent and labour assumptions need local verification
                </li>
              </ul>
            </div>

            <Link to="/franchises">
              <Button className="h-12 px-6">
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
