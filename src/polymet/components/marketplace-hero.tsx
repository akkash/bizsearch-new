import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MarketplaceHeroProps {
  className?: string;
}

const INDUSTRIES = [
  { label: "Any industry", value: "" },
  { label: "Food & beverage", value: "Food" },
  { label: "Education", value: "Education" },
  { label: "Retail", value: "Retail" },
  { label: "Health & fitness", value: "Fitness" },
  { label: "Services", value: "Services" },
];

const INVESTMENTS = [
  { label: "Any investment", value: "" },
  { label: "Under ₹25L", value: "under 25L" },
  { label: "₹25L – ₹50L", value: "under 50L" },
  { label: "₹50L – ₹1Cr", value: "under 1Cr" },
  { label: "Above ₹1Cr", value: "above 1Cr" },
];

const CITIES = [
  { label: "Any city", value: "" },
  { label: "Chennai", value: "Chennai" },
  { label: "Bengaluru", value: "Bangalore" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Mumbai", value: "Mumbai" },
  { label: "Delhi NCR", value: "Delhi" },
];

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

const fieldClass =
  "h-14 w-full border-0 bg-transparent px-4 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-0";

export function MarketplaceHero({ className }: MarketplaceHeroProps) {
  const [industry, setIndustry] = useState("");
  const [investment, setInvestment] = useState("");
  const [city, setCity] = useState("");
  const [activeIntent, setActiveIntent] = useState<(typeof INTENTS)[number]["id"]>("franchise");
  const navigate = useNavigate();

  const go = (q: string, type: "business" | "franchise" = "franchise") => {
    const trimmed = q.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const path = type === "business" ? "/businesses" : "/franchises";
    navigate(params.toString() ? `${path}?${params}` : path);
  };

  const searchOpportunities = () => {
    const parts = [
      industry && `${industry} franchise`,
      investment,
      city && `in ${city}`,
    ].filter(Boolean);
    go(parts.join(" ") || "franchise", "franchise");
  };

  return (
    <section className={cn("bg-background border-b border-border pt-16 pb-14 md:pt-24 md:pb-20", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8 md:mb-12 uppercase max-w-6xl">
          Find the right
          <br />
          franchise to build
          <br />
          your next business.
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchOpportunities();
          }}
          className="border border-border bg-card shadow-[var(--shadow-md)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] divide-y md:divide-y-0 md:divide-x divide-border">
            <label className="flex flex-col justify-center px-1 py-2 md:py-0">
              <span className="px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Industry
              </span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={fieldClass}
                aria-label="Industry"
              >
                {INDUSTRIES.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col justify-center px-1 py-2 md:py-0">
              <span className="px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Investment
              </span>
              <select
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className={fieldClass}
                aria-label="Investment range"
              >
                {INVESTMENTS.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col justify-center px-1 py-2 md:py-0">
              <span className="px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                City
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={fieldClass}
                aria-label="City"
              >
                {CITIES.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="p-2 md:p-0 flex">
              <Button
                type="submit"
                className="h-14 md:h-full w-full md:w-auto rounded-none px-6 md:px-8 text-sm"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search Opportunities
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center border-t border-border px-4 py-3 bg-secondary/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
              Popular
            </span>
            {POPULAR.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.q, item.type)}
                className="text-xs rounded-full border border-border bg-card px-3 py-1.5 min-h-[32px] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Primary actions">
          {INTENTS.map((intent) => (
            <Button
              key={intent.id}
              type="button"
              variant={activeIntent === intent.id ? "default" : "outline"}
              size="sm"
              className="min-h-[44px]"
              onClick={() => {
                setActiveIntent(intent.id);
                navigate(intent.href);
              }}
            >
              {intent.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
