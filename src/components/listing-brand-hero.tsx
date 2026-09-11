import { useState } from "react";
import {
  Briefcase,
  Building2,
  Car,
  Dumbbell,
  Factory,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  Package,
  Plane,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Tv,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FRANCHISE_CATEGORIES } from "@/data/categories";

const ICONS: Record<string, LucideIcon> = {
  Car,
  Sparkles,
  Briefcase,
  Package,
  GraduationCap,
  Shirt,
  UtensilsCrossed,
  Home,
  Plane,
  ShoppingBag,
  Dumbbell,
  Zap,
  Factory,
  Landmark,
  HeartPulse,
  Laptop,
  Building2,
  Store,
  Truck,
  Tv,
  Scissors,
};

type ListingBrandHeroProps = {
  brandName: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  industry?: string | null;
  variant?: "card" | "list" | "compact";
  children?: React.ReactNode;
  className?: string;
};

function CategoryMonogram({ brandName, industry }: { brandName: string; industry?: string | null }) {
  const category = FRANCHISE_CATEGORIES.find((cat) => {
    const needle = (industry || "").toLowerCase();
    if (!needle) return false;
    return (
      cat.name.toLowerCase() === needle ||
      needle.includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().includes(needle) ||
      cat.subcategories.some((sub) => needle.includes(sub.name.toLowerCase()))
    );
  });
  const Icon = (category && ICONS[category.icon]) || Store;
  const label = category?.name || industry || "Franchise";

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-white/90 text-growth-green shadow-sm dark:bg-card">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="sr-only">{brandName}</span>
    </div>
  );
}

/**
 * Brand-first media block. 16:9 cover when present; geometric pattern +
 * centered logo (or category monogram) otherwise. Logo badge sits bottom-left.
 */
export function ListingBrandHero({
  brandName,
  logoUrl,
  coverUrl,
  industry,
  variant = "card",
  children,
  className,
}: ListingBrandHeroProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const cover = coverFailed || (coverUrl && coverUrl === logoUrl) ? null : coverUrl || null;
  const logo = logoFailed ? null : logoUrl || null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-t-lg listing-hero-pattern",
        variant === "card" && "aspect-video w-full",
        variant === "list" && "aspect-video w-full sm:aspect-auto sm:h-auto sm:w-52 sm:min-h-[9.5rem] sm:self-stretch sm:rounded-l-lg sm:rounded-tr-none shrink-0",
        variant === "compact" && "aspect-video w-full h-28",
        className
      )}
    >
      {cover ? (
        <img
          src={cover}
          alt={`${brandName} outlet`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setCoverFailed(true)}
        />
      ) : logo ? (
        <div className="absolute inset-0 flex items-center justify-center px-8 py-6">
          <img
            src={logo}
            alt={`${brandName} logo`}
            className="max-h-[70%] max-w-[70%] object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryMonogram brandName={brandName} industry={industry} />
        </div>
      )}

      {cover && logo && (
        <div className="absolute bottom-3 left-3 h-14 w-14 md:h-16 md:w-16 rounded-lg bg-white dark:bg-card border border-border shadow-sm p-1.5 flex items-center justify-center">
          <img
            src={logo}
            alt=""
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        </div>
      )}

      {children}
    </div>
  );
}
