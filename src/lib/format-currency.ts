/**
 * Format INR amounts for marketplace financial display.
 * Compact: ₹68L, ₹2.1Cr — scannable in under 3 seconds.
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export const formatINRPrecise = formatINR;
