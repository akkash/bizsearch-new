import type { LeadQualification } from '@/types/franchise-domain';

export interface QualificationScore {
  score: number;
  notes: Record<string, boolean | string>;
}

const INVESTMENT_POINTS: Record<string, number> = {
  above_1cr: 20,
  '50l_1cr': 16,
  '25l_50l': 12,
  '10l_25l': 8,
  below_10l: 4,
};

const TIMELINE_POINTS: Record<string, number> = {
  immediate: 20,
  '1_3_months': 16,
  '3_6_months': 12,
  '6_12_months': 8,
  exploring: 4,
};

const FUNDS_POINTS: Record<string, number> = {
  yes_ready: 20,
  partial: 12,
  raising: 8,
  not_yet: 4,
};

const EXPERIENCE_POINTS: Record<string, number> = {
  owner_operator: 20,
  management: 16,
  industry: 12,
  first_time: 8,
};

/** Score the five franchise enquire qualification fields. Max 100. */
export function scoreLeadQualification(
  qualification: Partial<LeadQualification> | null | undefined
): QualificationScore {
  const q = qualification || {};
  const notes: Record<string, boolean | string> = {};
  let score = 0;

  const investment = q.investmentCapacity || '';
  if (investment) {
    const points = INVESTMENT_POINTS[investment] ?? 6;
    score += points;
    notes.has_investment_capacity = true;
    notes.investment_capacity = investment;
  }

  const location = (q.preferredLocation || '').trim();
  if (location.length >= 2) {
    score += 20;
    notes.has_preferred_location = true;
  }

  const timeline = q.openingTimeline || '';
  if (timeline) {
    const points = TIMELINE_POINTS[timeline] ?? 6;
    score += points;
    notes.has_opening_timeline = true;
    notes.opening_timeline = timeline;
  }

  const funds = q.fundsAvailable || '';
  if (funds) {
    const points = FUNDS_POINTS[funds] ?? 6;
    score += points;
    notes.has_funds_available = true;
    notes.funds_available = funds;
  }

  const experience = q.relevantExperience || '';
  if (experience) {
    const points = EXPERIENCE_POINTS[experience] ?? 6;
    score += points;
    notes.has_relevant_experience = true;
    notes.relevant_experience = experience;
  }

  return {
    score: Math.min(100, Math.round(score)),
    notes,
  };
}
