import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface FranchiseeProfile {
  userId: string;
  name?: string;
  email?: string;
  budget?: { min: number; max: number };
  industries?: string[];
  preferredLocations?: string[];
  businessExperience?: string[];
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
}

export interface FranchiseOpportunity {
  franchiseId: string;
  brandName: string;
  industry: string;
  franchiseFee: number;
  totalInvestment: { min: number; max: number };
  royaltyPercentage: number;
  requiredExperience?: string;
  idealFranchiseeProfile?: string;
  supportProvided?: string[];
  trainingDuration?: number; // days
  territoriesAvailable?: string[];
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
  successProbability: number; // 0-100
  matchLevel: 'Excellent Match' | 'Good Match' | 'Fair Match' | 'Poor Match';
  strengths: string[];
  concerns: string[];
  recommendation: string;
  expectedROI?: { year1: number; year3: number; year5: number };
  estimatedBreakEven?: number; // months
}

export class AIFranchiseeMatcherService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Match a franchisee with franchise opportunities
   */
  static async matchFranchisee(
    franchiseeProfile: FranchiseeProfile,
    franchiseOpportunities: FranchiseOpportunity[]
  ): Promise<FranchiseeMatch[]> {
    const matches: FranchiseeMatch[] = [];

    for (const franchise of franchiseOpportunities) {
      const match = await this.scoreMatch(franchiseeProfile, franchise);
      if (match.matchScore >= 40) { // Only include reasonable matches
        matches.push(match);
      }
    }

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Score a single franchisee-franchise match
   */
  private static async scoreMatch(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): Promise<FranchiseeMatch> {
    // Calculate individual scores
    const financialFitScore = this.calculateFinancialFit(franchisee, franchise);
    const experienceFitScore = this.calculateExperienceFit(franchisee, franchise);
    const personalityFitScore = this.calculatePersonalityFit(franchisee, franchise);
    const commitmentFitScore = this.calculateCommitmentFit(franchisee, franchise);

    // Weighted overall score
    const matchScore = Math.round(
      financialFitScore * 0.35 +
      experienceFitScore * 0.30 +
      personalityFitScore * 0.20 +
      commitmentFitScore * 0.15
    );

    // Use AI for detailed analysis
    const aiAnalysis = await this.analyzeMatchWithAI(
      franchisee,
      franchise,
      { financialFitScore, experienceFitScore, personalityFitScore, commitmentFitScore, matchScore }
    );

    const matchLevel = this.getMatchLevel(matchScore);
    const successProbability = this.calculateSuccessProbability(
      matchScore,
      franchisee,
      franchise
    );

    return {
      franchiseeId: franchisee.userId,
      franchise,
      matchScore,
      financialFitScore,
      experienceFitScore,
      personalityFitScore,
      commitmentFitScore,
      successProbability,
      matchLevel,
      strengths: aiAnalysis.strengths,
      concerns: aiAnalysis.concerns,
      recommendation: aiAnalysis.recommendation,
      expectedROI: aiAnalysis.expectedROI,
      estimatedBreakEven: aiAnalysis.estimatedBreakEven,
    };
  }

  /**
   * Calculate financial compatibility
   */
  private static calculateFinancialFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number {
    let score = 0;

    // Budget vs total investment (40 points)
    if (franchisee.budget) {
      const maxInvestment = franchise.totalInvestment.max;
      const budgetMax = franchisee.budget.max;

      if (budgetMax >= maxInvestment) {
        score += 40;
      } else if (budgetMax >= maxInvestment * 0.8) {
        score += 30;
      } else if (budgetMax >= maxInvestment * 0.6) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Liquid capital (30 points)
    if (franchisee.liquidCapital && franchise.minimumLiquidCapital) {
      const ratio = franchisee.liquidCapital / franchise.minimumLiquidCapital;
      if (ratio >= 1.5) score += 30;
      else if (ratio >= 1.2) score += 25;
      else if (ratio >= 1.0) score += 20;
      else if (ratio >= 0.8) score += 10;
    } else {
      score += 15; // Partial credit if data missing
    }

    // Net worth (20 points)
    if (franchisee.netWorth && franchise.minimumNetWorth) {
      const ratio = franchisee.netWorth / franchise.minimumNetWorth;
      if (ratio >= 2.0) score += 20;
      else if (ratio >= 1.5) score += 15;
      else if (ratio >= 1.0) score += 10;
      else if (ratio >= 0.8) score += 5;
    } else {
      score += 10; // Partial credit if data missing
    }

    // Credit score (10 points)
    if (franchisee.creditScore) {
      if (franchisee.creditScore >= 750) score += 10;
      else if (franchisee.creditScore >= 700) score += 7;
      else if (franchisee.creditScore >= 650) score += 4;
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

    // Industry experience (40 points)
    if (franchisee.businessExperience && franchisee.businessExperience.length > 0) {
      const hasIndustryMatch = franchisee.businessExperience.some(exp =>
        franchise.industry.toLowerCase().includes(exp.toLowerCase()) ||
        exp.toLowerCase().includes(franchise.industry.toLowerCase())
      );

      if (hasIndustryMatch && franchisee.industryExperience) {
        if (franchisee.industryExperience >= 5) score += 40;
        else if (franchisee.industryExperience >= 3) score += 30;
        else if (franchisee.industryExperience >= 1) score += 20;
      } else if (hasIndustryMatch) {
        score += 25;
      } else if (franchisee.businessExperience.length > 0) {
        score += 15; // Some business experience
      }
    }

    // Management experience (30 points)
    if (franchisee.managementExperience) {
      if (franchisee.managementExperience >= 10) score += 30;
      else if (franchisee.managementExperience >= 5) score += 25;
      else if (franchisee.managementExperience >= 3) score += 20;
      else if (franchisee.managementExperience >= 1) score += 15;
    }

    // Education (20 points)
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

    // Multi-unit readiness (10 points)
    if (franchisee.multiUnitInterest && franchise.multiUnitDiscount) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate personality/cultural fit
   */
  private static calculatePersonalityFit(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity
  ): number {
    let score = 50; // Base score

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
  ): number {
    let score = 50; // Base score

    // Time commitment alignment (50 points)
    if (franchisee.timeCommitment === 'full-time') {
      score += 50; // Full-time is ideal for most franchises
    } else if (franchisee.timeCommitment === 'semi-absentee') {
      // Good for established brands with strong systems
      if (franchise.successRate && franchise.successRate >= 80) {
        score += 35;
      } else {
        score += 25;
      }
    } else if (franchisee.timeCommitment === 'part-time') {
      score += 20; // Part-time is challenging
    } else if (franchisee.timeCommitment === 'absentee') {
      score += 15; // Absentee is risky
    }

    // Location alignment (25 points)
    if (franchisee.preferredLocations && franchise.territoriesAvailable) {
      const hasLocationMatch = franchisee.preferredLocations.some(loc =>
        franchise.territoriesAvailable!.some(territory =>
          territory.toLowerCase().includes(loc.toLowerCase())
        )
      );
      if (hasLocationMatch) score += 25;
      else score += 10; // Some territories available
    }

    // References checked (25 points)
    if (franchisee.hasReferencesChecked) {
      score += 25;
    }

    return Math.min(100, score);
  }

  /**
   * AI-powered detailed match analysis
   */
  private static async analyzeMatchWithAI(
    franchisee: FranchiseeProfile,
    franchise: FranchiseOpportunity,
    scores: any
  ): Promise<{
    strengths: string[];
    concerns: string[];
    recommendation: string;
    expectedROI?: { year1: number; year3: number; year5: number };
    estimatedBreakEven?: number;
  }> {
    const prompt = `As a franchise matching expert, analyze this franchisee-franchise match:

FRANCHISEE PROFILE:
- Experience: ${franchisee.managementExperience || 0} years management, ${franchisee.industryExperience || 0} years in industry
- Education: ${franchisee.educationLevel || 'not specified'}
- Budget: ₹${franchisee.budget?.min?.toLocaleString() || 'N/A'} - ₹${franchisee.budget?.max?.toLocaleString() || 'N/A'}
- Liquid Capital: ₹${franchisee.liquidCapital?.toLocaleString() || 'N/A'}
- Net Worth: ₹${franchisee.netWorth?.toLocaleString() || 'N/A'}
- Time Commitment: ${franchisee.timeCommitment || 'not specified'}
- Multi-unit Interest: ${franchisee.multiUnitInterest ? 'Yes' : 'No'}

FRANCHISE OPPORTUNITY:
- Brand: ${franchise.brandName}
- Industry: ${franchise.industry}
- Franchise Fee: ₹${franchise.franchiseFee.toLocaleString()}
- Total Investment: ₹${franchise.totalInvestment.min.toLocaleString()} - ₹${franchise.totalInvestment.max.toLocaleString()}
- Royalty: ${franchise.royaltyPercentage}%
- Required Net Worth: ₹${franchise.minimumNetWorth?.toLocaleString() || 'N/A'}
- Success Rate: ${franchise.successRate || 'N/A'}%
- Average ROI: ${franchise.averageROI || 'N/A'}%

MATCH SCORES:
- Financial Fit: ${scores.financialFitScore}/100
- Experience Fit: ${scores.experienceFitScore}/100
- Personality Fit: ${scores.personalityFitScore}/100
- Overall Match: ${scores.matchScore}/100

Provide analysis in EXACT JSON format (no markdown):
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendation": "One clear recommendation",
  "expectedROI": {"year1": <number>, "year3": <number>, "year5": <number>},
  "estimatedBreakEven": <months as number>
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.generateFallbackAnalysis(franchisee, franchise, scores);
    }
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
        .from('franchises')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!franchises || franchises.length === 0) return [];

      // Convert to FranchiseOpportunity format
      const opportunities: FranchiseOpportunity[] = franchises.map(f => ({
        franchiseId: f.id,
        brandName: f.brand_name || f.name,
        industry: f.industry,
        franchiseFee: f.franchise_fee,
        totalInvestment: f.total_investment || { min: f.franchise_fee, max: f.franchise_fee * 3 },
        royaltyPercentage: f.royalty_percentage || 6,
        requiredExperience: f.required_experience,
        idealFranchiseeProfile: f.ideal_franchisee,
        supportProvided: f.support_provided || [],
        trainingDuration: f.training_duration,
        territoriesAvailable: f.territories_available || [],
        minimumNetWorth: f.minimum_net_worth,
        minimumLiquidCapital: f.minimum_liquid_capital,
        multiUnitDiscount: f.multi_unit_discount,
        successRate: f.success_rate,
        averageROI: f.average_roi,
      }));

      // Match and return top results
      const matches = await this.matchFranchisee(franchiseeProfile, opportunities);
      return matches.slice(0, limit);
    } catch (error) {
      console.error('Find matches error:', error);
      return [];
    }
  }
}
