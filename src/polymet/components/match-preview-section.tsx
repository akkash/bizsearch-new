import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Franchise match preview. Sample figures clearly labeled. */
export function MatchPreviewSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-7 md:py-9 border-b border-border", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl border border-border bg-[hsl(220,28%,9%)] dark:bg-card">
          <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
              Franchise match
            </span>
            <span className="text-[10px] uppercase tracking-wider text-warning border border-warning/30 px-1.5 py-0.5">
              Sample
            </span>
          </div>

          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm md:text-base text-foreground font-medium leading-snug">
              &ldquo;I have ₹50L and want a food franchise in Chennai.&rdquo;
            </p>
          </div>

          <div className="p-4 grid sm:grid-cols-[1fr_auto] gap-5 items-start">
            <div>
              <p className="text-sm mb-3">
                <span className="font-mono font-bold text-lg tabular-nums">8</span>{" "}
                <span className="text-muted-foreground">franchise matches</span>
              </p>
              <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
                Why
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm mb-4">
                {[
                  "₹40–60L investment fit",
                  "Chennai territory fit",
                  "Food & beverage preference",
                  "Experience requirement satisfied",
                ].map((r) => (
                  <li key={r} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-growth-green shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
              <Link to="/smart-search?q=I+have+50L+and+want+a+food+franchise+in+Chennai">
                <Button size="sm" className="h-8 bg-growth-green hover:bg-growth-green/90 text-white">
                  View Franchise Matches
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="text-right sm:text-center sm:min-w-[100px] sm:border-l sm:border-border sm:pl-5">
              <div className="text-4xl font-bold font-mono tabular-nums text-growth-green leading-none">
                94%
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1.5">
                Match
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
