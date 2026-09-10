import type { Franchise } from "@/types/listings";
import {
  getFranchiseInvestmentRange,
  getStoreFormatsFromFranchise,
} from "@/lib/store-formats";

export type CityTier = "tier1" | "tier2";

const TIER = {
  tier1: { revenue: 1.12, opex: 1.22, payback: 1.18 },
  tier2: { revenue: 1, opex: 1, payback: 1 },
} as const;

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function listingSpaceRange(franchise: Franchise): { min: number; max: number } | null {
  const formats = getStoreFormatsFromFranchise(franchise);
  const mins = formats.map((f) => f.minSqft).filter((n) => n > 0);
  const maxs = formats.map((f) => f.maxSqft || f.minSqft).filter((n) => n > 0);
  const listingMin = num(franchise.min_area_sqft) ?? num(franchise.space_required_sqft);
  const listingMax = num(franchise.max_area_sqft) ?? listingMin;
  if (!mins.length && listingMin == null) return null;
  return {
    min: mins.length ? Math.min(...mins) : listingMin!,
    max: maxs.length ? Math.max(...maxs) : listingMax ?? listingMin!,
  };
}

function interpolate(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
  return y0 + t * (y1 - y0);
}

export type FranchiseEconomics = {
  investment: number | null;
  monthlyGross: number | null;
  monthlyNet: number | null;
  paybackMonths: number | null;
  workingCapital: number | null;
  royalty: number | null;
};

export function estimateFranchiseEconomics(
  franchise: Franchise,
  spaceSqft: number | null,
  tier: CityTier
): FranchiseEconomics {
  const formats = getStoreFormatsFromFranchise(franchise);
  const range = getFranchiseInvestmentRange(franchise);
  const space = listingSpaceRange(franchise);
  let investment = range.min ?? range.max ?? null;

  if (spaceSqft != null && space && range.min != null && range.max != null) {
    investment = interpolate(spaceSqft, space.min, space.max, range.min, range.max);
  } else if (spaceSqft != null && formats.length) {
    const pts = formats
      .map((fmt) => ({
        sq: fmt.minSqft || fmt.maxSqft,
        inv: fmt.investmentMin ?? fmt.investmentMax,
      }))
      .filter((p) => p.sq > 0 && p.inv != null) as { sq: number; inv: number }[];
    pts.sort((a, b) => a.sq - b.sq);
    if (pts.length >= 2) {
      const hi = pts.find((p) => p.sq >= spaceSqft) ?? pts[pts.length - 1];
      const lo = [...pts].reverse().find((p) => p.sq <= spaceSqft) ?? pts[0];
      investment = interpolate(spaceSqft, lo.sq, hi.sq, lo.inv, hi.inv);
    } else if (pts.length === 1) {
      investment = pts[0].inv;
    }
  }

  const multiplier = TIER[tier];
  const annualRev = num(franchise.average_unit_revenue) ?? num(franchise.averageUnitRevenue);
  const annualProfit =
    num((franchise as { average_unit_profit?: number }).average_unit_profit) ??
    num((franchise as { averageUnitProfit?: number }).averageUnitProfit);
  const royalty = num(franchise.royalty_percentage) ?? num(franchise.royaltyPercentage);
  const listingPayback = num(franchise.payback_period_months) ?? num(franchise.paybackPeriodMonths);
  const listingLiquid = num(franchise.minimum_liquid_capital) ?? num(franchise.minimumLiquidCapital);
  const expectedRoi = num(franchise.expected_roi_percentage) ?? num(franchise.expectedRoiPercentage);

  const monthlyGross = annualRev != null ? (annualRev / 12) * multiplier.revenue : null;

  let monthlyNet: number | null = null;
  if (annualProfit != null) {
    monthlyNet = (annualProfit / 12) * (multiplier.revenue / multiplier.opex);
  } else if (investment != null && expectedRoi != null) {
    monthlyNet = ((investment * expectedRoi) / 100 / 12) * (multiplier.revenue / multiplier.opex);
  }

  let paybackMonths: number | null = null;
  if (listingPayback != null) {
    paybackMonths = Math.round(listingPayback * multiplier.payback);
  } else if (investment != null && monthlyNet != null && monthlyNet > 0) {
    paybackMonths = Math.round(investment / monthlyNet);
  }

  let workingCapital: number | null = listingLiquid;
  if (workingCapital != null && spaceSqft != null && space) {
    const mid = (space.min + space.max) / 2 || space.min;
    if (mid > 0) workingCapital = workingCapital * (spaceSqft / mid) * multiplier.opex;
  } else if (workingCapital != null) {
    workingCapital = workingCapital * multiplier.opex;
  } else if (monthlyGross != null && monthlyNet != null && monthlyGross > monthlyNet) {
    workingCapital = (monthlyGross - monthlyNet) * 3 * multiplier.opex;
  }

  return {
    investment,
    monthlyGross,
    monthlyNet,
    paybackMonths,
    workingCapital,
    royalty,
  };
}

export function netMarginPct(monthlyGross: number | null, monthlyNet: number | null): number | null {
  if (monthlyGross == null || monthlyNet == null || monthlyGross <= 0) return null;
  return (monthlyNet / monthlyGross) * 100;
}
