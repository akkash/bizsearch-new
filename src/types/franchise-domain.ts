export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'information_sent'
  | 'meeting'
  | 'application'
  | 'negotiation'
  | 'agreement'
  | 'opened'
  | 'converted'
  | 'lost';

export type InquiryPriority = 'low' | 'medium' | 'high' | 'hot';

/** Five qualification questions captured on franchise enquire */
export interface LeadQualification {
  investmentCapacity: string;
  preferredLocation: string;
  openingTimeline: string;
  fundsAvailable: string;
  relevantExperience: string;
}

export interface FranchiseInquiry {
  id: string;
  senderId: string | null;
  recipientId: string;
  listingId: string;
  listingType: 'business' | 'franchise';
  subject: string | null;
  message: string;
  contactEmail: string;
  contactPhone: string | null;
  status: InquiryStatus;
  priority: InquiryPriority;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
  listingName?: string;
  investmentCapacity?: string | null;
  preferredLocation?: string | null;
  openingTimeline?: string | null;
  fundsAvailable?: string | null;
  relevantExperience?: string | null;
  matchScore?: number | null;
  linkedApplicationId?: string | null;
  selectedStoreFormatId?: string | null;
  selectedStoreFormatName?: string | null;
  selectedStoreFormatSnapshot?: Record<string, unknown> | null;
  conversationId?: string | null;
  meetingAt?: string | null;
  meetingNotes?: string | null;
  sender?: {
    displayName: string;
    email: string;
    avatarUrl: string | null;
  };
}

/** Franchisor pipeline stages (product language) */
export const PIPELINE_STATUS_ORDER: InquiryStatus[] = [
  'new',
  'qualified',
  'contacted',
  'meeting',
  'application',
  'negotiation',
  'agreement',
  'opened',
  'lost',
];

export const FRANCHISEE_INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'Sent',
  contacted: 'Brand viewed',
  qualified: 'Qualified',
  information_sent: 'Information sent',
  meeting: 'Meeting',
  application: 'Application',
  negotiation: 'Approved',
  agreement: 'Agreement',
  opened: 'Opened',
  converted: 'Converted',
  lost: 'Closed',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  information_sent: 'Information Sent',
  meeting: 'Meeting',
  application: 'Application',
  negotiation: 'Approved',
  agreement: 'Agreement',
  opened: 'Opened',
  converted: 'Converted',
  lost: 'Lost',
};

/** Full order including legacy statuses */
export const INQUIRY_STATUS_ORDER: InquiryStatus[] = [
  'new',
  'qualified',
  'contacted',
  'information_sent',
  'meeting',
  'application',
  'negotiation',
  'agreement',
  'opened',
  'converted',
  'lost',
];

export const INVESTMENT_CAPACITY_OPTIONS = [
  { value: 'below_10l', label: 'Below ₹10L' },
  { value: '10l_25l', label: '₹10–25L' },
  { value: '25l_50l', label: '₹25–50L' },
  { value: '50l_1cr', label: '₹50L–1Cr' },
  { value: 'above_1cr', label: 'Above ₹1Cr' },
] as const;

export const OPENING_TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: '6_12_months', label: '6–12 months' },
  { value: 'exploring', label: 'Just exploring' },
] as const;

export const FUNDS_AVAILABLE_OPTIONS = [
  { value: 'yes_ready', label: 'Yes — funds ready' },
  { value: 'partial', label: 'Partial — need financing' },
  { value: 'raising', label: 'Raising capital' },
  { value: 'not_yet', label: 'Not yet' },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: 'owner_operator', label: 'Owned/operated a business' },
  { value: 'management', label: 'Management experience' },
  { value: 'industry', label: 'Same industry experience' },
  { value: 'first_time', label: 'First-time entrepreneur' },
] as const;

export function labelForOption(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return 'Not provided';
  return options.find((o) => o.value === value)?.label || value;
}
