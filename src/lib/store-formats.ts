import { formatINR } from '@/lib/format-currency';

/** Canonical store / outlet format for a franchise brand */
export interface StoreFormat {
  id: string;
  name: string;
  minSqft: number;
  maxSqft: number;
  investmentMin?: number;
  investmentMax?: number;
  franchiseFee?: number;
  description?: string;
  propertyType?: string;
  groundFloor?: boolean;
  parkingRequired?: boolean;
  maxRent?: number;
  frontageFt?: number;
}

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

/** Normalize raw JSONB / form store_formats into StoreFormat[] */
export function normalizeStoreFormats(raw: unknown): StoreFormat[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const id = str(o.id) || `format-${index}`;
      const name = str(o.name);
      if (!name) return null;
      return {
        id,
        name,
        minSqft: num(o.minSqft) ?? num(o.min_sqft) ?? 0,
        maxSqft: num(o.maxSqft) ?? num(o.max_sqft) ?? 0,
        investmentMin: num(o.investmentMin) ?? num(o.investment_min),
        investmentMax: num(o.investmentMax) ?? num(o.investment_max),
        franchiseFee: num(o.franchiseFee) ?? num(o.franchise_fee),
        description: str(o.description),
        propertyType: str(o.propertyType) || str(o.property_type),
        groundFloor:
          typeof o.groundFloor === 'boolean'
            ? o.groundFloor
            : typeof o.ground_floor === 'boolean'
              ? o.ground_floor
              : undefined,
        parkingRequired:
          typeof o.parkingRequired === 'boolean'
            ? o.parkingRequired
            : typeof o.parking_required === 'boolean'
              ? o.parking_required
              : undefined,
        maxRent: num(o.maxRent) ?? num(o.max_rent),
        frontageFt: num(o.frontageFt) ?? num(o.frontage_ft),
      } satisfies StoreFormat;
    })
    .filter(Boolean) as StoreFormat[];
}

export function getStoreFormatsFromFranchise(franchise: {
  storeFormats?: unknown;
  store_formats?: unknown;
}): StoreFormat[] {
  return normalizeStoreFormats(franchise.storeFormats ?? franchise.store_formats);
}

/** Aggregate investment band across all formats (and optional listing-level fallback) */
export function getFranchiseInvestmentRange(
  franchise: {
    storeFormats?: unknown;
    store_formats?: unknown;
    investmentMin?: number;
    investmentMax?: number;
    total_investment_min?: number;
    total_investment_max?: number;
  }
): { min: number | null; max: number | null } {
  const formats = getStoreFormatsFromFranchise(franchise);
  const mins = formats
    .map((f) => f.investmentMin)
    .filter((n): n is number => n != null && n > 0);
  const maxs = formats
    .map((f) => f.investmentMax ?? f.investmentMin)
    .filter((n): n is number => n != null && n > 0);

  if (mins.length || maxs.length) {
    return {
      min: mins.length ? Math.min(...mins) : null,
      max: maxs.length ? Math.max(...maxs) : null,
    };
  }

  const min = franchise.investmentMin ?? franchise.total_investment_min ?? null;
  const max = franchise.investmentMax ?? franchise.total_investment_max ?? min;
  return {
    min: min != null && Number(min) > 0 ? Number(min) : null,
    max: max != null && Number(max) > 0 ? Number(max) : null,
  };
}

export function formatInvestmentRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (min == null && max == null) return 'Not provided';
  if (min != null && max != null && max !== min) {
    return `${formatINR(min)}–${formatINR(max)}`;
  }
  return formatINR(min ?? max);
}

export function formatStoreFormatSpace(format: StoreFormat): string {
  if (!format.minSqft && !format.maxSqft) return 'Space not provided';
  if (format.minSqft && format.maxSqft && format.maxSqft !== format.minSqft) {
    return `${format.minSqft}–${format.maxSqft} sq ft`;
  }
  return `${format.minSqft || format.maxSqft} sq ft`;
}

export function formatStoreFormatInvestment(format: StoreFormat): string {
  return formatInvestmentRange(
    format.investmentMin ?? null,
    format.investmentMax ?? null
  );
}

