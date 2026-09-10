import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Franchise match preview. Sample figures clearly labeled. */
export function MatchPreviewSection({
  className,
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  return (
    <section className={cn(embedded ? "" : "py-16 md:py-24 border-b border-border", className)}>
      <div className={cn(embedded ? "h-full" : "container mx-auto px-4 md:px-6")}>
        <div className="h-full border border-border bg-card shadow-[var(--shadow-sm)] flex flex-col">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
            <span className="text-sm font-bold uppercase tracking-widest">
              Franchise Match
            </span>
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-trust-blue text-white">
              Sample
            </span>
          </div>

          <div className="px-6 py-6 border-b border-border bg-secondary/40">
            <p className="font-display text-xl md:text-2xl font-medium leading-tight">
              &ldquo;I have ₹50L and want a food franchise in Chennai.&rdquo;
            </p>
          </div>

          <div className="p-6 md:p-8 grid sm:grid-cols-[1fr_auto] gap-6 items-start flex-1">
            <div>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-mono text-6xl md:text-7xl font-bold leading-none tracking-tighter text-growth-green">
                  8
                </span>
                <span className="font-display text-lg font-bold uppercase">
                  Franchise Matches
                </span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Why
              </div>
              <ul className="grid grid-cols-1 gap-2 text-sm mb-8">
                {[
                  "₹40–60L investment fit",
                  "Chennai territory fit",
                  "Food & beverage preference",
                  "Experience requirement satisfied",
                ].map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-growth-green" aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="h-12 px-6">
                <Link to="/match">
                  View Franchise Matches
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="sm:border-l sm:border-border sm:pl-8 flex flex-col justify-center items-start sm:items-end">
              <div className="font-mono text-4xl md:text-5xl font-bold tracking-tighter leading-none text-trust-blue">
                94%
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">
                Match Score
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
