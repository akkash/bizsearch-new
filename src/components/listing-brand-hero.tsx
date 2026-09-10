import { useState } from "react";
import { cn } from "@/lib/utils";

type ListingBrandHeroProps = {
  brandName: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  variant?: "card" | "list" | "compact";
  children?: React.ReactNode;
  className?: string;
};

/**
 * Brand-first media block for listing cards.
 * Outlet / hero photo when present; official logo as a clear-space badge on the photo,
 * or as a large centered mark when there is no photo. Never invents assets.
 */
export function ListingBrandHero({
  brandName,
  logoUrl,
  coverUrl,
  variant = "card",
  children,
  className,
}: ListingBrandHeroProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const cover = coverFailed || (coverUrl && coverUrl === logoUrl) ? null : coverUrl || null;
  const logo = logoFailed ? null : logoUrl || null;
  const initial = brandName.trim().charAt(0).toUpperCase() || "F";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        variant === "card" && "aspect-[16/10] min-h-[11.5rem] w-full",
        variant === "list" && "h-40 w-full sm:h-auto sm:w-52 sm:min-h-[11rem] sm:self-stretch shrink-0",
        variant === "compact" && "h-28 w-full",
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
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-card px-8 py-6">
          <img
            src={logo}
            alt={`${brandName} logo`}
            className="max-h-full max-w-[72%] object-contain"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <span className="font-display text-5xl font-bold text-trust-blue" aria-hidden="true">
            {initial}
          </span>
        </div>
      )}

      {cover && logo && (
        <div className="absolute bottom-3 left-3 h-[4.25rem] w-[4.25rem] md:h-[4.75rem] md:w-[4.75rem] bg-white dark:bg-card border border-border shadow-[var(--shadow-sm)] p-1.5 flex items-center justify-center">
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
