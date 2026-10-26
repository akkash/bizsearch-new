import { formatINR } from './format-currency';
import { franchiseMatchesCity } from './franchise-search';
import { evaluateOpportunityRecord } from './opportunity-record';
import { isPlatformVerified, mappedTerritoryCount } from './listing-trust';
import { getFranchiseInvestmentRange, getListingRequirements } from './store-formats';
import type { Franchise } from '@/types/listings';

export const MAX_COMPARE = 3;
export const COMPARE_STORAGE_KEY = 'bizsearch_franchise_compare_ids';

export type CompareTone = 'best' | 'mismatch' | 'unpublished' | 'neutral';

export type CompareSeeker = {
  cities: string[];
  budgetMax?: number | null;
  timeCommitment?: string | null;
  liquidCapital?: number | null;
  netWorth?: number | null;
};

export type CompareCell = {
  text: string;
  tone: CompareTone;
};

export type CompareRow = {
  key: string;
  label: string;
  cells: CompareCell[];
};

export type CompareSlot = {
  id: string | null;
  franchise: Franchise | null;
  missing: boolean;
};

export function isCompareIdToken(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

export function parseCompareParam(value: string | null | undefined): {
  openWorkspace: boolean;
  tokens: string[];
} {
  const raw = (value || '').trim();
  if (!raw) return { openWorkspace: false, tokens: [] };
  if (raw === '1' || raw.toLowerCase() === 'true') {
    return { openWorkspace: true, tokens: [] };
  }
  const tokens = [...new Set(raw.split(',').map((part) => part.trim()).filter(Boolean))].slice(
    0,
    MAX_COMPARE
  );
  return { openWorkspace: true, tokens };
}

export function serializeCompareParam(ids: string[], openWorkspace: boolean): string | null {
  if (!openWorkspace) return null;
  const unique = [...new Set(ids.filter(Boolean))].slice(0, MAX_COMPARE);
  return unique.length ? unique.join(',') : '1';
}

export function compareWorkspacePath(ids: string[]): string {
  const value = serializeCompareParam(ids, true) || '1';
  return `/franchises?compare=${value}`;
}

export function searchFromParams(params: URLSearchParams): string {
  const qs = params.toString().replace(/%2C/gi, ',');
  return qs ? `?${qs}` : '';
}

function listingCitiesKnown(franchise: Franchise): boolean {
  return mappedTerritoryCount(franchise) > 0 || getListingRequirements(franchise).preferredCities.length > 0;
}

function investmentMin(franchise: Franchise): number | null {
  const range = getFranchiseInvestmentRange(franchise);
  return range.min ?? franchise.investmentMin ?? franchise.total_investment_min ?? null;
}

function markBest(values: Array<number | null>, cells: CompareCell[], lowerIsBetter = true) {
  const published = values
    .map((value, index) => ({ value, index }))
    .filter((row) => row.value != null && Number.isFinite(row.value)) as Array<{ value: number; index: number }>;
  if (published.length < 2) return;
  const best = published.reduce((winner, row) => {
    if (lowerIsBetter) return row.value < winner.value ? row : winner;
    return row.value > winner.value ? row : winner;
  });
  published.forEach((row) => {
    if (row.value === best.value && cells[row.index].tone === 'neutral') {
      cells[row.index] = { ...cells[row.index], tone: 'best' };
    }
  });
}

export function buildCompareSlots(ids: string[], found: Franchise[]): CompareSlot[] {
  return Array.from({ length: MAX_COMPARE }, (_, index) => {
    const id = ids[index] || null;
    if (!id) return { id: null, franchise: null, missing: false };
    const franchise = found.find((item) => item.id === id || item.slug === id) || null;
    return { id, franchise, missing: !franchise };
  });
}

export function buildCompareRows(slots: CompareSlot[], seeker: CompareSeeker): CompareRow[] {
  const franchises = slots.map((slot) => slot.franchise);

  const cellFor = (slot: CompareSlot, built: CompareCell): CompareCell => {
    if (!slot.id) return { text: 'Add a brand from the list below', tone: 'unpublished' };
    if (slot.missing || !slot.franchise) {
      return { text: 'No details found in the table.', tone: 'unpublished' };
    }
    return built;
  };

  const investmentCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const range = getFranchiseInvestmentRange(franchise);
    if (range.min == null && range.max == null) {
      return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    }
    const min = range.min ?? range.max!;
    const label =
      range.min != null && range.max != null && range.max !== range.min
        ? `${formatINR(range.min)}–${formatINR(range.max)}`
        : formatINR(min);
    const overBudget =
      seeker.budgetMax && seeker.budgetMax > 0 ? min > seeker.budgetMax : false;
    return cellFor(slot, {
      text: label,
      tone: overBudget ? 'mismatch' : 'neutral',
    });
  });
  markBest(
    franchises.map((franchise) => (franchise ? investmentMin(franchise) : null)),
    investmentCells,
    true
  );

  const feeCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const fee = franchise.franchiseFee ?? franchise.franchise_fee ?? null;
    if (fee == null) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    return cellFor(slot, { text: formatINR(fee), tone: 'neutral' });
  });
  markBest(
    franchises.map((franchise) => franchise?.franchiseFee ?? franchise?.franchise_fee ?? null),
    feeCells,
    true
  );

  const royaltyCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const royalty = franchise.royaltyPercentage ?? franchise.royalty_percentage;
    if (royalty == null) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    return cellFor(slot, { text: `${royalty}%`, tone: 'neutral' });
  });
  markBest(
    franchises.map((franchise) => franchise?.royaltyPercentage ?? franchise?.royalty_percentage ?? null),
    royaltyCells,
    true
  );

  const territoryCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    if (!listingCitiesKnown(franchise)) {
      return cellFor(slot, { text: 'Unpublished', tone: 'unpublished' });
    }
    if (!seeker.cities.length) {
      return cellFor(slot, { text: 'Published', tone: 'neutral' });
    }
    const overlap = seeker.cities.some((city) => franchiseMatchesCity(franchise, city));
    return cellFor(slot, {
      text: overlap ? 'Yes' : 'No',
      tone: overlap ? 'best' : 'mismatch',
    });
  });

  const spaceCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const reqs = getListingRequirements(franchise);
    if (reqs.minAreaSqft == null && reqs.maxAreaSqft == null) {
      return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    }
    const text =
      reqs.minAreaSqft != null && reqs.maxAreaSqft != null
        ? `${reqs.minAreaSqft}–${reqs.maxAreaSqft} sq ft`
        : `${reqs.minAreaSqft ?? reqs.maxAreaSqft} sq ft`;
    return cellFor(slot, { text, tone: 'neutral' });
  });

  const ownerCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const required = getListingRequirements(franchise).ownerOperatorRequired;
    if (!required) return cellFor(slot, { text: 'Not required', tone: 'neutral' });
    const mismatch =
      Boolean(seeker.timeCommitment) && seeker.timeCommitment !== 'full-time';
    return cellFor(slot, {
      text: 'Required',
      tone: mismatch ? 'mismatch' : 'neutral',
    });
  });

  const capitalCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const liquid = franchise.minimumLiquidCapital ?? franchise.minimum_liquid_capital ?? franchise.working_capital;
    const net = franchise.minimumNetWorth ?? franchise.minimum_net_worth;
    if (liquid == null && net == null) {
      return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    }
    const parts: string[] = [];
    if (liquid != null) parts.push(`Liquid ${formatINR(Number(liquid))}`);
    if (net != null) parts.push(`Net worth ${formatINR(Number(net))}`);
    const liquidMiss =
      liquid != null && seeker.liquidCapital
        ? seeker.liquidCapital < Number(liquid)
        : false;
    const netMiss =
      net != null && seeker.netWorth ? seeker.netWorth < Number(net) : false;
    return cellFor(slot, {
      text: parts.join(' · '),
      tone: liquidMiss || netMiss ? 'mismatch' : 'neutral',
    });
  });

  const verificationCells = slots.map((slot, index) => {
    const franchise = franchises[index];
    if (!franchise) return cellFor(slot, { text: 'Not published', tone: 'unpublished' });
    const record = evaluateOpportunityRecord(franchise as unknown as Record<string, unknown>, {
      mappedTerritories: mappedTerritoryCount(franchise),
    });
    const completeness =
      franchise.data_completeness_score ?? franchise.dataCompletenessScore ?? record.score;
    const verified = isPlatformVerified(franchise);
    return cellFor(slot, {
      text: `${verified ? 'Platform verified' : 'Franchisor-provided'} · ${completeness}% complete`,
      tone: verified ? 'best' : completeness < 50 ? 'mismatch' : 'neutral',
    });
  });
  markBest(
    franchises.map((franchise) => {
      if (!franchise) return null;
      return (
        franchise.data_completeness_score ??
        franchise.dataCompletenessScore ??
        evaluateOpportunityRecord(franchise as unknown as Record<string, unknown>).score
      );
    }),
    verificationCells,
    false
  );

  return [
    { key: 'investment', label: 'Investment', cells: investmentCells },
    { key: 'fee', label: 'Franchise fee', cells: feeCells },
    { key: 'royalty', label: 'Royalty', cells: royaltyCells },
    { key: 'territory', label: 'Territory vs your city', cells: territoryCells },
    { key: 'space', label: 'Space', cells: spaceCells },
    { key: 'owner', label: 'Owner-operator', cells: ownerCells },
    { key: 'capital', label: 'Liquid / net worth', cells: capitalCells },
    { key: 'trust', label: 'Completeness / verification', cells: verificationCells },
  ];
}

export function budgetToCapacity(max?: number | null): string {
  if (!max || max <= 0) return '';
  if (max < 1000000) return 'below_10l';
  if (max < 2500000) return '10l_25l';
  if (max < 5000000) return '25l_50l';
  if (max < 10000000) return '50l_1cr';
  return 'above_1cr';
}

export function timeToExperience(time?: string | null): string {
  if (time === 'full-time') return 'owner_operator';
  if (time === 'semi-absentee' || time === 'part-time') return 'management';
  return '';
}
