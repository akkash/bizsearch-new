import type { Franchise } from '@/types/listings';

export interface BestMatchContext {
  city?: string;
  budgetMax?: number;
}

function completeness(franchise: Franchise): number {
  return franchise.data_completeness_score ?? franchise.dataCompletenessScore ?? 0;
}

function isVerified(franchise: Franchise): boolean {
  return franchise.verification_status === 'verified';
}

function citiesOf(franchise: Franchise): string[] {
  const preferred = Array.isArray(franchise.preferred_cities)
    ? franchise.preferred_cities.map(String)
    : [];
  const hq = [franchise.headquarters_city, franchise.headquartersCity].filter(Boolean) as string[];
  return [...preferred, ...hq].map((city) => city.toLowerCase());
}

/** Rank for Best Match: verified, completeness, and searcher intent. */
export function franchiseBestMatchScore(
  franchise: Franchise,
  context: BestMatchContext = {}
): number {
  let score = 0;

  if (isVerified(franchise)) score += 40;
  score += Math.min(30, completeness(franchise) * 0.3);

  if (franchise.featured) score += 10;

  const city = context.city?.trim().toLowerCase();
  if (city) {
    const matched = citiesOf(franchise).some(
      (value) => value.includes(city) || city.includes(value)
    );
    if (matched) score += 15;
  }

  if (context.budgetMax && context.budgetMax > 0) {
    const min = franchise.total_investment_min ?? franchise.investmentMin ?? 0;
    if (min > 0 && min <= context.budgetMax) score += 10;
  }

  const created = new Date(franchise.createdAt ?? franchise.created_at ?? 0).getTime();
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  if (created && ageDays <= 30) score += 5;

  return score;
}

export function sortFranchisesByBestMatch(
  franchises: Franchise[],
  context: BestMatchContext = {}
): Franchise[] {
  return [...franchises].sort((a, b) => {
    const scoreDiff = franchiseBestMatchScore(b, context) - franchiseBestMatchScore(a, context);
    if (scoreDiff !== 0) return scoreDiff;
    const dateA = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
    const dateB = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
    return dateB - dateA;
  });
}