export function findStoreFormat(
  formats: StoreFormat[],
  id: string | null | undefined
): StoreFormat | null {
  if (!id || !formats.length) return null;
  return formats.find((f) => f.id === id) || null;
}

/** Build listing-level min/max from formats for DB columns */
export function aggregateInvestmentFromFormats(formats: StoreFormat[]): {
  total_investment_min?: number;
  total_investment_max?: number;
  space_required_sqft?: number;
  min_area_sqft?: number;
  max_area_sqft?: number;
} {
  const normalized = formats.filter(Boolean);
  if (!normalized.length) return {};

  const mins = normalized
    .map((f) => f.investmentMin)
    .filter((n): n is number => n != null && n > 0);
  const maxs = normalized
    .map((f) => f.investmentMax ?? f.investmentMin)
    .filter((n): n is number => n != null && n > 0);
  const spaces = normalized
    .map((f) => f.minSqft || f.maxSqft)
    .filter((n) => n > 0);
  const maxSpaces = normalized
    .map((f) => f.maxSqft || f.minSqft)
    .filter((n) => n > 0);

  return {
    total_investment_min: mins.length ? Math.min(...mins) : undefined,
    total_investment_max: maxs.length ? Math.max(...maxs) : undefined,
    space_required_sqft: spaces.length ? Math.min(...spaces) : undefined,
    min_area_sqft: spaces.length ? Math.min(...spaces) : undefined,
    max_area_sqft: maxSpaces.length ? Math.max(...maxSpaces) : undefined,
  };
}

export type FranchiseListingRequirements = {
  minInvestment: number | null;
  maxInvestment: number | null;
  minAreaSqft: number | null;
  maxAreaSqft: number | null;
  propertyType: string | null;
  ownerOperatorRequired: boolean;
  openingTimeline: string | null;
  preferredCities: string[];
  requiredExperience: string | null;
  preferredExperience: string | null;
  groundFloor: boolean | null;
  parkingRequired: boolean | null;
  maxRent: number | null;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

/** Structured listing-side requirements used by matching */
export function getListingRequirements(franchise: {
  storeFormats?: unknown;
  store_formats?: unknown;
  investmentMin?: number;
  investmentMax?: number;
  total_investment_min?: number;
  total_investment_max?: number;
  space_required_sqft?: number;
  min_area_sqft?: number;
  max_area_sqft?: number;
  property_type?: string | null;
  owner_operator_required?: boolean | null;
  opening_timeline?: string | null;
  preferred_cities?: unknown;
  expansion_territories?: unknown;
  experience_required?: string | null;
  preferred_experience?: string | null;
  ground_floor?: boolean | null;
  parking_required?: boolean | null;
  max_rent?: number | null;
}): FranchiseListingRequirements {
  const range = getFranchiseInvestmentRange(franchise);
  const formats = getStoreFormatsFromFranchise(franchise);
  const fromFormats = aggregateInvestmentFromFormats(formats);
  const cities = asStringArray(franchise.preferred_cities);
  const territories = asStringArray(franchise.expansion_territories);
  const formatProperty = formats.find((f) => f.propertyType)?.propertyType;

  return {
    minInvestment: range.min,
    maxInvestment: range.max,
    minAreaSqft:
      franchise.min_area_sqft ??
      fromFormats.min_area_sqft ??
      franchise.space_required_sqft ??
      null,
    maxAreaSqft: franchise.max_area_sqft ?? fromFormats.max_area_sqft ?? null,
    propertyType: franchise.property_type || formatProperty || null,
    ownerOperatorRequired: franchise.owner_operator_required === true,
    openingTimeline: franchise.opening_timeline || null,
    preferredCities: cities.length ? cities : territories,
    requiredExperience: franchise.experience_required || null,
    preferredExperience: franchise.preferred_experience || null,
    groundFloor:
      typeof franchise.ground_floor === 'boolean'
        ? franchise.ground_floor
        : formats.some((f) => f.groundFloor) || null,
    parkingRequired:
      typeof franchise.parking_required === 'boolean'
        ? franchise.parking_required
        : formats.some((f) => f.parkingRequired) || null,
    maxRent: franchise.max_rent ?? formats.find((f) => f.maxRent)?.maxRent ?? null,
  };
}
