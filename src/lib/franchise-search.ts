import { FRANCHISE_CATEGORIES } from "@/data/categories";

export type FranchiseSearchIntent = {
  industrySlug?: string;
  city?: string;
  /** Buyer liquid capital ceiling in rupees */
  budget?: number;
  q?: string;
};

export function uniqueFranchiseCategories() {
  const seen = new Set<string>();
  return FRANCHISE_CATEGORIES.filter((cat) => {
    if (seen.has(cat.slug)) return false;
    seen.add(cat.slug);
    return true;
  });
}

export function buildFranchiseSearchPath(intent: FranchiseSearchIntent): string {
  const params = new URLSearchParams();
  if (intent.industrySlug) params.set("industry", intent.industrySlug);
  if (intent.city?.trim()) params.set("city", intent.city.trim());
  if (intent.budget && intent.budget > 0) params.set("budget", String(Math.round(intent.budget)));
  if (intent.q?.trim()) params.set("q", intent.q.trim());
  const qs = params.toString();
  return qs ? `/franchises?${qs}` : "/franchises";
}

export function franchiseMatchesCity(franchise: {
  headquarters_city?: string;
  headquartersCity?: string;
  headquarters_state?: string;
  headquartersState?: string;
  preferred_cities?: unknown;
  territories?: unknown;
  expansion_territories?: unknown;
  operating_locations?: unknown;
}, city: string): boolean {
  const needle = city.trim().toLowerCase();
  if (!needle) return true;
  const blobs: string[] = [];
  const push = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((item) => blobs.push(String(item)));
      return;
    }
    blobs.push(String(value));
  };
  push(franchise.headquarters_city);
  push(franchise.headquartersCity);
  push(franchise.headquarters_state);
  push(franchise.headquartersState);
  push(franchise.preferred_cities);
  push(franchise.territories);
  push(franchise.expansion_territories);
  push(franchise.operating_locations);
  return blobs.some((item) => item.toLowerCase().includes(needle));
}
