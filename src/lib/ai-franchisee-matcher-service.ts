import { COMMAND_CODE_MATCH_MODEL, generateGeminiContent } from './gemini-proxy-client';
import { getListingRequirements } from './store-formats';
import { supabase } from './supabase';


export interface FranchiseeProfile {
  userId: string;
  name?: string;
  email?: string;
  budget?: { min: number; max: number };
  industries?: string[];
  preferredLocations?: string[];
  businessExperience?: string[];
  franchiseExperience?: string;
  managementExperience?: number; // years
  industryExperience?: number; // years
  educationLevel?: 'high-school' | 'bachelors' | 'masters' | 'phd';
  personalityTraits?: string[];
  investmentGoals?: string[];
  timeCommitment?: 'part-time' | 'full-time' | 'semi-absentee' | 'absentee';
  multiUnitInterest?: boolean;
  liquidCapital?: number;
  netWorth?: number;
  creditScore?: number;
  hasReferencesChecked?: boolean;
  spaceAvailable?: number;
}

export interface FranchiseOpportunity {
  franchiseId: string;
  brandName: string;
  industry: string;
  franchiseFee: number;
  totalInvestment: { min: number; max: number };
  royaltyPercentage: number;
  requiredExperience?: string;
  preferredExperience?: string;
  idealFranchiseeProfile?: string;
  supportProvided?: string[];
  trainingDuration?: number; // days
  territoriesAvailable?: string[];
  preferredCities?: string[];
  ownerOperatorRequired?: boolean;
  minAreaSqft?: number | null;
  maxAreaSqft?: number | null;
  propertyType?: string | null;
  minimumNetWorth?: number;
  minimumLiquidCapital?: number;
  multiUnitDiscount?: boolean;
  successRate?: number; // 0-100
  averageROI?: number;
}

export interface FranchiseeMatch {
  franchiseeId: string;
  franchise: FranchiseOpportunity;
  matchScore: number; // 0-100
  financialFitScore: number;
  experienceFitScore: number;
  personalityFitScore: number;
  commitmentFitScore: number;
  locationFitScore: number;
  successProbability: number; // 0-100
  matchLevel: 'Excellent Match' | 'Good Match' | 'Fair Match' | 'Poor Match';
  strengths: string[];
  concerns: string[];
  recommendation: string;
  expectedROI?: { year1: number; year3: number; year5: number };
  estimatedBreakEven?: number; // months
  scoredBy?: 'command-code' | 'rules';
}

function normalizeMatchText(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').trim();
}

