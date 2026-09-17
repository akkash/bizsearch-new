const ENQUIRY_KEY = 'bizsearch_enquiry_draft';
const MATCH_KEY = 'bizsearch_match_draft';

export type EnquiryDraftForm = {
  name: string;
  email: string;
  phone: string;
  investmentCapacity: string;
  preferredLocation: string;
  openingTimeline: string;
  fundsAvailable: string;
  relevantExperience: string;
  message: string;
  acceptNDA: boolean;
};

export type EnquiryDraft = {
  listingId: string;
  listingType: 'business' | 'franchise';
  listingName: string;
  form: EnquiryDraftForm;
  selectedFormatId: string | null;
  score?: number;
};

export type MatchDraft = {
  budgetMin?: number;
  budgetMax?: number;
  industries?: string[];
  preferredLocations?: string[];
  liquidCapital?: number;
  netWorth?: number;
  managementExperience?: number;
  timeCommitment?: string;
  spaceAvailable?: number;
  franchiseExperience?: string;
  enquireFranchiseId?: string;
};

function readJson<T>(key: string): T | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function saveEnquiryDraft(draft: EnquiryDraft) {
  writeJson(ENQUIRY_KEY, draft);
}

export function readEnquiryDraft(listingId?: string): EnquiryDraft | null {
  const draft = readJson<EnquiryDraft>(ENQUIRY_KEY);
  if (!draft) return null;
  if (listingId && draft.listingId !== listingId) return null;
  return draft;
}

export function clearEnquiryDraft() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(ENQUIRY_KEY);
}

export function saveMatchDraft(draft: MatchDraft) {
  writeJson(MATCH_KEY, draft);
}

export function readMatchDraft(): MatchDraft | null {
  return readJson<MatchDraft>(MATCH_KEY);
}

export function clearMatchDraft() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(MATCH_KEY);
}
