export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'information_sent'
  | 'meeting'
  | 'application'
  | 'negotiation'
  | 'converted'
  | 'lost';

export type InquiryPriority = 'low' | 'medium' | 'high' | 'hot';

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
  sender?: {
    displayName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  information_sent: 'Information Sent',
  meeting: 'Meeting',
  application: 'Application',
  negotiation: 'Negotiation',
  converted: 'Converted',
  lost: 'Lost',
};

export const INQUIRY_STATUS_ORDER: InquiryStatus[] = [
  'new',
  'contacted',
  'qualified',
  'information_sent',
  'meeting',
  'application',
  'negotiation',
  'converted',
  'lost',
];
