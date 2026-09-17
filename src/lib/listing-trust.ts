/** Platform verification is only `verification_status === 'verified'`. */

export function isPlatformVerified(entity: {
  verification_status?: string | null;
  verificationStatus?: string | null;
}): boolean {
  const status = entity.verification_status || entity.verificationStatus;
  return status === 'verified';
}

/** Unit economics needed before ROI/break-even can be shown as numbers. */
export function hasUnitEconomics(entity: {
  average_unit_revenue?: number | null;
  averageUnitRevenue?: number | null;
  average_unit_profit?: number | null;
  averageUnitProfit?: number | null;
}): boolean {
  const revenue = Number(entity.average_unit_revenue ?? entity.averageUnitRevenue);
  const profit = Number(entity.average_unit_profit ?? entity.averageUnitProfit);
  return (Number.isFinite(revenue) && revenue > 0) || (Number.isFinite(profit) && profit > 0);
}

export function mappedTerritoryCount(entity: {
  territories?: unknown;
  territory_availability?: unknown;
  territoryAvailability?: unknown;
}): number {
  const raw = entity.territories ?? entity.territory_availability ?? entity.territoryAvailability;
  if (!Array.isArray(raw)) return 0;
  return raw.filter((row) => row && (typeof row === 'object' || typeof row === 'string')).length;
}
