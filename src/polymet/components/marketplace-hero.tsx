import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MarketplaceHeroProps {
  className?: string;
}

const POPULAR = [
  { label: "Food franchise under ₹50L", q: "Food franchise under ₹50L", type: "franchise" as const },
  { label: "School franchise under ₹1Cr", q: "School franchise under ₹1Cr", type: "franchise" as const },
  { label: "Low-investment Bangalore", q: "Low-investment franchise in Bangalore", type: "franchise" as const },
  { label: "Manufacturing Tamil Nadu", q: "Manufacturing franchise in Tamil Nadu", type: "franchise" as const },
  { label: "Businesses for sale", q: "", type: "business" as const },
];

const INTENTS = [
  { id: "franchise" as const, label: "Find a Franchise", href: "/franchises" },
  { id: "compare" as const, label: "Compare Opportunities", href: "/franchises?compare=1" },
  { id: "list" as const, label: "List Your Franchise", href: "/add-franchise-listing" },
];

export function MarketplaceHero({ className }: MarketplaceHeroProps) {
  const [query, setQuery] = useState("");
  const [activeIntent, setActiveIntent] = useState<"franchise" | "compare" | "list">("franchise");
  const navigate = useNavigate();

  const go = (q: string, type: "business" | "franchise" = "franchise") => {
    const trimmed = q.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const path = type === "business" ? "/businesses" : "/franchises";
    navigate(params.toString() ? `${path}?${params}` : path);
  };

  const onIntent = (intent: (typeof INTENTS)[number]) => {
    setActiveIntent(intent.id);
    navigate(intent.href);
  };

  return (
    <section className={cn("bg-[hsl(220,32%,7%)] border-b border-white/10", className)}>
      <div className="container mx-auto px-4 pt-3 pb-3 md:pt-5 md:pb-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-lg md:text-2xl lg:text-[1.75rem] font-semibold text-white/90 tracking-tight leading-snug mb-2 md:mb-3">
            Find the right franchise to build your next business.
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(query || "Food franchise under ₹50L in Chennai", "franchise");
            }}
            className="mb-2"
          >
            <div className="flex flex-col sm:flex-row gap-1.5 p-1 sm:p-1.5 rounded-md bg-white shadow-lg ring-1 ring-white/30">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-neutral-400"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Food franchise under ₹50L in Chennai"
                  className="h-11 md:h-14 pl-10 md:pl-11 border-0 bg-transparent text-sm md:text-lg text-neutral-900 placeholder:text-neutral-400 shadow-none focus-visible:ring-0"
                  aria-label="Search franchises by investment, location, industry or expected returns"
                />
              </div>
              <Button
                type="submit"
                className="h-11 md:h-14 px-5 md:px-8 text-sm md:text-base font-semibold bg-growth-green hover:bg-growth-green/90 text-white shrink-0 rounded-sm"
              >
                Search
              </Button>
            </div>
          </form>

          <p className="text-[11px] text-white/40 mb-1.5 hidden sm:block">
            Search franchises by investment, location, industry or expected returns
          </p>

          <div className="flex flex-nowrap overflow-x-auto gap-1.5 mb-2 md:mb-2.5 scrollbar-hide -mx-0.5 px-0.5">
            <span className="text-[11px] text-white/40 shrink-0 self-center">Popular:</span>
            {POPULAR.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.q, item.type)}
                className="px-2 py-1 rounded text-[11px] md:text-[12px] text-white/65 hover:text-white hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer transition-colors min-h-[28px]"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            className="flex w-full sm:w-auto rounded-md border border-white/15 bg-white/[0.03] p-0.5"
            role="tablist"
            aria-label="Primary intent"
          >
            {INTENTS.map((intent) => (
              <button
                key={intent.id}
                type="button"
                role="tab"
                aria-selected={activeIntent === intent.id}
                onClick={() => onIntent(intent)}
                className={cn(
                  "flex-1 sm:flex-none px-2.5 py-2 md:px-3 md:py-1.5 text-[11px] md:text-sm font-medium rounded-sm transition-colors cursor-pointer min-h-[36px]",
                  activeIntent === intent.id
                    ? "bg-white text-neutral-900"
                    : "text-white/70 hover:text-white"
                )}
              >
                {intent.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