function textsOverlap(left: string, right: string): boolean {
  const a = normalizeMatchText(left);
  const b = normalizeMatchText(right);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

function anyTextOverlap(left?: string[], right?: string[]): boolean {
  if (!left?.length || !right?.length) return false;
  return left.some((item) => right.some((other) => textsOverlap(item, other)));
}

function listingLocations(franchise: FranchiseOpportunity): string[] {
  return [...(franchise.preferredCities || []), ...(franchise.territoriesAvailable || [])];
}

function experienceRequirementKey(value?: string | null): string {
  return (value || '').toLowerCase().replace(/[\s-]+/g, '_');
}

function hasIndustryExperience(
  franchisee: FranchiseeProfile,
  franchise: FranchiseOpportunity
): boolean {
  const industry = franchise.industry || '';
  return (franchisee.businessExperience || []).some((exp) => textsOverlap(exp, industry))
    || (franchisee.industries || []).some((ind) => textsOverlap(ind, industry));
}

function hasFranchiseOwnership(franchisee: FranchiseeProfile): boolean {
  const stated = (franchisee.franchiseExperience || '').trim();
  if (stated && !['none', 'no', 'false'].includes(stated.toLowerCase())) return true;
  return (franchisee.businessExperience || []).some((exp) =>
    normalizeMatchText(exp).includes('franchise')
  );
}

export class AIFranchiseeMatcherService {

  /**
   * Match a franchisee with franchise opportunities
   */
  static async matchFranchisee(
    franchiseeProfile: FranchiseeProfile,
    franchiseOpportunities: FranchiseOpportunity[]
  ): Promise<FranchiseeMatch[]> {
    const matches: FranchiseeMatch[] = [];

    for (const franchise of franchiseOpportunities) {
      const match = this.scoreMatch(franchiseeProfile, franchise);
      if (match.matchScore >= 40) {
        matches.push(match);
      }
    }

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Score a single franchisee-franchise match from published fields only.
   */
  private static scoreMatch(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity,
    scoredBy: FranchiseeMatch['scoredBy'] = 'rules'
  ): FranchiseeMatch {
    const financialFitScore = this.calculateFinancialFit(franchisee, franchise);
    const experienceFitScore = this.calculateExperienceFit(franchisee, franchise);
    const personalityFitScore = this.calculatePersonalityFit(franchisee, franchise);
    const commitmentFitScore = this.calculateCommitmentFit(franchisee, franchise);
    const locationFitScore = this.calculateLocationFit(franchisee, franchise);

    const matchScore = this.weightedScore({
      financial: financialFitScore,
      experience: experienceFitScore,
      location: locationFitScore,
      commitment: commitmentFitScore,
      personality: personalityFitScore,
    });

    const analysis = this.generateExplainableReasons(franchisee, franchise, {
      financialFitScore: financialFitScore ?? 0,
      experienceFitScore,
      personalityFitScore: personalityFitScore ?? 0,
      commitmentFitScore: commitmentFitScore ?? 0,
      locationFitScore: locationFitScore ?? 0,
      matchScore,
    });

    return {
      franchiseeId: franchisee.userId,
      franchise,
      matchScore,
      financialFitScore: financialFitScore ?? 0,
      experienceFitScore,
      personalityFitScore: personalityFitScore ?? 0,
      commitmentFitScore: commitmentFitScore ?? 0,
      locationFitScore: locationFitScore ?? 0,
      successProbability: this.calculateSuccessProbability(matchScore, franchisee, franchise),
      matchLevel: this.getMatchLevel(matchScore),
      strengths: analysis.strengths,
      concerns: analysis.concerns,
      recommendation: analysis.recommendation,
      expectedROI: franchise.averageROI
        ? {
            year1: franchise.averageROI,
            year3: franchise.averageROI,
            year5: franchise.averageROI,
          }
        : undefined,
      estimatedBreakEven: undefined,
      scoredBy,
    };
  }

  private static weightedScore(dims: {
    financial: number | null;
    experience: number | null;
    location: number | null;
    commitment: number | null;
    personality: number | null;
  }): number {
    const weights = {
      financial: 0.35,
      location: 0.25,
      experience: 0.22,
      commitment: 0.18,
      personality: 0.1,
    };
    let total = 0;
    let weight = 0;
    (Object.keys(weights) as Array<keyof typeof weights>).forEach((key) => {
      const value = dims[key];
      if (value == null) return;
      total += value * weights[key];
      weight += weights[key];
    });
    return weight > 0 ? Math.round(total / weight) : 0;
  }

  private static normalizeScore(value: unknown, fallback: number, scaleFraction = false): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    if (scaleFraction && n >= 0 && n <= 1) return Math.round(n * 100);
    return this.clamp(n, 0, 100);
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  /**
   * Calculate financial compatibility
   */
  private static calculateFinancialFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number | null {
    let score = 0;

    // Budget vs total investment (only when both exist)
    if (franchisee.budget?.max && franchise.totalInvestment.min) {
      const maxInvestment = franchise.totalInvestment.max || franchise.totalInvestment.min;
      const budgetMax = franchisee.budget.max;

      if (budgetMax >= maxInvestment) {
        score += 70;
      } else if (budgetMax >= franchise.totalInvestment.min) {
        score += 50;
      } else if (budgetMax >= franchise.totalInvestment.min * 0.8) {
        score += 28;
      } else {
        score += 8;
      }
    } else {
      return null;
    }

    if (franchisee.liquidCapital && franchise.minimumLiquidCapital) {
      const ratio = franchisee.liquidCapital / franchise.minimumLiquidCapital;
      if (ratio >= 1.0) score += 20;
      else if (ratio >= 0.8) score += 10;
    }

    if (franchisee.netWorth && franchise.minimumNetWorth) {
      const ratio = franchisee.netWorth / franchise.minimumNetWorth;
      if (ratio >= 1.0) score += 10;
      else if (ratio >= 0.8) score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate experience compatibility
   */
  private static calculateExperienceFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number {
    let score = 0;
    const requirement = experienceRequirementKey(franchise.requiredExperience);
    const hasBusiness =
      (franchisee.businessExperience?.length || 0) > 0 ||
      (franchisee.managementExperience || 0) > 0 ||
      (franchisee.industryExperience || 0) > 0;
    const industryMatch = hasIndustryExperience(franchisee, franchise);

    switch (requirement) {
      case 'none':
      case '':
        score += 40;
        break;
      case 'any_business':
        score += hasBusiness ? 40 : 12;
        break;
      case 'industry_specific':
        score += industryMatch ? 40 : 10;
        break;
      case 'management':
        if ((franchisee.managementExperience || 0) >= 5) score += 40;
        else if ((franchisee.managementExperience || 0) >= 3) score += 32;
        else if ((franchisee.managementExperience || 0) >= 1) score += 24;
        else score += 8;
        break;
      case 'franchise_owner':
        score += hasFranchiseOwnership(franchisee) ? 40 : 10;
        break;
      default: {
        const haystack = [
          ...(franchisee.businessExperience || []),
          ...(franchisee.industries || []),
          franchise.industry,
        ].join(' ');
        score += textsOverlap(haystack, franchise.requiredExperience || '') ? 32 : 16;
      }
    }

    if (requirement !== 'management' && franchisee.managementExperience) {
      if (franchisee.managementExperience >= 10) score += 25;
      else if (franchisee.managementExperience >= 5) score += 20;
      else if (franchisee.managementExperience >= 3) score += 15;
      else if (franchisee.managementExperience >= 1) score += 10;
    }

    if (franchisee.educationLevel) {
      switch (franchisee.educationLevel) {
        case 'phd':
        case 'masters':
          score += 20;
          break;
        case 'bachelors':
          score += 15;
          break;
        case 'high-school':
          score += 10;
          break;
      }
    }

    if (franchisee.multiUnitInterest && franchise.multiUnitDiscount) {
      score += 10;
    }

    if (franchise.preferredExperience) {
      const profileText = [
        ...(franchisee.industries || []),
        ...(franchisee.businessExperience || []),
        franchise.industry,
      ].join(' ');
      if (textsOverlap(profileText, franchise.preferredExperience)) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calculate personality/cultural fit
   */
  private static calculatePersonalityFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number | null {
    if (!franchisee.personalityTraits?.length) return null;
    let score = 50;

    // This is a simplified version - in production, you'd use personality assessments
    if (franchisee.personalityTraits && franchisee.personalityTraits.length > 0) {
      // Leadership traits
      const leadershipTraits = ['leadership', 'decisive', 'ambitious', 'confident'];
      const hasLeadership = franchisee.personalityTraits.some(trait =>
        leadershipTraits.some(lt => trait.toLowerCase().includes(lt))
      );
      if (hasLeadership) score += 15;

      // Team player traits (important for franchises)
      const teamTraits = ['collaborative', 'team player', 'cooperative'];
      const isTeamPlayer = franchisee.personalityTraits.some(trait =>
        teamTraits.some(tt => trait.toLowerCase().includes(tt))
      );
      if (isTeamPlayer) score += 15;

      // Detail-oriented
      const detailTraits = ['detail-oriented', 'organized', 'systematic'];
      const isDetailOriented = franchisee.personalityTraits.some(trait =>
        detailTraits.some(dt => trait.toLowerCase().includes(dt))
      );
      if (isDetailOriented) score += 10;

      // Customer service orientation (for service franchises)
      if (franchise.industry.includes('Service') || franchise.industry.includes('Food')) {
        const serviceTraits = ['customer-focused', 'friendly', 'service-oriented'];
        const isServiceOriented = franchisee.personalityTraits.some(trait =>
          serviceTraits.some(st => trait.toLowerCase().includes(st))
        );
        if (isServiceOriented) score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calculate commitment compatibility
   */
  private static calculateCommitmentFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number | null {
    if (!franchisee.timeCommitment) return null;
    let score = 0;

    if (franchise.ownerOperatorRequired) {
      switch (franchisee.timeCommitment) {
        case 'full-time':
          score += 90;
          break;
        case 'semi-absentee':
          score += 28;
          break;
        case 'part-time':
          score += 16;
          break;
        case 'absentee':
          score += 8;
          break;
        default:
          score += 20;
      }
    } else if (franchisee.timeCommitment === 'full-time') {
      score += 80;
    } else if (franchisee.timeCommitment === 'semi-absentee') {
      score += franchise.successRate && franchise.successRate >= 80 ? 32 : 22;
    } else if (franchisee.timeCommitment === 'part-time') {
      score += 16;
    } else if (franchisee.timeCommitment === 'absentee') {
      score += 10;
    } else {
      score += 15;
    }

    if (franchisee.hasReferencesChecked) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Location + optional existing-space fit against listing requirements
   */
  private static calculateLocationFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number | null {
    const cities = listingLocations(franchise);
    if (!franchisee.preferredLocations?.length || !cities.length) return null;

    let score = anyTextOverlap(franchisee.preferredLocations, cities) ? 90 : 28;

    if (franchisee.spaceAvailable && franchise.minAreaSqft) {
      if (franchisee.spaceAvailable >= franchise.minAreaSqft) {
        if (!franchise.maxAreaSqft || franchisee.spaceAvailable <= franchise.maxAreaSqft) {
          score = Math.min(100, score + 10);
        } else {
          score = Math.min(100, score + 4);
        }
      } else {
        score = Math.max(20, score - 18);
      }
    }

    return Math.min(100, score);
  }

  /**
   * Rank live listings with Command Code. Facts from the listing always clamp the score.
   */
  private static async rankWithCommandCode(
    franchisee: FranchiseeProfile,
    opportunities: FranchiseOpportunity[]
  ): Promise<FranchiseeMatch[] | null> {
    const listings = opportunities.slice(0, 20).map((franchise) => ({
      id: franchise.franchiseId,
      brand: franchise.brandName,
      industry: franchise.industry,
      fee: franchise.franchiseFee || null,
      investmentMin: franchise.totalInvestment.min || null,
      investmentMax: franchise.totalInvestment.max || null,
      royalty: franchise.royaltyPercentage || null,
      cities: listingLocations(franchise).slice(0, 12),
      minSqft: franchise.minAreaSqft || null,
      maxSqft: franchise.maxAreaSqft || null,
      liquidMin: franchise.minimumLiquidCapital || null,
      netWorthMin: franchise.minimumNetWorth || null,
      ownerOperator: Boolean(franchise.ownerOperatorRequired),
      experience: franchise.requiredExperience || null,
    }));

    const prompt = `Return ONLY compact JSON. No thinking. No markdown.
Score this Indian franchise seeker against published listing fields only.
Never invent investment, territory, or revenue. Missing fields = concerns, not bonus points.

SEEKER:
${JSON.stringify({
  budgetMin: franchisee.budget?.min || null,
  budgetMax: franchisee.budget?.max || null,
  cities: franchisee.preferredLocations || [],
  industries: franchisee.industries || [],
  liquidCapital: franchisee.liquidCapital || null,
  netWorth: franchisee.netWorth || null,
  managementYears: franchisee.managementExperience || null,
  franchiseExperience: franchisee.franchiseExperience || null,
  timeCommitment: franchisee.timeCommitment || null,
  spaceSqft: franchisee.spaceAvailable || null,
})}

LISTINGS:
${JSON.stringify(listings)}

JSON shape:
{"matches":[{"id":"<listing id>","matchScore":72,"financialFitScore":80,"experienceFitScore":55,"locationFitScore":90,"commitmentFitScore":70,"strengths":["..."],"concerns":["..."],"recommendation":"..."}]}
Include every listing. Scores are integers from 0 to 100, not 0 to 1.`;

    const text = await generateGeminiContent(prompt, {
      model: COMMAND_CODE_MATCH_MODEL,
      featureFlag: 'ai_matching',
      responseFormat: 'json',
      generationConfig: { temperature: 0, maxOutputTokens: 4000 },
    });
    const parsed = this.parseJsonObject(text) as {
      matches?: Array<{
        id?: string;
        brand?: string;
        matchScore?: number;
        financialFitScore?: number;
        experienceFitScore?: number;
        locationFitScore?: number;
        commitmentFitScore?: number;
        strengths?: string[];
        concerns?: string[];
        recommendation?: string;
      }>;
    };
    if (!Array.isArray(parsed.matches) || parsed.matches.length === 0) return null;

    const byId = new Map(opportunities.map((item) => [item.franchiseId, item]));
    const byBrand = new Map(
      opportunities.map((item) => [item.brandName.trim().toLowerCase(), item])
    );
    const scaleFraction = parsed.matches.every((row) => {
      const n = Number(row.matchScore);
      return !Number.isFinite(n) || (n >= 0 && n <= 1);
    });
    const ranked: FranchiseeMatch[] = [];
    for (const row of parsed.matches) {
      const franchise =
        (row.id && byId.get(row.id)) ||
        (row.brand && byBrand.get(row.brand.trim().toLowerCase())) ||
        (row.id && byBrand.get(row.id.trim().toLowerCase()));
      if (!franchise) continue;
      const factual = this.scoreMatch(franchisee, franchise, 'command-code');
      const matchScore = this.clampToFacts(
        franchisee,
        franchise,
        this.normalizeScore(row.matchScore, factual.matchScore, scaleFraction)
      );
      ranked.push({
        ...factual,
        matchScore,
        financialFitScore: this.normalizeScore(row.financialFitScore, factual.financialFitScore, scaleFraction),
        experienceFitScore: this.normalizeScore(row.experienceFitScore, factual.experienceFitScore, scaleFraction),
        locationFitScore: this.normalizeScore(row.locationFitScore, factual.locationFitScore, scaleFraction),
        commitmentFitScore: this.normalizeScore(row.commitmentFitScore, factual.commitmentFitScore, scaleFraction),
        matchLevel: this.getMatchLevel(matchScore),
        successProbability: this.calculateSuccessProbability(matchScore, franchisee, franchise),
        strengths: Array.isArray(row.strengths) && row.strengths.length ? row.strengths.slice(0, 4) : factual.strengths,
        concerns: Array.isArray(row.concerns) ? row.concerns.slice(0, 3) : factual.concerns,
        recommendation: row.recommendation || factual.recommendation,
        scoredBy: 'command-code',
      });
    }
    if (!ranked.length) return null;
    return ranked.sort((a, b) => b.matchScore - a.matchScore);
  }

  private static clampToFacts(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity,
    score: number
  ): number {
    let next = score;
    if (
      franchisee.budget?.max &&
      franchise.totalInvestment.min &&
      franchisee.budget.max < franchise.totalInvestment.min
    ) {
      next = Math.min(next, 48);
    }
    const cities = listingLocations(franchise);
    if (
      franchisee.preferredLocations?.length &&
      cities.length &&
      !anyTextOverlap(franchisee.preferredLocations, cities)
    ) {
      next = Math.min(next, 58);
    }
    if (franchise.ownerOperatorRequired && franchisee.timeCommitment && franchisee.timeCommitment !== 'full-time') {
      next = Math.min(next, 52);
    }
    return next;
  }

  private static parseJsonObject(text: string): Record<string, unknown> {
    const cleaned = text
      .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const candidates = [cleaned];
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart >= 0 && objectEnd > objectStart) {
      candidates.push(cleaned.slice(objectStart, objectEnd + 1));
    }
    const matchesStart = cleaned.search(/\{\s*"matches"/);
    if (matchesStart >= 0 && objectEnd > matchesStart) {
      candidates.push(cleaned.slice(matchesStart, objectEnd + 1));
    }
    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');
    if (arrayStart >= 0 && arrayEnd > arrayStart) {
      candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));
    }
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate) as unknown;
        if (Array.isArray(parsed)) return { matches: parsed };
        if (parsed && typeof parsed === 'object') {
          const record = parsed as Record<string, unknown>;
          if (Array.isArray(record.matches)) return record;
          if (Array.isArray(record.results)) return { matches: record.results };
          return record;
        }
      } catch {
        /* try next */
      }
    }
    const salvaged = this.salvageMatchRows(cleaned);
    if (salvaged.length) return { matches: salvaged };
    console.error('Command Code JSON parse failed. Preview:', cleaned.slice(0, 400));
    throw new Error('Command Code did not return JSON');
  }

  private static salvageMatchRows(text: string): Array<Record<string, unknown>> {
    const marker = text.indexOf('"matches"');
    const start = marker >= 0 ? text.indexOf('[', marker) : text.indexOf('[');
    if (start < 0) return [];
    const rows: Array<Record<string, unknown>> = [];
    let i = start + 1;
    while (i < text.length && rows.length < 20) {
      const objStart = text.indexOf('{', i);
      if (objStart < 0) break;
      let depth = 0;
      let inString = false;
      let escape = false;
      let closed = -1;
      for (let j = objStart; j < text.length; j += 1) {
        const ch = text[j];
        if (inString) {
          if (escape) escape = false;
          else if (ch === '\\') escape = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') inString = true;
        else if (ch === '{') depth += 1;
        else if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            closed = j;
            break;
          }
        }
      }
      if (closed < 0) break;
      try {
        const row = JSON.parse(text.slice(objStart, closed + 1)) as Record<string, unknown>;
        if (row && typeof row === 'object') rows.push(row);
      } catch {
        /* skip broken object */
      }
      i = closed + 1;
    }
    return rows;
  }

  /**
   * Rule-based explainable match reasons from real profile + franchise data
   */
  private static generateExplainableReasons(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity,
    scores: {
      financialFitScore: number;
      experienceFitScore: number;
      personalityFitScore: number;
      commitmentFitScore: number;
      locationFitScore: number;
      matchScore: number;
    }
  ): {
    strengths: string[];
    concerns: string[];
    recommendation: string;
  } {
    const strengths: string[] = [];
    const concerns: string[] = [];

    if (franchisee.budget?.max && franchise.totalInvestment.max <= franchisee.budget.max) {
      strengths.push('Within your investment range');
    } else if (scores.financialFitScore >= 70) {
      strengths.push('Investment requirement is close to your budget');
    } else if (franchisee.budget?.max && franchise.totalInvestment.max > franchisee.budget.max) {
      concerns.push('Total investment exceeds your stated budget');
    }

    if (franchisee.liquidCapital && franchise.minimumLiquidCapital) {
      if (franchisee.liquidCapital >= franchise.minimumLiquidCapital) {
        strengths.push('Meets liquid capital requirement');
      } else {
        concerns.push('Liquid capital below franchise minimum');
      }
    }

    const cities = listingLocations(franchise);
    if (franchisee.preferredLocations?.length && cities.length) {
      if (anyTextOverlap(franchisee.preferredLocations, cities)) {
        strengths.push('Brand is expanding in your preferred cities');
      } else if (scores.locationFitScore < 50) {
        concerns.push("Preferred cities may not overlap with this brand's expansion markets");
      }
    }

    if (franchisee.spaceAvailable && franchise.minAreaSqft) {
      if (
        franchisee.spaceAvailable >= franchise.minAreaSqft &&
        (!franchise.maxAreaSqft || franchisee.spaceAvailable <= franchise.maxAreaSqft)
      ) {
        strengths.push('Available space fits the required outlet size');
      } else if (franchisee.spaceAvailable < franchise.minAreaSqft) {
        concerns.push('Available space is below the required outlet size');
      }
    }

    if (franchisee.industries?.length) {
      const industryMatch = franchisee.industries.some((ind) =>
        franchise.industry.toLowerCase().includes(ind.toLowerCase())
      );
      if (industryMatch) {
        strengths.push('Matches your preferred industry');
      }
    }

    const requirement = experienceRequirementKey(franchise.requiredExperience);
    if (requirement === 'franchise_owner' && !hasFranchiseOwnership(franchisee)) {
      concerns.push('This brand prefers prior franchise ownership');
    } else if (requirement === 'industry_specific' && !hasIndustryExperience(franchisee, franchise)) {
      concerns.push('Industry-specific experience is required');
    } else if (requirement === 'management' && (franchisee.managementExperience || 0) < 1) {
      concerns.push('Management experience is required');
    } else if (scores.experienceFitScore >= 70) {
      strengths.push('Experience requirement aligns with your profile');
    } else if (franchise.requiredExperience && scores.experienceFitScore < 50) {
      concerns.push('Experience requirement may not match your profile');
    }

    if (franchise.ownerOperatorRequired) {
      if (franchisee.timeCommitment === 'full-time') {
        strengths.push('Owner-operator requirement matches your full-time commitment');
      } else {
        concerns.push('This brand requires an owner-operator');
      }
    } else if (franchisee.timeCommitment === 'full-time' && scores.commitmentFitScore >= 70) {
      strengths.push('Operating model fits your time commitment');
    } else if (scores.commitmentFitScore < 60) {
      concerns.push('Operating model may not fit your time commitment');
    }

    if (scores.financialFitScore >= 80 && strengths.length === 0) {
      strengths.push('Strong financial fit based on your profile');
    }

    const recommendation =
      scores.matchScore >= 75
        ? 'Strong match — review this franchise and request information'
        : scores.matchScore >= 60
          ? 'Good match — explore details and compare with other options'
          : 'Partial match — review requirements before applying';

    return { strengths, concerns, recommendation };
  }

  /**
   * Fallback analysis
   */
  private static generateFallbackAnalysis(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity,
    scores: any
  ): {
    strengths: string[];
    concerns: string[];
    recommendation: string;
    expectedROI?: { year1: number; year3: number; year5: number };
    estimatedBreakEven?: number;
  } {
    const strengths: string[] = [];
    const concerns: string[] = [];

    if (scores.financialFitScore >= 80) strengths.push('Strong financial capacity');
    if (scores.experienceFitScore >= 70) strengths.push('Relevant industry experience');
    if (franchisee.multiUnitInterest && franchise.multiUnitDiscount) {
      strengths.push('Multi-unit potential for growth');
    }

    if (scores.financialFitScore < 60) concerns.push('Financial capacity may be stretched');
    if (scores.experienceFitScore < 50) concerns.push('Limited relevant experience');
    if (scores.commitmentFitScore < 60) concerns.push('Time commitment alignment unclear');

    const recommendation = scores.matchScore >= 75
      ? 'Excellent match - recommend proceeding with franchise application'
      : scores.matchScore >= 60
      ? 'Good match - schedule discovery day to learn more'
      : 'Fair match - consider other franchise options as well';

    return {
      strengths,
      concerns,
      recommendation,
      expectedROI: franchise.averageROI
        ? {
            year1: franchise.averageROI * 0.6,
            year3: franchise.averageROI,
            year5: franchise.averageROI * 1.3,
          }
        : undefined,
      estimatedBreakEven: 18, // Default 18 months
    };
  }

  /**
   * Get match level
   */
  private static getMatchLevel(score: number): FranchiseeMatch['matchLevel'] {
    if (score >= 80) return 'Excellent Match';
    if (score >= 65) return 'Good Match';
    if (score >= 45) return 'Fair Match';
    return 'Poor Match';
  }

  /**
   * Calculate success probability
   */
  private static calculateSuccessProbability(
    matchScore: number,
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number {
    let probability = matchScore;

    // Adjust based on franchise success rate
    if (franchise.successRate) {
      probability = (probability + franchise.successRate) / 2;
    }

    // Boost for verified references
    if (franchisee.hasReferencesChecked) {
      probability *= 1.1;
    }

    // Boost for multi-unit interest (shows commitment)
    if (franchisee.multiUnitInterest) {
      probability *= 1.05;
    }

    return Math.min(100, Math.round(probability));
  }

  /**
   * Find best franchise matches for a franchisee
   */
  static async findBestMatches(
    franchiseeProfile: FranchiseeProfile,
    limit: number = 10
  ): Promise<FranchiseeMatch[]> {
    try {
      // Fetch available franchises from database
      const { data: franchises, error } = await supabase
        .from('franchise_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!franchises || franchises.length === 0) return [];

      const opportunities: FranchiseOpportunity[] = franchises.map((f) => {
        const reqs = getListingRequirements(f);
        const investmentMin = reqs.minInvestment ?? f.franchise_fee ?? 0;
        const investmentMax = reqs.maxInvestment ?? investmentMin;
        const cityRows = Array.isArray(f.territory_availability)
          ? f.territory_availability
              .map((row: unknown) => {
                if (typeof row === 'string') return row;
                if (row && typeof row === 'object') {
                  const record = row as { city?: string; name?: string };
                  return record.city || record.name;
                }
                return null;
              })
              .filter((value: string | null | undefined): value is string => Boolean(value))
          : [];
        const territories = [
          ...cityRows,
          ...(Array.isArray(f.preferred_cities) ? f.preferred_cities : []),
          ...(Array.isArray(f.expansion_territories) ? f.expansion_territories : []),
          ...(Array.isArray(f.operating_locations) ? f.operating_locations : []),
          ...(Array.isArray(f.territories_available) ? f.territories_available : []),
        ];

        return {
          franchiseId: f.id,
          brandName: f.brand_name || f.name,
          industry: f.industry,
          franchiseFee: f.franchise_fee,
          totalInvestment: { min: investmentMin, max: investmentMax },
          royaltyPercentage: f.royalty_percentage || 0,
          requiredExperience: reqs.requiredExperience || f.required_experience,
          preferredExperience: reqs.preferredExperience || undefined,
          idealFranchiseeProfile: f.ideal_franchisee,
          supportProvided: f.support_provided || [],
          trainingDuration: f.training_duration_days || f.training_duration,
          territoriesAvailable: [...new Set(territories.map(String).filter(Boolean))],
          preferredCities: reqs.preferredCities,
          ownerOperatorRequired: reqs.ownerOperatorRequired,
          minAreaSqft: reqs.minAreaSqft,
          maxAreaSqft: reqs.maxAreaSqft,
          propertyType: reqs.propertyType,
          minimumNetWorth: f.minimum_net_worth,
          minimumLiquidCapital: f.minimum_liquid_capital,
          multiUnitDiscount: f.multi_unit_discount,
          successRate: f.success_rate,
          averageROI: f.expected_roi_percentage ?? f.average_roi,
        };
      });

      // Score from published listing fields. Waiting on the model kept this over 10s
      // and could disagree with the budget the seeker just entered.
      const matches = await this.matchFranchisee(franchiseeProfile, opportunities);
      return matches.slice(0, limit);
    } catch (error) {
      console.error('Find matches error:', error);
      return [];
    }
  }
}
