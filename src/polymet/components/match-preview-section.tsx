import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Franchise match preview. Sample figures clearly labeled. */
export function MatchPreviewSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-16 md:py-24 border-b border-border", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl border-2 border-foreground">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
            <span className="text-sm font-bold uppercase tracking-widest">
              Franchise Match
            </span>
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-foreground text-background">
              Sample
            </span>
          </div>

          <div className="px-6 py-8 border-b border-border">
            <p className="font-display text-2xl md:text-3xl font-medium leading-tight">
              &ldquo;I have ₹50L and want a food franchise in Chennai.&rdquo;
            </p>
          </div>

          <div className="p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-mono text-6xl md:text-8xl font-bold leading-none tracking-tighter">
                  8
                </span>
                <span className="font-display text-xl font-bold uppercase">
                  Franchise Matches
                </span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                Why
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-8">
                {[
                  "₹40–60L investment fit",
                  "Chennai territory fit",
                  "Food & beverage preference",
                  "Experience requirement satisfied",
                ].map((r) => (
                  <li key={r} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
              <Link to="/match">
                <Button className="h-12 px-6">
                  View Franchise Matches
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="md:border-l-2 md:border-foreground md:pl-10 flex flex-col justify-center items-start md:items-end">
              <div className="font-mono text-4xl md:text-5xl font-bold tracking-tighter leading-none text-foreground/70">
                94%
              </div>
              <div className="text-sm font-bold uppercase tracking-widest opacity-60 mt-2">
                Match Score
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
