import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VabgoClient } from "@/lib/vabgo-client";
import type { VabgoLocationIntent } from "@/types/vabgo";
import { cn } from "@/lib/utils";

type VabgoSiteLinkProps = {
  intent?: VabgoLocationIntent;
  variant?: "button" | "outline" | "inline";
  size?: "sm" | "default" | "lg";
  label?: string;
  className?: string;
  /** Prefer VABGO's browse_url from /api/search when present. */
  href?: string | null;
  /** Use faceted /search when area or listing type should be applied. */
  useSearch?: boolean;
};

export function VabgoSiteLink({
  intent = {},
  variant = "outline",
  size = "sm",
  label = "Find a site on VABGO",
  className,
  href: hrefOverride,
  useSearch,
}: VabgoSiteLinkProps) {
  if (!VabgoClient.isEnabled()) return null;

  const hasArea =
    intent.minAreaSqft != null ||
    intent.maxAreaSqft != null ||
    intent.areaSqft != null ||
    Boolean(intent.locality);
  const href =
    hrefOverride ||
    (useSearch || hasArea
      ? VabgoClient.buildSearchUrl(intent)
      : VabgoClient.buildListingUrl(intent));

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest underline-offset-4 hover:underline",
          className
        )}
      >
        {label}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <Button variant={variant === "button" ? "default" : "outline"} size={size} asChild className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}
