import type { Franchise } from '@/types/listings';
import { normalizeStoreFormats } from '@/lib/store-formats';
import { sanitizePublicWebsite } from '@/lib/public-website';

/** Raw row shape from Supabase `franchises` table */
export type FranchiseDbRow = Record<string, unknown>;

function num(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s.length ? s : undefined;
}

function strArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return [];
}

/**
 * Maps a Supabase franchise row to the frontend domain model (camelCase primary).
 * Components should consume camelCase fields from this mapper only.
 */
export function mapFranchiseFromDb(raw: FranchiseDbRow): Franchise {
  const brandName = str(raw.brand_name) || str(raw.brandName) || '';
  const logo = str(raw.logo_url) || str(raw.logo);
  const investmentMin = num(raw.total_investment_min) ?? num(raw.investmentMin);
  const investmentMax = num(raw.total_investment_max) ?? num(raw.investmentMax);
  const franchiseFee = num(raw.franchise_fee) ?? num(raw.franchiseFee);
  const royaltyPercentage = num(raw.royalty_percentage) ?? num(raw.royaltyPercentage);
  const marketingFeePercentage =
    num(raw.marketing_fee_percentage) ?? num(raw.marketingFeePercentage);
  const outlets = num(raw.total_outlets) ?? num(raw.outlets);
  const establishedYear = num(raw.established_year) ?? num(raw.establishedYear);
  const franchisorId = str(raw.franchisor_id) || str(raw.owner_id);
  const highlights = strArray(raw.highlights);
  const spaceRequiredSqft = num(raw.space_required_sqft) ?? num(raw.spaceRequiredSqft);
  const minimumLiquidCapital =
    num(raw.minimum_liquid_capital) ?? num(raw.minimumLiquidCapital);
  const minimumNetWorth = num(raw.minimum_net_worth) ?? num(raw.minimumNetWorth);
  const expectedRoiPercentage =
    num(raw.expected_roi_percentage) ?? num(raw.expectedRoiPercentage);
  const averageUnitRevenue =
    num(raw.average_unit_revenue) ?? num(raw.averageUnitRevenue);
  const averageUnitProfit =
    num(raw.average_unit_profit) ?? num(raw.averageUnitProfit);

  return {
    id: String(raw.id),
    slug: str(raw.slug),
    franchisorId,
    owner_id: franchisorId,
    franchisor_id: franchisorId,
    brandName,
    brand_name: brandName,
    industry: str(raw.industry) || '',
    tagline: str(raw.tagline),
    description: str(raw.description) || '',
    brandStory: str(raw.brand_story) || str(raw.brandStory),
    brand_story: str(raw.brand_story) || str(raw.brandStory),
    logo,
    logo_url: logo,
    images: raw.images as Franchise['images'],
    investmentMin,
    investmentMax,
    total_investment_min: investmentMin,
    total_investment_max: investmentMax,
    franchiseFee,
    franchise_fee: franchiseFee,
    royaltyPercentage,
    royalty_percentage: royaltyPercentage,
    marketingFeePercentage,
    marketing_fee_percentage: marketingFeePercentage,
    outlets,
    total_outlets: outlets,
    spaceRequiredSqft,
    space_required_sqft: spaceRequiredSqft,
    minimumLiquidCapital,
    minimum_liquid_capital: minimumLiquidCapital,
    minimumNetWorth,
    minimum_net_worth: minimumNetWorth,
    experienceRequired: str(raw.experience_required) || str(raw.experienceRequired),
    experience_required: str(raw.experience_required) || str(raw.experienceRequired),
    trainingProvided: raw.training_provided === true || raw.trainingProvided === true,
    training_provided: raw.training_provided === true || raw.trainingProvided === true,
    trainingDurationDays:
      num(raw.training_duration_days) ?? num(raw.trainingDurationDays),
    training_duration_days:
      num(raw.training_duration_days) ?? num(raw.trainingDurationDays),
    marketingSupport: raw.marketing_support === true || raw.marketingSupport === true,
    marketing_support: raw.marketing_support === true || raw.marketingSupport === true,
    supportProvided: strArray(raw.support_provided),
    support_provided: strArray(raw.support_provided),
    headquartersCity: str(raw.headquarters_city) || str(raw.headquartersCity),
    headquarters_city: str(raw.headquarters_city) || str(raw.headquartersCity),
    headquartersState: str(raw.headquarters_state) || str(raw.headquartersState),
    headquarters_state: str(raw.headquarters_state) || str(raw.headquartersState),
    headquartersCountry: str(raw.headquarters_country) || str(raw.headquartersCountry) || 'India',
    headquarters_country: str(raw.headquarters_country) || str(raw.headquartersCountry) || 'India',
    expansionTerritories: raw.expansion_territories as Franchise['expansionTerritories'],
    expansion_territories: raw.expansion_territories as Franchise['expansion_territories'],
    operatingLocations: raw.operating_locations as Franchise['operatingLocations'],
    operating_locations: raw.operating_locations as Franchise['operatingLocations'],
    territoryAvailability: raw.territory_availability as Franchise['territoryAvailability'],
    territory_availability: raw.territory_availability as Franchise['territoryAvailability'],
    expectedRoiPercentage,
    expected_roi_percentage: expectedRoiPercentage,
    averageUnitRevenue,
    average_unit_revenue: averageUnitRevenue,
    averageUnitProfit,
    average_unit_profit: averageUnitProfit,
    paybackPeriodMonths: num(raw.payback_period_months) ?? num(raw.paybackPeriodMonths),
    payback_period_months: num(raw.payback_period_months) ?? num(raw.paybackPeriodMonths),
    establishedYear,
    established_year: establishedYear,
    highlights,
    competitiveEdge: highlights,
    badges: strArray(
      Array.isArray(raw.badges) && (raw.badges as unknown[]).length
        ? raw.badges
        : raw.awards
    ),
    featured: raw.featured === true,
    trending: raw.trending === true,
    verified: raw.verified === true,
    status: str(raw.status),
    verificationStatus: str(raw.verification_status) as Franchise['verification_status'],
    verification_status: str(raw.verification_status) as Franchise['verification_status'],
    verificationTier: str(raw.verification_tier),
    verification_tier: str(raw.verification_tier),
    verifiedAt: str(raw.verified_at),
    verified_at: str(raw.verified_at),
    viewsCount: num(raw.views_count) ?? 0,
    views_count: num(raw.views_count) ?? 0,
    inquiriesCount: num(raw.inquiries_count) ?? 0,
    inquiries_count: num(raw.inquiries_count) ?? 0,
    applicationsCount: num(raw.applications_count) ?? 0,
    applications_count: num(raw.applications_count) ?? 0,
    createdAt: str(raw.created_at),
    created_at: str(raw.created_at),
    publishedAt: str(raw.published_at),
    published_at: str(raw.published_at),
    storeFormats: normalizeStoreFormats(raw.store_formats ?? raw.storeFormats),
    store_formats: normalizeStoreFormats(raw.store_formats ?? raw.storeFormats),
    property_type: str(raw.property_type),
    min_area_sqft: num(raw.min_area_sqft),
    max_area_sqft: num(raw.max_area_sqft),
    owner_operator_required: raw.owner_operator_required === true,
    opening_timeline: str(raw.opening_timeline),
    preferred_cities: strArray(raw.preferred_cities),
    preferred_experience: str(raw.preferred_experience),
    ground_floor: raw.ground_floor === true ? true : raw.ground_floor === false ? false : undefined,
    parking_required: raw.parking_required === true ? true : raw.parking_required === false ? false : undefined,
    max_rent: num(raw.max_rent),
    frontage_ft: num(raw.frontage_ft),
    contactEmail: str(raw.contact_email),
    contact_email: str(raw.contact_email),
    contactPhone: str(raw.contact_phone),
    contact_phone: str(raw.contact_phone),
    website: sanitizePublicWebsite(str(raw.website)),
    documents: Array.isArray(raw.documents) ? raw.documents : [],
  } as Franchise;
}

export function mapFranchisesFromDb(rows: FranchiseDbRow[]): Franchise[] {
  return rows.map(mapFranchiseFromDb);
}

/** @deprecated Use mapFranchiseFromDb */
export const normalizeFranchise = mapFranchiseFromDb;

/** @deprecated Use mapFranchisesFromDb */
export const normalizeFranchiseList = mapFranchisesFromDb;
