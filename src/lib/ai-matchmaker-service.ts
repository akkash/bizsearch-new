import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface UserPreferences {
  budget?: { min: number; max: number };
  industries?: string[];
  locations?: string[];
  experience?: string[];
  investmentGoals?: string;
  riskTolerance?: 'low' | 'medium' | 'high';
  timeCommitment?: 'part-time' | 'full-time';
  skills?: string[];
}

export interface BusinessMatch {
  businessId: string;
  business: any;
  matchScore: number;
  matchReasons: string[];
  concerns: string[];
  aiRecommendation: string;
}

export class AIMatchmakerService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Find and rank businesses that match user preferences using AI
   */
  static async findMatches(
    userPreferences: UserPreferences,
    userProfile?: any
  ): Promise<BusinessMatch[]> {
    try {
      // Fetch all active businesses
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!businesses || businesses.length === 0) {
        return [];
      }

      // Filter by budget if provided
      let filteredBusinesses = businesses;
      if (userPreferences.budget) {
        filteredBusinesses = businesses.filter(b => {
          const price = b.price || 0;
          return price >= (userPreferences.budget!.min || 0) && 
                 price <= (userPreferences.budget!.max || Infinity);
        });
      }

      // Filter by industry if provided
      if (userPreferences.industries && userPreferences.industries.length > 0) {
        filteredBusinesses = filteredBusinesses.filter(b =>
          userPreferences.industries!.some(ind =>
            b.industry?.toLowerCase().includes(ind.toLowerCase())
          )
        );
      }

      // Filter by location if provided
      if (userPreferences.locations && userPreferences.locations.length > 0) {
        filteredBusinesses = filteredBusinesses.filter(b =>
          userPreferences.locations!.some(loc =>
            b.city?.toLowerCase().includes(loc.toLowerCase()) ||
            b.state?.toLowerCase().includes(loc.toLowerCase())
          )
        );
      }

      // Use AI to score and rank businesses
      const matches: BusinessMatch[] = [];

      for (const business of filteredBusinesses.slice(0, 20)) {
        try {
          const matchAnalysis = await this.analyzeMatch(business, userPreferences, userProfile);
          if (matchAnalysis.matchScore >= 60) {
            matches.push({
              businessId: business.id,
              business,
              ...matchAnalysis,
            });
          }
        } catch (err) {
          console.error('Error analyzing business match:', err);
        }
      }

      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches.slice(0, 10); // Return top 10 matches
    } catch (error) {
      console.error('Matchmaker error:', error);
      throw error;
    }
  }

  /**
   * Use AI to analyze how well a business matches user preferences
   */
  private static async analyzeMatch(
    business: any,
    preferences: UserPreferences,
    userProfile?: any
  ): Promise<Omit<BusinessMatch, 'businessId' | 'business'>> {
    const prompt = `As an AI business matchmaker, analyze how well this business matches the buyer's profile:

BUSINESS:
- Name: ${business.name}
- Industry: ${business.industry}
- Location: ${business.city}, ${business.state}
- Price: ₹${business.price?.toLocaleString() || 'N/A'}
- Revenue: ₹${business.revenue?.toLocaleString() || 'N/A'}
- Employees: ${business.employees || 'N/A'}
- Description: ${business.description?.substring(0, 300)}

BUYER PREFERENCES:
- Budget: ₹${preferences.budget?.min?.toLocaleString() || 0} - ₹${preferences.budget?.max?.toLocaleString() || 'unlimited'}
- Interested Industries: ${preferences.industries?.join(', ') || 'Any'}
- Preferred Locations: ${preferences.locations?.join(', ') || 'Any'}
- Experience: ${preferences.experience?.join(', ') || 'N/A'}
- Investment Goals: ${preferences.investmentGoals || 'N/A'}
- Risk Tolerance: ${preferences.riskTolerance || 'medium'}
- Time Commitment: ${preferences.timeCommitment || 'N/A'}
- Skills: ${preferences.skills?.join(', ') || 'N/A'}

Provide your analysis in this EXACT JSON format (no markdown, no code blocks):
{
  "matchScore": <number 0-100>,
  "matchReasons": ["reason 1", "reason 2", "reason 3"],
  "concerns": ["concern 1", "concern 2"],
  "aiRecommendation": "<one paragraph recommendation>"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(cleanText);
      
      return {
        matchScore: Math.min(100, Math.max(0, analysis.matchScore || 50)),
        matchReasons: analysis.matchReasons || [],
        concerns: analysis.concerns || [],
        aiRecommendation: analysis.aiRecommendation || 'Further analysis recommended.',
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic scoring
      return this.basicMatch(business, preferences);
    }
  }

  /**
   * Fallback basic matching algorithm
   */
  private static basicMatch(
    business: any,
    preferences: UserPreferences
  ): Omit<BusinessMatch, 'businessId' | 'business'> {
    let score = 50; // Base score
    const reasons: string[] = [];
    const concerns: string[] = [];

    // Budget match
    if (preferences.budget) {
      const price = business.price || 0;
      if (price >= preferences.budget.min && price <= preferences.budget.max) {
        score += 20;
        reasons.push('Price within budget');
      } else {
        concerns.push('Price outside preferred budget range');
      }
    }

    // Industry match
    if (preferences.industries && preferences.industries.length > 0) {
      const hasIndustryMatch = preferences.industries.some(ind =>
        business.industry?.toLowerCase().includes(ind.toLowerCase())
      );
      if (hasIndustryMatch) {
        score += 15;
        reasons.push('Matches industry preference');
      }
    }

    // Location match
    if (preferences.locations && preferences.locations.length > 0) {
      const hasLocationMatch = preferences.locations.some(loc =>
        business.city?.toLowerCase().includes(loc.toLowerCase()) ||
        business.state?.toLowerCase().includes(loc.toLowerCase())
      );
      if (hasLocationMatch) {
        score += 15;
        reasons.push('In preferred location');
      }
    }

    return {
      matchScore: Math.min(100, score),
      matchReasons: reasons.length > 0 ? reasons : ['Basic compatibility'],
      concerns: concerns.length > 0 ? concerns : [],
      aiRecommendation: `This business has a ${score}% compatibility match with your profile. ${reasons.join('. ')}.`,
    };
  }

  /**
   * Get personalized recommendations based on user activity
   */
  static async getPersonalizedRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      // Get user's saved businesses and inquiries to understand preferences
      const { data: savedListings } = await supabase
        .from('saved_listings')
        .select('*, businesses(*)')
        .eq('user_id', userId)
        .eq('listing_type', 'business');

      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('*, businesses(*)')
        .eq('sender_id', userId)
        .eq('listing_type', 'business');

      // Extract preferences from user behavior
      const viewedBusinesses = [
        ...(savedListings || []).map(s => s.businesses),
        ...(inquiries || []).map(i => i.businesses),
      ].filter(Boolean);

      // Infer preferences
      const industries = [...new Set(viewedBusinesses.map(b => b.industry))];
      const cities = [...new Set(viewedBusinesses.map(b => b.city))];
      const avgPrice = viewedBusinesses.reduce((sum, b) => sum + (b.price || 0), 0) / viewedBusinesses.length || 0;

      const inferredPreferences: UserPreferences = {
        industries: industries as string[],
        locations: cities as string[],
        budget: {
          min: avgPrice * 0.7,
          max: avgPrice * 1.3,
        },
      };

      // Get matches
      const matches = await this.findMatches(inferredPreferences);
      
      return matches.slice(0, limit).map(m => m.business);
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  }
}
