import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface BuyerQualification {
  leadId: string;
  overallScore: number; // 0-100
  qualificationLevel: 'Hot Lead' | 'Warm Lead' | 'Cold Lead' | 'Unqualified';
  financialScore: number;
  experienceScore: number;
  seriousnessScore: number;
  fitScore: number;
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
  nextSteps: string[];
  estimatedCloseProbability: number; // 0-100
  priorityRank: 'High' | 'Medium' | 'Low';
}

export interface BuyerProfile {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  budget?: { min: number; max: number };
  industries?: string[];
  experience?: string[];
  currentOccupation?: string;
  investmentTimeline?: string;
  inquiryMessage?: string;
  previousInquiries?: number;
  profileCompleteness?: number;
  verificationStatus?: 'verified' | 'unverified' | 'pending';
  savedListings?: number;
  timeOnPlatform?: number; // days
}

export class AIBuyerQualifierService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Qualify and score a buyer lead
   */
  static async qualifyBuyer(
    buyerProfile: BuyerProfile,
    businessData: {
      id: string;
      price?: number;
      industry?: string;
      revenue?: number;
      requiredExperience?: string;
    }
  ): Promise<BuyerQualification> {
    try {
      // Calculate basic scores
      const financialScore = this.calculateFinancialScore(buyerProfile, businessData);
      const experienceScore = this.calculateExperienceScore(buyerProfile, businessData);
      const seriousnessScore = this.calculateSeriousnessScore(buyerProfile);
      const fitScore = this.calculateFitScore(buyerProfile, businessData);

      // Overall score (weighted average)
      const overallScore = Math.round(
        financialScore * 0.35 +
        experienceScore * 0.25 +
        seriousnessScore * 0.25 +
        fitScore * 0.15
      );

      // Use AI for detailed analysis
      const aiAnalysis = await this.analyzeWithAI(
        buyerProfile,
        businessData,
        { financialScore, experienceScore, seriousnessScore, fitScore, overallScore }
      );

      // Determine qualification level
      const qualificationLevel = this.getQualificationLevel(overallScore);
      const priorityRank = this.getPriorityRank(overallScore, seriousnessScore);
      const estimatedCloseProbability = this.estimateCloseProbability(
        overallScore,
        seriousnessScore,
        buyerProfile.previousInquiries || 0
      );

      return {
        leadId: buyerProfile.userId,
        overallScore,
        qualificationLevel,
        financialScore,
        experienceScore,
        seriousnessScore,
        fitScore,
        strengths: aiAnalysis.strengths,
        concerns: aiAnalysis.concerns,
        recommendedAction: aiAnalysis.recommendedAction,
        nextSteps: aiAnalysis.nextSteps,
        estimatedCloseProbability,
        priorityRank,
      };
    } catch (error) {
      console.error('Buyer qualification error:', error);
      throw error;
    }
  }

  /**
   * Calculate financial capability score
   */
  private static calculateFinancialScore(
    buyer: BuyerProfile,
    business: { price?: number }
  ): number {
    if (!buyer.budget || !business.price) return 50;

    const budgetMax = buyer.budget.max;
    const budgetMin = buyer.budget.min;
    const price = business.price;

    // Perfect match: price within budget
    if (price >= budgetMin && price <= budgetMax) return 100;

    // Price slightly above budget (within 20%)
    if (price <= budgetMax * 1.2) return 80;

    // Price moderately above budget (20-40%)
    if (price <= budgetMax * 1.4) return 60;

    // Price too high
    if (price > budgetMax * 1.5) return 30;

    // Price below minimum (might be suspicious)
    if (price < budgetMin * 0.7) return 40;

    return 50;
  }

  /**
   * Calculate industry experience score
   */
  private static calculateExperienceScore(
    buyer: BuyerProfile,
    business: { industry?: string }
  ): number {
    if (!buyer.experience || buyer.experience.length === 0) return 40;

    const hasRelevantExperience = buyer.experience.some(exp =>
      business.industry?.toLowerCase().includes(exp.toLowerCase()) ||
      exp.toLowerCase().includes(business.industry?.toLowerCase() || '')
    );

    if (hasRelevantExperience) return 90;

    // Has business experience but not in this industry
    if (buyer.experience.length > 0) return 65;

    return 40;
  }

  /**
   * Calculate buyer seriousness score
   */
  private static calculateSeriousnessScore(buyer: BuyerProfile): number {
    let score = 0;

    // Profile completeness (0-30 points)
    score += (buyer.profileCompleteness || 0) * 0.3;

    // Verification status (0-25 points)
    if (buyer.verificationStatus === 'verified') score += 25;
    else if (buyer.verificationStatus === 'pending') score += 15;

    // Previous inquiries (0-15 points)
    const inquiries = buyer.previousInquiries || 0;
    if (inquiries >= 5) score += 15;
    else if (inquiries >= 3) score += 10;
    else if (inquiries >= 1) score += 5;

    // Saved listings (0-10 points)
    const saved = buyer.savedListings || 0;
    if (saved >= 10) score += 10;
    else if (saved >= 5) score += 7;
    else if (saved >= 1) score += 4;

    // Time on platform (0-10 points)
    const days = buyer.timeOnPlatform || 0;
    if (days >= 30) score += 10;
    else if (days >= 14) score += 7;
    else if (days >= 7) score += 4;

    // Message quality (0-10 points)
    if (buyer.inquiryMessage) {
      const wordCount = buyer.inquiryMessage.split(' ').length;
      if (wordCount >= 50) score += 10;
      else if (wordCount >= 20) score += 7;
      else if (wordCount >= 10) score += 4;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate buyer-business fit score
   */
  private static calculateFitScore(
    buyer: BuyerProfile,
    business: { industry?: string }
  ): number {
    let score = 50; // Base score

    // Industry interest match
    if (buyer.industries && business.industry) {
      const matchesInterest = buyer.industries.some(ind =>
        business.industry?.toLowerCase().includes(ind.toLowerCase())
      );
      if (matchesInterest) score += 30;
    }

    // Timeline alignment
    if (buyer.investmentTimeline === 'immediate' || buyer.investmentTimeline === '1-3 months') {
      score += 20;
    } else if (buyer.investmentTimeline === '3-6 months') {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Use AI for detailed buyer analysis
   */
  private static async analyzeWithAI(
    buyer: BuyerProfile,
    business: any,
    scores: any
  ): Promise<{
    strengths: string[];
    concerns: string[];
    recommendedAction: string;
    nextSteps: string[];
  }> {
    const prompt = `As a lead qualification expert, analyze this buyer inquiry:

BUYER PROFILE:
- Budget: ₹${buyer.budget?.min?.toLocaleString() || 'N/A'} - ₹${buyer.budget?.max?.toLocaleString() || 'N/A'}
- Industries: ${buyer.industries?.join(', ') || 'Not specified'}
- Experience: ${buyer.experience?.join(', ') || 'No experience listed'}
- Occupation: ${buyer.currentOccupation || 'Not specified'}
- Timeline: ${buyer.investmentTimeline || 'Not specified'}
- Previous Inquiries: ${buyer.previousInquiries || 0}
- Profile Completeness: ${buyer.profileCompleteness || 0}%
- Verification: ${buyer.verificationStatus || 'unverified'}
- Message: "${buyer.inquiryMessage || 'No message'}"

BUSINESS:
- Price: ₹${business.price?.toLocaleString() || 'N/A'}
- Industry: ${business.industry || 'N/A'}
- Revenue: ₹${business.revenue?.toLocaleString() || 'N/A'}

SCORES:
- Financial: ${scores.financialScore}/100
- Experience: ${scores.experienceScore}/100
- Seriousness: ${scores.seriousnessScore}/100
- Overall: ${scores.overallScore}/100

Provide analysis in this EXACT JSON format (no markdown):
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendedAction": "One clear action to take",
  "nextSteps": ["step 1", "step 2", "step 3"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      // Fallback analysis
      return this.generateFallbackAnalysis(buyer, business, scores);
    }
  }

  /**
   * Fallback analysis when AI fails
   */
  private static generateFallbackAnalysis(buyer: BuyerProfile, business: any, scores: any): {
    strengths: string[];
    concerns: string[];
    recommendedAction: string;
    nextSteps: string[];
  } {
    const strengths: string[] = [];
    const concerns: string[] = [];

    if (scores.financialScore >= 80) strengths.push('Budget aligns well with business price');
    if (scores.experienceScore >= 70) strengths.push('Has relevant industry experience');
    if (scores.seriousnessScore >= 70) strengths.push('Shows high engagement on platform');
    if (buyer.verificationStatus === 'verified') strengths.push('Verified buyer profile');

    if (scores.financialScore < 60) concerns.push('Budget may be insufficient');
    if (scores.experienceScore < 50) concerns.push('Limited industry experience');
    if (scores.seriousnessScore < 50) concerns.push('Low engagement signals');
    if (!buyer.verificationStatus || buyer.verificationStatus === 'unverified') {
      concerns.push('Profile not verified');
    }

    const recommendedAction = scores.overallScore >= 70
      ? 'Schedule a call or meeting to discuss the opportunity'
      : scores.overallScore >= 50
      ? 'Send detailed information and gauge interest'
      : 'Request more information before investing time';

    const nextSteps = [
      'Review buyer\'s complete profile',
      'Verify financial capability',
      'Schedule discovery call',
    ];

    return { strengths, concerns, recommendedAction, nextSteps };
  }

  /**
   * Determine qualification level
   */
  private static getQualificationLevel(score: number): BuyerQualification['qualificationLevel'] {
    if (score >= 75) return 'Hot Lead';
    if (score >= 55) return 'Warm Lead';
    if (score >= 35) return 'Cold Lead';
    return 'Unqualified';
  }

  /**
   * Determine priority rank
   */
  private static getPriorityRank(overallScore: number, seriousnessScore: number): 'High' | 'Medium' | 'Low' {
    if (overallScore >= 75 && seriousnessScore >= 70) return 'High';
    if (overallScore >= 55) return 'Medium';
    return 'Low';
  }

  /**
   * Estimate probability of deal closing
   */
  private static estimateCloseProbability(
    overallScore: number,
    seriousnessScore: number,
    previousInquiries: number
  ): number {
    let probability = overallScore * 0.6 + seriousnessScore * 0.4;

    // Adjust based on inquiry history
    if (previousInquiries >= 5) probability *= 1.1; // More inquiries = more serious
    if (previousInquiries === 0) probability *= 0.8; // First inquiry = less likely

    return Math.min(100, Math.round(probability));
  }

  /**
   * Qualify multiple buyers and rank them
   */
  static async qualifyAndRankBuyers(
    buyers: BuyerProfile[],
    businessData: any
  ): Promise<BuyerQualification[]> {
    const qualifications = await Promise.all(
      buyers.map(buyer => this.qualifyBuyer(buyer, businessData))
    );

    // Sort by overall score (descending)
    return qualifications.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Get buyer insights for seller dashboard
   */
  static async getBuyerInsights(sellerId: string): Promise<{
    totalInquiries: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    averageQualificationScore: number;
    topLeads: BuyerQualification[];
  }> {
    try {
      // Fetch inquiries for seller's listings
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('*, sender:profiles!sender_id(*)')
        .eq('recipient_id', sellerId)
        .order('created_at', { ascending: false });

      if (!inquiries || inquiries.length === 0) {
        return {
          totalInquiries: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          averageQualificationScore: 0,
          topLeads: [],
        };
      }

      // Qualify all buyers
      const qualifications: BuyerQualification[] = [];
      for (const inquiry of inquiries.slice(0, 50)) {
        const buyerProfile: BuyerProfile = {
          userId: inquiry.sender_id,
          name: inquiry.sender?.full_name,
          email: inquiry.sender?.email,
          phone: inquiry.sender?.phone,
          inquiryMessage: inquiry.message,
          previousInquiries: inquiries.filter(i => i.sender_id === inquiry.sender_id).length,
        };

        const qualification = await this.qualifyBuyer(buyerProfile, {
          id: inquiry.listing_id,
          price: inquiry.business?.price,
          industry: inquiry.business?.industry,
        });

        qualifications.push(qualification);
      }

      const hotLeads = qualifications.filter(q => q.qualificationLevel === 'Hot Lead').length;
      const warmLeads = qualifications.filter(q => q.qualificationLevel === 'Warm Lead').length;
      const coldLeads = qualifications.filter(q => q.qualificationLevel === 'Cold Lead').length;
      const avgScore = qualifications.reduce((sum, q) => sum + q.overallScore, 0) / qualifications.length;

      return {
        totalInquiries: inquiries.length,
        hotLeads,
        warmLeads,
        coldLeads,
        averageQualificationScore: Math.round(avgScore),
        topLeads: qualifications.slice(0, 10),
      };
    } catch (error) {
      console.error('Buyer insights error:', error);
      throw error;
    }
  }
}
