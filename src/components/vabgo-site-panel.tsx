import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { VabgoSiteLink } from "@/components/vabgo-site-link";
import {
  VabgoClient,
  hasSearchableIntent,
} from "@/lib/vabgo-client";
import { formatINR } from "@/lib/format-currency";
import type { VabgoLocationIntent, VabgoSearchResponse } from "@/types/vabgo";
import { cn } from "@/lib/utils";

type VabgoSitePanelProps = {
  intent: VabgoLocationIntent;
  className?: string;
  heading?: string;
};

export function VabgoSitePanel({
  intent,
  className,
  heading = "Commercial sites on VABGO",
}: VabgoSitePanelProps) {
  const searchable = hasSearchableIntent(intent);
  const intentKey = useMemo(
    () =>
      JSON.stringify({
        city: intent.city ?? null,
        locality: intent.locality ?? null,
        propertyType: intent.propertyType ?? null,
        listingType: intent.listingType ?? null,
        minAreaSqft: intent.minAreaSqft ?? null,
        maxAreaSqft: intent.maxAreaSqft ?? null,
        areaSqft: intent.areaSqft ?? null,
        limit: intent.limit ?? 5,
      }),
    [
      intent.city,
      intent.locality,
      intent.propertyType,
      intent.listingType,
      intent.minAreaSqft,
      intent.maxAreaSqft,
      intent.areaSqft,
      intent.limit,
    ]
  );

  const [loading, setLoading] = useState(searchable);
  const [search, setSearch] = useState<VabgoSearchResponse | null>(null);

  useEffect(() => {
    if (!searchable || !VabgoClient.isEnabled()) {
      setLoading(false);
      setSearch(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const parsed = JSON.parse(intentKey) as VabgoLocationIntent;
    VabgoClient.search({ ...parsed, listingType: parsed.listingType || "Rent" }).then(
      (response) => {
        if (!cancelled) {
          setSearch(response);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [intentKey, searchable]);

  if (!VabgoClient.isEnabled()) return null;

  const browseUrl = search?.browseUrl;
  const results = search?.results ?? [];
  const showEmpty = Boolean(search?.ok && !loading && results.length === 0);

  return (
    <div className={cn("border border-border p-4 space-y-3", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest">VABGO</p>
          <h3 className="text-sm font-semibold">{heading}</h3>
        </div>
        <VabgoSiteLink intent={intent} href={browseUrl} />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Looking up sites on VABGO…</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="space-y-2">
          {results.map((site) => (
            <li key={site.id}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 border border-border p-2 hover:bg-secondary/50 transition-colors"
              >
                {site.thumbnailUrl ? (
                  <img
                    src={site.thumbnailUrl}
                    alt=""
                    className="h-16 w-20 object-cover shrink-0 bg-muted"
                  />
                ) : (
                  <div className="h-16 w-20 shrink-0 border border-border bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {site.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[site.locality || site.city, site.propertyType, site.listingType]
                      .filter(Boolean)
                      .join(" · ")}
                    {site.areaSqft ? ` · ${site.areaSqft.toLocaleString("en-IN")} sq ft` : ""}
                  </p>
                  <p className="text-xs font-mono mt-1">
                    {site.priceFormatted || formatINR(site.price)}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-1" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <p className="text-sm text-muted-foreground">No details found in the table.</p>
      )}
    </div>
  );
}

/** Compact outbound-only CTA when a full results panel is too heavy. */
export function VabgoSiteFallback({
  intent,
  className,
}: {
  intent: VabgoLocationIntent;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Find matching commercial property on VABGO. Listings open on vabgo.com.
        </p>
        <VabgoSiteLink intent={intent} />
      </CardContent>
    </Card>
  );
}
