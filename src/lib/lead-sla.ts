import type { FranchiseInquiry, InquiryStatus } from '@/types/franchise-domain';

export type LeadSlaSnapshot = {
  unanswered: number;
  viewed: number;
  contacted: number;
  meeting: number;
  application: number;
  agreement: number;
  opened: number;
  contactRate: number;
  meetingRate: number;
  applicationRate: number;
  agreementRate: number;
  openingRate: number;
  medianFirstResponseHours: number | null;
};

function hoursBetween(from?: string | null, to?: string | null): number | null {
  if (!from || !to) return null;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  return (b - a) / (3600 * 1000);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function isUnanswered(lead: FranchiseInquiry): boolean {
  return lead.status === 'new' && !lead.firstViewedAt;
}

export function operationalStage(lead: FranchiseInquiry): string {
  if (lead.status === 'opened' || lead.status === 'converted') return 'opened';
  if (lead.status === 'agreement') return 'agreement';
  if (lead.status === 'application' || lead.linkedApplicationId) return 'application';
  if (lead.status === 'meeting') return 'meeting';
  if (lead.status === 'contacted' || lead.status === 'qualified' || lead.status === 'information_sent') {
    return 'contacted';
  }
  if (lead.firstViewedAt) return 'viewed';
  return 'unanswered';
}

export function computeLeadSla(leads: FranchiseInquiry[]): LeadSlaSnapshot {
  const total = leads.length || 1;
  const unanswered = leads.filter(isUnanswered).length;
  const viewed = leads.filter((l) => Boolean(l.firstViewedAt)).length;
  const contacted = leads.filter((l) =>
    ['contacted', 'qualified', 'information_sent', 'meeting', 'application', 'negotiation', 'agreement', 'opened', 'converted'].includes(l.status)
  ).length;
  const meeting = leads.filter((l) =>
    ['meeting', 'application', 'negotiation', 'agreement', 'opened', 'converted'].includes(l.status) || Boolean(l.meetingAt)
  ).length;
  const application = leads.filter((l) =>
    ['application', 'negotiation', 'agreement', 'opened', 'converted'].includes(l.status) || Boolean(l.linkedApplicationId)
  ).length;
  const agreement = leads.filter((l) => ['agreement', 'opened', 'converted'].includes(l.status)).length;
  const opened = leads.filter((l) => ['opened', 'converted'].includes(l.status)).length;

  const responseHours = leads
    .map((l) => hoursBetween(l.createdAt, l.firstRespondedAt || (l.status !== 'new' ? l.updatedAt : null)))
    .filter((n): n is number => n != null);

  return {
    unanswered,
    viewed,
    contacted,
    meeting,
    application,
    agreement,
    opened,
    contactRate: Math.round((contacted / total) * 100),
    meetingRate: Math.round((meeting / total) * 100),
    applicationRate: Math.round((application / total) * 100),
    agreementRate: Math.round((agreement / total) * 100),
    openingRate: Math.round((opened / total) * 100),
    medianFirstResponseHours: median(responseHours),
  };
}

export function leadSlaEvents(lead: FranchiseInquiry): { label: string; at: string | null }[] {
  return [
    { label: 'Lead created', at: lead.createdAt },
    { label: 'Franchisor notified', at: lead.notifiedAt || lead.createdAt },
    { label: 'First viewed', at: lead.firstViewedAt || null },
    { label: 'First response', at: lead.firstRespondedAt || null },
    { label: 'Meeting', at: lead.meetingAt || null },
  ];
}

export function formatResponseHours(hours: number | null): string {
  if (hours == null) return 'No responses yet';
  if (hours < 1) return `${Math.round(hours * 60)} min median`;
  if (hours < 48) return `${hours.toFixed(1)} h median`;
  return `${(hours / 24).toFixed(1)} d median`;
}

export const SLA_STAGE_LABELS: Record<string, string> = {
  unanswered: 'Unanswered',
  viewed: 'Viewed',
  contacted: 'Contacted',
  meeting: 'Meeting',
  application: 'Application',
  agreement: 'Agreement',
  opened: 'Opened',
};

export function nextSlaStatus(current: InquiryStatus): InquiryStatus {
  const order: InquiryStatus[] = [
    'new',
    'contacted',
    'meeting',
    'application',
    'agreement',
    'opened',
  ];
  const idx = order.indexOf(current);
  if (idx < 0 || idx === order.length - 1) return current;
  return order[idx + 1];
}
