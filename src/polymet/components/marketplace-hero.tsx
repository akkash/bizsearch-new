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
  { id: "match" as const, label: "Match My Profile", href: "/match" },
  { id: "compare" as const, label: "Compare Opportunities", href: "/franchises?compare=1" },
  { id: "list" as const, label: "List Your Franchise", href: "/add-franchise-listing" },
];

export function MarketplaceHero({ className }: MarketplaceHeroProps) {
  const [query, setQuery] = useState("");
  const [activeIntent, setActiveIntent] = useState<(typeof INTENTS)[number]["id"]>("franchise");
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
    <section className={cn("bg-background border-b border-border pt-16 pb-14 md:pt-24 md:pb-20 px-0", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8 md:mb-12 uppercase">
            Find the right
            <br />
            franchise to build
            <br />
            your next business.
          </h1>

          <div className="max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(query || "Food franchise under ₹50L in Chennai", "franchise");
              }}
              className="flex flex-col md:flex-row gap-4 mb-8"
            >
              <div className="relative flex-1 min-w-0">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Food franchise under ₹50L in Chennai"
                  className="w-full h-14 md:h-16 pl-12 pr-4 bg-transparent border-2 border-foreground text-base md:text-lg placeholder:text-foreground/40 font-medium shadow-none rounded-none focus-visible:ring-0"
                  aria-label="Search franchises by investment, location, industry or expected returns"
                />
              </div>
              <Button
                type="submit"
                className="h-14 md:h-16 px-10 text-base md:text-lg shrink-0"
              >
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-2 mb-10 md:mb-12 items-center">
              <span className="text-xs font-bold uppercase tracking-widest mr-2">Popular:</span>
              {POPULAR.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.q, item.type)}
                  className="text-xs border border-foreground/20 px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer min-h-[28px]"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              className="flex flex-nowrap overflow-x-auto scrollbar-hide border-b-2 border-foreground"
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
                    "px-3 md:px-5 py-3 md:py-4 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer min-h-[44px] whitespace-nowrap shrink-0",
                    activeIntent === intent.id
                      ? "bg-foreground text-background"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {intent.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
