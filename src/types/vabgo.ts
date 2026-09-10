/** VABGO is an external commercial-property marketplace (vabgo.com). */

export type VabgoPropertyType =
  | "retail"
  | "kiosk"
  | "food_court"
  | "high_street"
  | "mall"
  | "standalone"
  | "office"
  | "warehouse"
  | "factory"
  | "other";

export type VabgoListingType = "Rent" | "Sale";

export type VabgoLocationIntent = {
  profileId?: string;
  city?: string | null;
  state?: string | null;
  locality?: string | null;
  areaSqft?: number | null;
  minAreaSqft?: number | null;
  maxAreaSqft?: number | null;
  propertyType?: VabgoPropertyType | string | null;
  listingType?: VabgoListingType | null;
  lat?: number | null;
  lng?: number | null;
  limit?: number;
};

export type VabgoSiteMatch = {
  id: string;
  slug: string;
  label: string;
  city?: string | null;
  locality?: string | null;
  propertyType?: string | null;
  listingType?: string | null;
  areaSqft?: number | null;
  price?: number | null;
  priceFormatted?: string | null;
  thumbnailUrl?: string | null;
  verified?: boolean;
  /** Absolute VABGO property page. */
  url: string;
  /** Commercial landing for this listing’s city and type. */
  landingUrl?: string | null;
};

export type VabgoSearchResponse = {
  ok: boolean;
  browseUrl: string;
  total: number;
  results: VabgoSiteMatch[];
};
