import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format-currency";
import {
  buildFranchiseSearchPath,
  uniqueFranchiseCategories,
  type FranchiseSearchIntent,
} from "@/lib/franchise-search";

interface MarketplaceHeroProps {
  className?: string;
}

const CITIES = [
  "Chennai",
  "Bengaluru",
  "Coimbatore",
  "Hyderabad",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Ahmedabad",
  "Kochi",
  "Kolkata",
];

const PLACEHOLDERS = [
  "Try 'Bakery in Coimbatore' or 'Salon under 25L'",
  "Try 'Food franchise in Chennai under 50L'",
  "Try 'Preschool in Hyderabad'",
  "Try 'QSR under ₹40L in Bangalore'",
];

const PROMPTS: { label: string; intent: FranchiseSearchIntent }[] = [
  {
    label: "I have ₹50L and want a food franchise in Chennai",
    intent: { industrySlug: "food-beverage", city: "Chennai", budget: 5000000 },
  },
  {
    label: "Education franchise under ₹1Cr",
    intent: { industrySlug: "education", budget: 10000000 },
  },
  {
    label: "Retail franchise in Bangalore under ₹40L",
    intent: { industrySlug: "retail", city: "Bangalore", budget: 4000000 },
  },
  {
    label: "Low-investment service franchise",
    intent: { budget: 2500000 },
  },
];

const INTENTS = [
  { id: "franchise" as const, label: "Find a Franchise", href: "/franchises" },
  { id: "match" as const, label: "Match My Profile", href: "/match" },
  { id: "compare" as const, label: "Compare Opportunities", href: "/franchises?compare=1" },
  { id: "list" as const, label: "List Your Franchise", href: "/add-franchise-listing" },
];

const BUDGET_MIN = 500000;
const BUDGET_MAX = 20000000;
const fieldClass =
  "h-11 w-full border-0 bg-transparent px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0";

export function MarketplaceHero({ className }: MarketplaceHeroProps) {
  const categories = useMemo(() => uniqueFranchiseCategories(), []);
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState(5000000);
  const [city, setCity] = useState("");
  const [phrase, setPhrase] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activeIntent, setActiveIntent] = useState<(typeof INTENTS)[number]["id"]>("franchise");
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const applyIntent = (intent: FranchiseSearchIntent) => {
    setIndustry(intent.industrySlug ?? "");
    setCity(intent.city ?? "");
    if (intent.budget) setBudget(intent.budget);
    navigate(buildFranchiseSearchPath(intent));
  };

  const searchOpportunities = () => {
    if (phrase.trim() && !industry && !city) {
      navigate(`/smart-search?q=${encodeURIComponent(phrase.trim())}`);
      return;
    }
    navigate(
      buildFranchiseSearchPath({
        industrySlug: industry || undefined,
        city: city.trim() || undefined,
        budget,
        q: phrase.trim() || undefined,
      })
    );
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
          className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr_1.2fr_auto] md:items-stretch">
            <label className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
              <span className="px-4 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Category
              </span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={fieldClass}
                aria-label="Industry"
              >
                <option value="">Any industry</option>
                {categories.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col justify-center px-4 py-3 border-b md:border-b-0 md:border-r border-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Budget
              </span>
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span className="text-xs text-muted-foreground">Up to</span>
                <span className="font-mono text-sm font-bold text-growth-green whitespace-nowrap">
                  {formatINR(budget)}
                </span>
              </div>
              <Slider
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={100000}
                value={[budget]}
                onValueChange={(v) => setBudget(v[0] ?? 5000000)}
                aria-label="Maximum liquid capital"
              />
            </label>
            <label className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
              <span className="px-4 pt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                City / search
              </span>
              <input
                list="hero-cities"
                value={city || phrase}
                onChange={(e) => {
                  const value = e.target.value;
                  if (CITIES.some((c) => c === value || (c === "Bengaluru" && value === "Bangalore"))) {
                    setCity(value === "Bengaluru" ? "Bangalore" : value);
                    setPhrase("");
                  } else {
                    setCity("");
                    setPhrase(value);
                  }
                }}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className={fieldClass}
                aria-label="City or franchise search"
              />
              <datalist id="hero-cities">
                {CITIES.map((name) => (
                  <option key={name} value={name === "Bengaluru" ? "Bangalore" : name}>
                    {name}
                  </option>
                ))}
              </datalist>
            </label>
            <Button
              type="submit"
              className="h-14 md:h-auto md:min-h-[5.5rem] w-full rounded-none md:rounded-none px-6 md:px-8 text-sm"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Try
          </span>
          {PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => applyIntent(item.intent)}
              className="text-xs rounded-lg border border-border bg-card px-3 py-1.5 min-h-[32px] text-left text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors duration-150 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

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
