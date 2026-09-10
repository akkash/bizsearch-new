import { supabase } from './supabase';
import type { FranchiseeProfile } from './ai-franchisee-matcher-service';

export type FranchiseeIntent = {
  profileId: string;
  investmentBudgetMin: number | null;
  investmentBudgetMax: number | null;
  preferredIndustries: string[];
  preferredTerritories: string[];
  preferredCities: string[];
  preferredFormats: string[];
  businessExperience: string | null;
  franchiseExperience: string | null;
  industryExperience: string | null;
  timeline: string | null;
  fundingMethod: string | null;
  ownerOperated: boolean | null;
  propertyRequired: boolean | null;
  preferredPropertyType: string | null;
  spaceAvailable: number | null;
  liquidCapital: number | null;
  netWorth: number | null;
  timeCommitment: FranchiseeProfile['timeCommitment'] | null;
  managementExperienceYears: number | null;
  status: string | null;
};

export type FranchiseeIntentInput = {
  investmentBudgetMin?: number | null;
  investmentBudgetMax?: number | null;
  preferredIndustries?: string[];
  preferredTerritories?: string[];
  preferredCities?: string[];
  preferredFormats?: string[];
  businessExperience?: string | null;
  franchiseExperience?: string | null;
  industryExperience?: string | null;
  timeline?: string | null;
  fundingMethod?: string | null;
  ownerOperated?: boolean | null;
  propertyRequired?: boolean | null;
  preferredPropertyType?: string | null;
  spaceAvailable?: number | null;
  liquidCapital?: number | null;
  netWorth?: number | null;
  timeCommitment?: FranchiseeProfile['timeCommitment'] | null;
  managementExperienceYears?: number | null;
  status?: string | null;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function num(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapRow(row: Record<string, unknown>): FranchiseeIntent {
  return {
    profileId: String(row.profile_id),
    investmentBudgetMin: num(row.investment_budget_min),
    investmentBudgetMax: num(row.investment_budget_max),
    preferredIndustries: asStringArray(row.preferred_industries),
    preferredTerritories: asStringArray(row.preferred_territories),
    preferredCities: asStringArray(row.preferred_cities),
    preferredFormats: asStringArray(row.preferred_formats),
    businessExperience: row.business_experience ? String(row.business_experience) : null,
    franchiseExperience: row.franchise_experience ? String(row.franchise_experience) : null,
    industryExperience: row.industry_experience ? String(row.industry_experience) : null,
    timeline: row.timeline ? String(row.timeline) : null,
    fundingMethod: row.funding_method ? String(row.funding_method) : null,
    ownerOperated:
      typeof row.owner_operated === 'boolean' ? row.owner_operated : null,
    propertyRequired:
      typeof row.property_required === 'boolean' ? row.property_required : null,
    preferredPropertyType: row.preferred_property_type
      ? String(row.preferred_property_type)
      : null,
    spaceAvailable: num(row.space_available),
    liquidCapital: num(row.liquid_capital),
    netWorth: num(row.net_worth),
    timeCommitment: (row.time_commitment as FranchiseeProfile['timeCommitment']) || null,
    managementExperienceYears: num(row.management_experience_years),
    status: row.status ? String(row.status) : null,
  };
}

function toDbRow(profileId: string, input: FranchiseeIntentInput): Record<string, unknown> {
  const row: Record<string, unknown> = {
    profile_id: profileId,
    updated_at: new Date().toISOString(),
    status: input.status ?? 'active',
  };

  if (input.investmentBudgetMin != null) row.investment_budget_min = input.investmentBudgetMin;
  if (input.investmentBudgetMax != null) row.investment_budget_max = input.investmentBudgetMax;
  if (input.preferredIndustries) row.preferred_industries = input.preferredIndustries;
  if (input.preferredTerritories) row.preferred_territories = input.preferredTerritories;
  if (input.preferredCities) row.preferred_cities = input.preferredCities;
  if (input.preferredFormats) row.preferred_formats = input.preferredFormats;
  if (input.businessExperience != null) row.business_experience = input.businessExperience;
  if (input.franchiseExperience != null) row.franchise_experience = input.franchiseExperience;
  if (input.industryExperience != null) row.industry_experience = input.industryExperience;
  if (input.timeline != null) row.timeline = input.timeline;
  if (input.fundingMethod != null) row.funding_method = input.fundingMethod;
  if (input.ownerOperated != null) row.owner_operated = input.ownerOperated;
  if (input.propertyRequired != null) row.property_required = input.propertyRequired;
  if (input.preferredPropertyType != null) {
    row.preferred_property_type = input.preferredPropertyType;
  }
  if (input.spaceAvailable != null) row.space_available = input.spaceAvailable;
  if (input.liquidCapital != null) row.liquid_capital = input.liquidCapital;
  if (input.netWorth != null) row.net_worth = input.netWorth;
  if (input.timeCommitment != null) row.time_commitment = input.timeCommitment;
  if (input.managementExperienceYears != null) {
    row.management_experience_years = input.managementExperienceYears;
  }

  return row;
}

const CORE_ONLY_KEYS = [
  'funding_method',
  'owner_operated',
  'preferred_formats',
  'property_required',
  'preferred_property_type',
  'space_available',
  'preferred_cities',
  'liquid_capital',
  'net_worth',
  'time_commitment',
  'management_experience_years',
];

export class FranchiseeIntentService {
  static async get(profileId: string): Promise<FranchiseeIntent | null> {
    const { data, error } = await supabase
      .from('franchisee_details')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load franchisee intent:', error);
      return null;
    }
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  }

  static async upsert(profileId: string, input: FranchiseeIntentInput): Promise<void> {
    const row = toDbRow(profileId, input);
    const { error } = await supabase.from('franchisee_details').upsert(row, {
      onConflict: 'profile_id',
    });

    if (
      error &&
      (error.code === 'PGRST204' ||
        CORE_ONLY_KEYS.some((key) => error.message?.includes(key)))
    ) {
      const fallback: Record<string, unknown> = {
        profile_id: profileId,
        updated_at: row.updated_at,
        investment_budget_min: row.investment_budget_min ?? null,
        investment_budget_max: row.investment_budget_max ?? null,
        preferred_industries: row.preferred_industries ?? null,
        preferred_territories: row.preferred_territories ?? null,
        business_experience: row.business_experience ?? null,
        franchise_experience: row.franchise_experience ?? null,
        industry_experience: row.industry_experience ?? null,
        timeline: row.timeline ?? null,
      };
      const retry = await supabase.from('franchisee_details').upsert(fallback, {
        onConflict: 'profile_id',
      });
      if (retry.error) throw retry.error;
      return;
    }

    if (error) throw error;
  }

  static toMatcherProfile(intent: FranchiseeIntent, userId: string): FranchiseeProfile {
    return {
      userId,
      budget: {
        min: intent.investmentBudgetMin ?? 0,
        max: intent.investmentBudgetMax ?? 0,
      },
      industries: intent.preferredIndustries,
      preferredLocations:
        intent.preferredCities.length > 0
          ? intent.preferredCities
          : intent.preferredTerritories,
      businessExperience: intent.businessExperience ? [intent.businessExperience] : undefined,
      franchiseExperience: intent.franchiseExperience || undefined,
      liquidCapital: intent.liquidCapital ?? undefined,
      netWorth: intent.netWorth ?? undefined,
      managementExperience: intent.managementExperienceYears ?? undefined,
      timeCommitment: intent.timeCommitment || 'full-time',
      spaceAvailable: intent.spaceAvailable ?? undefined,
    };
  }

  static fromMatcherProfile(profile: FranchiseeProfile): FranchiseeIntentInput {
    return {
      investmentBudgetMin: profile.budget?.min ?? null,
      investmentBudgetMax: profile.budget?.max ?? null,
      preferredIndustries: profile.industries || [],
      preferredCities: profile.preferredLocations || [],
      liquidCapital: profile.liquidCapital ?? null,
      netWorth: profile.netWorth ?? null,
      managementExperienceYears: profile.managementExperience ?? null,
      timeCommitment: profile.timeCommitment || 'full-time',
      ownerOperated: profile.timeCommitment === 'full-time',
      spaceAvailable: profile.spaceAvailable ?? null,
      status: 'active',
    };
  }
}
