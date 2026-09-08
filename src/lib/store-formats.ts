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

  return {
    total_investment_min: mins.length ? Math.min(...mins) : undefined,
    total_investment_max: maxs.length ? Math.max(...maxs) : undefined,
    space_required_sqft: spaces.length ? Math.min(...spaces) : undefined,
  };
}
