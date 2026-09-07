import { useState } from "react";
import { Search, ArrowRight, Building2, Store, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onSearch?: (
    query: string,
    type: "business" | "franchise",
    filters: Record<string, unknown>
  ) => void;
  className?: string;
}

const EXAMPLE_SEARCHES = [
  { label: "Restaurant in Chennai under ₹75L", q: "Restaurant in Chennai under ₹75L", type: "business" as const },
  { label: "Manufacturing business under ₹2Cr", q: "Manufacturing business under ₹2Cr", type: "business" as const },
  { label: "Profitable business in Coimbatore", q: "Profitable business in Coimbatore", type: "business" as const },
  { label: "Franchise under ₹30L", q: "Franchise under ₹30L", type: "franchise" as const },
];

const USER_PATHS = [
  {
    title: "Buy a Business",
    description: "Operating businesses for sale",
    href: "/businesses",
    icon: Building2,
  },
  {
    title: "Find a Franchise",
    description: "Brands seeking franchisees",
    href: "/franchises",
    icon: Store,
  },
  {
    title: "Sell a Business",
    description: "List and reach qualified buyers",
    href: "/add-business-listing",
    icon: CircleDollarSign,
  },
];

export function HeroSection({ onSearch, className }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (q: string, type: "business" | "franchise" = "business") => {
    const trimmed = q.trim();
    if (onSearch) {
      onSearch(trimmed, type, {});
      return;
    }
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const path = type === "franchise" ? "/franchises" : "/businesses";
    navigate(params.toString() ? `${path}?${params}` : path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lower = query.toLowerCase();
    const type = lower.includes("franchise") ? "franchise" : "business";
    submitSearch(query, type);
  };

  return (
    <section className={cn("relative border-b border-border bg-card", className)}>
      <div className="absolute inset-0 bg-[hsl(220,32%,7%)] dark:bg-background" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white tracking-tight leading-[1.1] mb-4">
            Find a business worth buying.
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Search businesses and franchises for sale by location, industry,
            investment, revenue and more.
          </p>
        </div>

        {/* Primary search — visual focal point */}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto mb-5"
        >
          <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-xl bg-white dark:bg-card border border-white/10 shadow-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: Restaurant in Chennai under ₹75L"
                className="h-12 md:h-14 pl-11 border-0 bg-transparent text-base md:text-lg shadow-none focus-visible:ring-0"
                aria-label="Search businesses and franchises"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 md:h-14 px-6 md:px-8 bg-growth-green hover:bg-growth-green/90 text-white font-semibold shrink-0"
            >
              Search
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Example searches */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {EXAMPLE_SEARCHES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => submitSearch(example.q, example.type)}
              className="px-3 py-1.5 rounded-md text-sm text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              {example.label}
            </button>
          ))}
        </div>

        {/* Three primary user paths */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {USER_PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.href}
                to={path.href}
                className="group flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-md bg-growth-green/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-growth-green" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-growth-green transition-colors">
                    {path.title}
                  </div>
                  <div className="text-xs text-white/55 truncate">{path.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
