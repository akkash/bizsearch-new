import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FranchiseService } from "@/lib/franchise-service";
import { buildFranchiseSearchPath } from "@/lib/franchise-search";

const PROMPT = "I have ₹50L and want a food franchise in Chennai.";
const INTENT = { industrySlug: "food-beverage", city: "Chennai", budget: 5000000 };
const EMPTY = "No details found in the table.";

export function MatchPreviewSection({
  className,
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  const navigate = useNavigate();
  const [count, setCount] = useState<number | null>(null);
  const href = buildFranchiseSearchPath(INTENT);

  useEffect(() => {
    let cancelled = false;
    FranchiseService.getFranchises({
      industry: ["Food"],
      city: ["Chennai"],
      capitalMax: 5000000,
    })
      .then((rows) => {
        if (!cancelled) setCount((rows || []).length);
      })
      .catch((error) => {
        console.error("Match preview search failed:", error);
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={cn(embedded ? "" : "py-16 md:py-24 border-b border-border", className)}>
      <div className={cn(embedded ? "h-full" : "container mx-auto px-4 md:px-6")}>
        <div className="h-full border border-border bg-card shadow-[var(--shadow-sm)] flex flex-col">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
            <span className="text-sm font-bold uppercase tracking-widest">
              Franchise Match
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(href)}
            className="px-6 py-6 border-b border-border bg-secondary/40 text-left hover:bg-secondary transition-colors"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-trust-blue mb-2">
              Click to search
            </p>
            <p className="font-display text-xl md:text-2xl font-medium leading-tight">
              &ldquo;{PROMPT}&rdquo;
            </p>
          </button>

          <div className="p-6 md:p-8 flex-1">
            {count === null ? (
              <p className="text-sm text-muted-foreground">Checking live listings…</p>
            ) : count === 0 ? (
              <p className="text-sm text-muted-foreground">{EMPTY}</p>
            ) : (
              <>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-mono text-6xl md:text-7xl font-bold leading-none tracking-tighter text-growth-green">
                    {count}
                  </span>
                  <span className="font-display text-lg font-bold uppercase">
                    Franchise{count === 1 ? "" : "s"} in this search
                  </span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Filters applied
                </div>
                <ul className="grid grid-cols-1 gap-2 text-sm mb-8">
                  {[
                    "Food & beverage industry",
                    "Investment at or under ₹50L",
                    "Chennai / Tamil Nadu territory",
                  ].map((r) => (
                    <li key={r} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-growth-green" aria-hidden="true" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Button asChild className="h-12 px-6">
              <Link to={href}>
                Run this search
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
