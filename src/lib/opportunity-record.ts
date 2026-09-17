export type FieldSource = 'franchisor' | 'document' | 'platform';
export type FieldVerification = 'unreviewed' | 'document_reviewed' | 'platform_verified';

export type FieldProvenance = {
  source: FieldSource;
  verification: FieldVerification;
  verifiedAt?: string | null;
  nextReviewAt?: string | null;
  note?: string | null;
};

export type OpportunityCheck = {
  id: string;
  group: 'identity' | 'investment' | 'economics' | 'territory' | 'operations' | 'verification';
  label: string;
  requiredForVerified: boolean;
  present: boolean;
};

export type OpportunityRecord = {
  readyForPlatformVerification: boolean;
  score: number;
  missingRequired: string[];
  checks: OpportunityCheck[];
};

function present(value: unknown): boolean {
  if (value == null || value === '') return false;
  if (typeof value === 'number') return Number.isFinite(value) && value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return Boolean(value);
}

function territoryCount(row: Record<string, unknown>, mappedTerritories?: number): number {
  const availability = row.territory_availability ?? row.territoryAvailability ?? row.territories;
  const fromJson = Array.isArray(availability) ? availability.length : 0;
  const count = Number(row.available_territories_count ?? row.availableTerritoriesCount);
  const fromCount = Number.isFinite(count) ? count : 0;
  return Math.max(fromJson, fromCount, mappedTerritories ?? 0);
}

/** Minimum Verified Franchise Opportunity Record. */
export function evaluateOpportunityRecord(
  row: Record<string, unknown>,
  extras?: { mappedTerritories?: number; documentCount?: number }
): OpportunityRecord {
  const cities = row.preferred_cities;
  const formats = row.store_formats ?? row.storeFormats;
  const docs = extras?.documentCount ?? (Array.isArray(row.documents) ? row.documents.length : 0);
  const territories = territoryCount(row, extras?.mappedTerritories);

  const checks: OpportunityCheck[] = [
    { id: 'brand_name', group: 'identity', label: 'Brand name', requiredForVerified: true, present: present(row.brand_name || row.brandName) },
    { id: 'website', group: 'identity', label: 'Website', requiredForVerified: false, present: present(row.website) },
    { id: 'industry', group: 'identity', label: 'Industry', requiredForVerified: true, present: present(row.industry) },
    { id: 'description', group: 'identity', label: 'Brand description', requiredForVerified: true, present: String(row.description || '').trim().length >= 40 },
    { id: 'franchise_fee', group: 'investment', label: 'Franchise fee', requiredForVerified: true, present: present(row.franchise_fee ?? row.franchiseFee) },
    { id: 'total_investment', group: 'investment', label: 'Total investment range', requiredForVerified: true, present: present(row.total_investment_min ?? row.investmentMin) && present(row.total_investment_max ?? row.investmentMax) },
    { id: 'working_capital', group: 'investment', label: 'Working capital / liquid capital', requiredForVerified: true, present: present(row.working_capital ?? row.workingCapital ?? row.minimum_liquid_capital ?? row.minimumLiquidCapital) },
    { id: 'royalty', group: 'investment', label: 'Royalty', requiredForVerified: true, present: present(row.royalty_percentage ?? row.royaltyPercentage) },
    { id: 'unit_revenue', group: 'economics', label: 'Expected unit revenue', requiredForVerified: true, present: present(row.average_unit_revenue ?? row.averageUnitRevenue) },
    { id: 'unit_profit', group: 'economics', label: 'Operating profit / margin', requiredForVerified: false, present: present(row.average_unit_profit ?? row.averageUnitProfit) },
    { id: 'breakeven', group: 'economics', label: 'Break-even / payback', requiredForVerified: false, present: present(row.breakeven_period ?? row.payback_period_months) },
    { id: 'territory_rows', group: 'territory', label: 'City-level territory rows', requiredForVerified: true, present: territories > 0 },
    { id: 'preferred_cities', group: 'territory', label: 'Preferred / expansion cities', requiredForVerified: false, present: present(cities) },
    { id: 'store_format', group: 'operations', label: 'Store format + area', requiredForVerified: true, present: present(formats) || present(row.min_area_sqft) },
    { id: 'training', group: 'operations', label: 'Training', requiredForVerified: false, present: present(row.training_provided) || present(row.training_duration_days) },
    { id: 'support', group: 'operations', label: 'Support', requiredForVerified: false, present: present(row.support_provided) },
    { id: 'documents', group: 'verification', label: 'Supporting documents', requiredForVerified: true, present: docs > 0 },
  ];

  const required = checks.filter((c) => c.requiredForVerified);
  const missingRequired = required.filter((c) => !c.present).map((c) => c.label);
  const filled = checks.filter((c) => c.present).length;
  const score = Math.round((filled / checks.length) * 100);

  return {
    readyForPlatformVerification: missingRequired.length === 0,
    score,
    missingRequired,
    checks,
  };
}

export function defaultProvenance(verified: boolean): FieldProvenance {
  if (verified) {
    return {
      source: 'platform',
      verification: 'platform_verified',
    };
  }
  return {
    source: 'franchisor',
    verification: 'unreviewed',
  };
}

export function provenanceLabel(p?: FieldProvenance | null, platformVerified = false): string {
  const prov = p || defaultProvenance(platformVerified);
  const source =
    prov.source === 'document' ? 'Document' : prov.source === 'platform' ? 'BizSearch' : 'Franchisor submitted';
  const verification =
    prov.verification === 'platform_verified'
      ? 'Platform verified'
      : prov.verification === 'document_reviewed'
        ? 'Document reviewed'
        : 'Not reviewed';
  const when = prov.verifiedAt ? ` · ${prov.verifiedAt.slice(0, 10)}` : '';
  const next = prov.nextReviewAt ? ` · next review ${prov.nextReviewAt.slice(0, 10)}` : '';
  return `${source} · ${verification}${when}${next}`;
}

export function fieldProvenanceNote(
  row: Record<string, unknown>,
  field: string,
  platformVerified = false
): string {
  const bag = (row.field_provenance || row.fieldProvenance || {}) as Record<string, FieldProvenance>;
  const verifiedAt = (row.verified_at || row.verifiedAt) as string | undefined;
  const nextReview = (row.verification_next_review_at || row.verificationNextReviewAt) as string | undefined;
  const existing = bag[field];
  return provenanceLabel(
    {
      ...(existing || defaultProvenance(platformVerified)),
      verifiedAt: existing?.verifiedAt || (platformVerified ? verifiedAt || null : null),
      nextReviewAt: existing?.nextReviewAt || (platformVerified ? nextReview || null : null),
    },
    platformVerified
  );
}

export function stampPlatformProvenance(
  existing: Record<string, FieldProvenance> | undefined,
  now: string,
  nextReviewAt: string
): Record<string, FieldProvenance> {
  const keys = [
    'franchise_fee',
    'total_investment',
    'working_capital',
    'royalty',
    'unit_revenue',
    'territory',
  ];
  const next = { ...(existing || {}) };
  for (const key of keys) {
    next[key] = {
      source: 'platform',
      verification: 'platform_verified',
      verifiedAt: now,
      nextReviewAt,
    };
  }
  return next;
}

export function franchisorFieldProvenance(fields: string[]): Record<string, FieldProvenance> {
  return Object.fromEntries(fields.map((field) => [field, defaultProvenance(false)]));
}
