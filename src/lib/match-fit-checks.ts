import type { FranchiseeProfile } from '@/lib/ai-franchisee-matcher-service';

export type FitCheck = {
  label: string;
  pass: boolean | null;
  detail: string;
};

type MatchLike = {
  matchScore: number;
  financialFitScore: number;
  locationFitScore: number;
  experienceFitScore: number;
  franchise: {
    brandName: string;
    industry: string;
    totalInvestment: { min: number; max: number };
    preferredCities?: string[];
    territoriesAvailable?: string[];
    minAreaSqft?: number;
    maxAreaSqft?: number;
    minimumLiquidCapital?: number;
  };
};

function overlap(a?: string[], b?: string[]): boolean {
  if (!a?.length || !b?.length) return false;
  return a.some((left) =>
    b.some((right) => left.toLowerCase().includes(right.toLowerCase()) || right.toLowerCase().includes(left.toLowerCase()))
  );
}

export function buildMatchFitChecks(
  profile: Partial<FranchiseeProfile>,
  match: MatchLike
): FitCheck[] {
  const budgetMax = profile.budget?.max || 0;
  const budgetOk =
    budgetMax > 0 ? match.franchise.totalInvestment.min <= budgetMax : null;
  const cities = [
    ...(match.franchise.preferredCities || []),
    ...(match.franchise.territoriesAvailable || []),
  ];
  const cityOk = profile.preferredLocations?.length
    ? overlap(profile.preferredLocations, cities.length ? cities : undefined)
    : null;
  const industryOk = profile.industries?.length
    ? profile.industries.some((ind) =>
        match.franchise.industry.toLowerCase().includes(ind.toLowerCase())
      )
    : null;
  const space = profile.spaceAvailable;
  const spaceOk =
    space && match.franchise.minAreaSqft
      ? space >= match.franchise.minAreaSqft &&
        (!match.franchise.maxAreaSqft || space <= match.franchise.maxAreaSqft)
      : null;
  const capitalOk =
    profile.liquidCapital && match.franchise.minimumLiquidCapital
      ? profile.liquidCapital >= match.franchise.minimumLiquidCapital
      : null;
  const territoryKnown = (match.franchise.preferredCities?.length || 0) + (match.franchise.territoriesAvailable?.length || 0) > 0;

  return [
    {
      label: 'Budget',
      pass: budgetOk,
      detail:
        budgetMax > 0
          ? `₹${Math.round(budgetMax / 100000)}L vs listing from ₹${Math.round(match.franchise.totalInvestment.min / 100000)}L`
          : 'Budget not set',
    },
    {
      label: 'Location',
      pass: cityOk,
      detail: cityOk ? 'Overlaps your cities' : territoryKnown ? 'No city overlap in listing data' : 'Brand has no city-level territory rows',
    },
    {
      label: 'Industry',
      pass: industryOk,
      detail: match.franchise.industry,
    },
    {
      label: 'Space',
      pass: spaceOk,
      detail: match.franchise.minAreaSqft
        ? `${match.franchise.minAreaSqft}${match.franchise.maxAreaSqft ? `–${match.franchise.maxAreaSqft}` : ''} sq ft`
        : 'Format area not listed',
    },
    {
      label: 'Territory published',
      pass: territoryKnown ? true : false,
      detail: territoryKnown ? 'Listing includes cities/territories' : 'Cannot confirm open cities',
    },
    {
      label: 'Liquid capital',
      pass: capitalOk,
      detail: match.franchise.minimumLiquidCapital
        ? `Brand minimum ₹${Math.round(Number(match.franchise.minimumLiquidCapital) / 100000)}L`
        : 'Brand has no liquid-capital minimum',
    },
  ];
}
