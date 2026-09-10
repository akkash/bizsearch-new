import type {
  VabgoLocationIntent,
  VabgoSearchResponse,
  VabgoSiteMatch,
} from "@/types/vabgo";

const DEFAULT_ORIGIN = "https://vabgo.com";

type VabgoLandingType =
  | "shops"
  | "office-space"
  | "godown-warehouse-and-cold-storage"
  | "factory-and-industry-building"
  | "all-commercial-property";

type VabgoApiPropertyType =
  | "Shops"
  | "Showrooms"
  | "Office Space"
  | "Godown Warehouse And Cold Storage"
  | "Factory And Industry Building";

function origin(): string {
  const fromEnv = import.meta.env?.VITE_VABGO_ORIGIN;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_ORIGIN;
}

function apiOrigin(): string {
  const fromEnv = import.meta.env?.VITE_VABGO_API_ORIGIN;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  const o = origin();
  return o === "https://vabgo.com" ? "https://www.vabgo.com" : o;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "Chennai, Tamil Nadu" → "chennai" */
export function citySlug(city?: string | null): string | null {
  if (!city) return null;
  const primary = city.split(",")[0]?.trim();
  if (!primary) return null;
  const slug = slugify(primary);
  return slug || null;
}

function mapLandingType(propertyType?: string | null): VabgoLandingType {
  const key = (propertyType || "").trim().toLowerCase();
  if (!key || key === "other") return "all-commercial-property";
  if (/office/.test(key)) return "office-space";
  if (/warehouse|godown|cold.?storage/.test(key)) {
    return "godown-warehouse-and-cold-storage";
  }
  if (/factory|industrial|industry/.test(key)) {
    return "factory-and-industry-building";
  }
  if (
    /retail|kiosk|food.?court|food.?qsr|high.?street|mall|standalone|shop|showroom/.test(
      key
    )
  ) {
    return "shops";
  }
  if (/mixed/.test(key)) return "all-commercial-property";
  return "all-commercial-property";
}

function mapApiPropertyType(
  propertyType?: string | null
): VabgoApiPropertyType | null {
  const landing = mapLandingType(propertyType);
  switch (landing) {
    case "shops":
      return /showroom/.test((propertyType || "").toLowerCase())
        ? "Showrooms"
        : "Shops";
    case "office-space":
      return "Office Space";
    case "godown-warehouse-and-cold-storage":
      return "Godown Warehouse And Cold Storage";
    case "factory-and-industry-building":
      return "Factory And Industry Building";
    default:
      return null;
  }
}

function areaBounds(intent: VabgoLocationIntent): {
  min?: number;
  max?: number;
} {
  const min = intent.minAreaSqft ?? null;
  const max = intent.maxAreaSqft ?? intent.areaSqft ?? null;
  if (min != null && max != null) return { min, max };
  if (min != null) return { min };
  if (max != null) return { max };
  return {};
}

function usesSearchUi(intent: VabgoLocationIntent): boolean {
  const area = areaBounds(intent);
  return Boolean(intent.locality || area.min != null || area.max != null);
}

export function hasSearchableIntent(intent: VabgoLocationIntent): boolean {
  return Boolean(
    citySlug(intent.city) ||
      intent.locality ||
      intent.propertyType ||
      intent.minAreaSqft != null ||
      intent.maxAreaSqft != null ||
      intent.areaSqft != null
  );
}

function toAbsolute(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin()}${path}`;
}

function searchParams(intent: VabgoLocationIntent): URLSearchParams {
  const params = new URLSearchParams();
  const city = citySlug(intent.city);
  if (city) params.set("city", city);
  if (intent.locality?.trim()) params.set("locality", intent.locality.trim());
  const propertyType = mapApiPropertyType(intent.propertyType);
  if (propertyType) params.set("property_type", propertyType);
  if (intent.listingType) params.set("listing_type", intent.listingType);
  const area = areaBounds(intent);
  if (area.min != null) params.set("min_area", String(area.min));
  if (area.max != null) params.set("max_area", String(area.max));
  params.set("limit", String(intent.limit && intent.limit > 0 ? intent.limit : 5));
  return params;
}

function fallbackBrowseUrl(intent: VabgoLocationIntent): string {
  return usesSearchUi(intent)
    ? VabgoClient.buildSearchUrl(intent)
    : VabgoClient.buildListingUrl(intent);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function mapResult(raw: unknown, fallbackIntent: VabgoLocationIntent): VabgoSiteMatch | null {
  const row = asRecord(raw);
  if (!row) return null;
  const slug = typeof row.slug === "string" ? row.slug : "";
  const id = row.id != null ? String(row.id) : slug;
  if (!id && !slug) return null;
  const title = typeof row.title === "string" ? row.title : slug || "Commercial property";
  const city = typeof row.city === "string" ? row.city : fallbackIntent.city;
  const detailUrl =
    toAbsolute(typeof row.detail_url === "string" ? row.detail_url : null) ||
    (slug ? VabgoClient.buildPropertyUrl(slug) : fallbackBrowseUrl(fallbackIntent));
  const landingUrl =
    toAbsolute(typeof row.landing_url === "string" ? row.landing_url : null) ||
    VabgoClient.buildListingUrl({
      city: city ?? fallbackIntent.city,
      propertyType:
        (typeof row.property_type === "string" ? row.property_type : null) ||
        fallbackIntent.propertyType,
    });
  const area =
    typeof row.area_sqft === "number"
      ? row.area_sqft
      : row.area_sqft != null
        ? Number(row.area_sqft)
        : null;

  return {
    id,
    slug,
    label: title,
    city,
    locality: typeof row.locality === "string" ? row.locality : null,
    propertyType: typeof row.property_type === "string" ? row.property_type : null,
    listingType: typeof row.listing_type === "string" ? row.listing_type : null,
    areaSqft: Number.isFinite(area) ? area : null,
    price: typeof row.price === "number" ? row.price : null,
    priceFormatted: typeof row.price_formatted === "string" ? row.price_formatted : null,
    thumbnailUrl: typeof row.thumbnail_url === "string" ? row.thumbnail_url : null,
    verified: row.verified === true,
    url: detailUrl,
    landingUrl,
  };
}

function searchEndpoint(): string {
  if (import.meta.env?.DEV) return "/vabgo-api/search";
  return `${apiOrigin()}/api/search`;
}

/**
 * VABGO commercial-property client.
 * Inventory stays on vabgo.com. Browser GET /api/search is allowed from
 * bizsearch.in; iframes stay blocked — always open outbound links.
 */
export const VabgoClient = {
  origin,

  isEnabled(): boolean {
    return true;
  },

  /** Canonical directory landing: /commercial/{type}-in-{city} */
  buildListingUrl(intent: VabgoLocationIntent = {}): string {
    const city = citySlug(intent.city);
    const type = mapLandingType(intent.propertyType);
    if (city) {
      return `${origin()}/commercial/${type}-in-${city}`;
    }
    if (intent.propertyType && type !== "all-commercial-property") {
      return this.buildSearchUrl(intent);
    }
    return `${origin()}/commercial`;
  },

  /** Faceted search UI when locality / area filters apply. */
  buildSearchUrl(intent: VabgoLocationIntent = {}): string {
    const params = searchParams(intent);
    params.delete("limit");
    const qs = params.toString();
    return qs ? `${origin()}/search?${qs}` : `${origin()}/search`;
  },

  buildPropertyUrl(slug: string): string {
    const clean = slug.replace(/^\/+/, "").replace(/^property\//, "");
    return `${origin()}/property/${clean}`;
  },

  browseUrl(intent: VabgoLocationIntent = {}): string {
    return fallbackBrowseUrl(intent);
  },

  async search(intent: VabgoLocationIntent = {}): Promise<VabgoSearchResponse> {
    const browseFallback = fallbackBrowseUrl(intent);
    try {
      const url = `${searchEndpoint()}?${searchParams(intent).toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        console.error("VABGO search failed:", response.status);
        return { ok: false, browseUrl: browseFallback, total: 0, results: [] };
      }
      const payload = asRecord(await response.json());
      if (!payload) {
        return { ok: false, browseUrl: browseFallback, total: 0, results: [] };
      }
      const browseUrl =
        toAbsolute(typeof payload.browse_url === "string" ? payload.browse_url : null) ||
        browseFallback;
      const rawResults = Array.isArray(payload.results) ? payload.results : [];
      const results = rawResults
        .map((row) => mapResult(row, intent))
        .filter((row): row is VabgoSiteMatch => Boolean(row));
      const meta = asRecord(payload.meta);
      const total =
        typeof meta?.total === "number" ? meta.total : results.length;
      return { ok: true, browseUrl, total, results };
    } catch (error) {
      console.error("VABGO search error:", error);
      return { ok: false, browseUrl: browseFallback, total: 0, results: [] };
    }
  },

  async matchSites(intent: VabgoLocationIntent): Promise<VabgoSiteMatch[]> {
    const response = await this.search(intent);
    return response.results;
  },

  async getLocationIntent(_profileId: string): Promise<VabgoLocationIntent | null> {
    return null;
  },
};
