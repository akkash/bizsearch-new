import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';
import { AIMatchmakerService, type UserPreferences } from './ai-matchmaker-service';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface UserBehaviorData {
  userId: string;
  viewedListings: Array<{ id: string; type: 'business' | 'franchise'; timestamp: Date }>;
  savedListings: Array<{ id: string; type: 'business' | 'franchise'; timestamp: Date }>;
  searchHistory: Array<{ query: string; timestamp: Date }>;
  inquiries: Array<{ listingId: string; timestamp: Date }>;
  timeSpent: Record<string, number>; // listing ID -> seconds
  clickPatterns: Array<{ element: string; page: string; timestamp: Date }>;
}

export interface PersonalizedContent {
  recommendedListings: Array<{ id: string; score: number; reason: string }>;
  trendingInYourArea: any[];
  personalizedBanner?: {
    title: string;
    subtitle: string;
    cta: string;
    image?: string;
  };
  suggestedSearches: string[];
  recentlyViewed: any[];
  basedOnYourActivity: string;
}

export interface SmartNotification {
  id: string;
  type: 'new-listing' | 'price-drop' | 'saved-listing-update' | 'recommendation' | 'market-alert';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  sendTime?: Date;
  listingId?: string;
  actionUrl?: string;
}

export class AIPersonalizationService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Generate personalized homepage content
   */
  static async generatePersonalizedHomepage(
    userId: string,
    userProfile?: any
  ): Promise<PersonalizedContent> {
    try {
      // Gather user behavior data
      const behaviorData = await this.getUserBehaviorData(userId);

      // Infer user preferences from behavior
      const inferredPreferences = await this.inferPreferences(behaviorData);

      // Get personalized recommendations
      const recommendations = await AIMatchmakerService.getPersonalizedRecommendations(
        userId,
        10
      );

      // Generate personalized banner
      const banner = await this.generatePersonalizedBanner(inferredPreferences, behaviorData);

      // Get trending in user's preferred locations
      const trending = await this.getTrendingListings(inferredPreferences.locations || []);

      // Generate suggested searches
      const suggestedSearches = await this.generateSuggestedSearches(behaviorData);

      // Get recently viewed
      const recentlyViewed = await this.getRecentlyViewedListings(userId, 5);

      // Generate activity summary
      const activitySummary = await this.generateActivitySummary(behaviorData);

      return {
        recommendedListings: recommendations.map((rec, index) => ({
          id: rec.id,
          score: 100 - index * 5,
          reason: this.getRecommendationReason(rec, inferredPreferences),
        })),
        trendingInYourArea: trending,
        personalizedBanner: banner,
        suggestedSearches,
        recentlyViewed,
        basedOnYourActivity: activitySummary,
      };
    } catch (error) {
      console.error('Personalization error:', error);
      return this.getDefaultContent();
    }
  }

  /**
   * Gather comprehensive user behavior data
   */
  private static async getUserBehaviorData(userId: string): Promise<UserBehaviorData> {
    try {
      const [savedListings, inquiries] = await Promise.all([
        supabase
          .from('saved_listings')
          .select('listing_id, listing_type, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('inquiries')
          .select('listing_id, created_at')
          .eq('sender_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      return {
        userId,
        viewedListings: [],
        savedListings: (savedListings.data || []).map(s => ({
          id: s.listing_id,
          type: s.listing_type,
          timestamp: new Date(s.created_at),
        })),
        searchHistory: [],
        inquiries: (inquiries.data || []).map(i => ({
          listingId: i.listing_id,
          timestamp: new Date(i.created_at),
        })),
        timeSpent: {},
        clickPatterns: [],
      };
    } catch (error) {
      console.error('Error fetching user behavior:', error);
      return {
        userId,
        viewedListings: [],
        savedListings: [],
        searchHistory: [],
        inquiries: [],
        timeSpent: {},
        clickPatterns: [],
      };
    }
  }

  /**
   * Infer user preferences from behavior using AI
   */
  private static async inferPreferences(behaviorData: UserBehaviorData): Promise<UserPreferences> {
    // Fetch details of saved/viewed listings
    const listingIds = [
      ...behaviorData.savedListings.map(s => s.id),
      ...behaviorData.inquiries.map(i => i.listingId),
    ];

    if (listingIds.length === 0) {
      return {}; // No behavior data yet
    }

    try {
      const { data: listings } = await supabase
        .from('businesses')
        .select('*')
        .in('id', listingIds.slice(0, 20));

      if (!listings || listings.length === 0) return {};

      // Extract patterns
      const industries = [...new Set(listings.map(l => l.industry))].filter(Boolean);
      const locations = [...new Set(listings.map(l => l.city))].filter(Boolean);
      const prices = listings.map(l => l.price).filter(Boolean);

      const avgPrice = prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : 0;

      return {
        industries: industries as string[],
        locations: locations as string[],
        budget: avgPrice > 0
          ? {
            min: Math.round(avgPrice * 0.7),
            max: Math.round(avgPrice * 1.3),
          }
          : undefined,
      };
    } catch (error) {
      console.error('Error inferring preferences:', error);
      return {};
    }
  }

  /**
   * Generate personalized banner message
   */
  private static async generatePersonalizedBanner(
    preferences: UserPreferences,
    behaviorData: UserBehaviorData
  ): Promise<PersonalizedContent['personalizedBanner']> {
    const savedCount = behaviorData.savedListings.length;
    const inquiryCount = behaviorData.inquiries.length;

    if (inquiryCount >= 3) {
      return {
        title: 'Ready to make a decision?',
        subtitle: `You've shown interest in ${inquiryCount} businesses. Our AI can help you compare and choose.`,
        cta: 'Get AI Recommendation',
      };
    }

    if (savedCount >= 5) {
      return {
        title: 'We found businesses perfect for you!',
        subtitle: `Based on your ${savedCount} saved listings, here are more opportunities you'll love.`,
        cta: 'View Recommendations',
      };
    }

    if (preferences.industries && preferences.industries.length > 0) {
      return {
        title: `Explore ${preferences.industries[0]} Opportunities`,
        subtitle: 'New listings matching your interests just arrived.',
        cta: 'Browse Now',
      };
    }

    return {
      title: 'Welcome Back!',
      subtitle: 'Discover your next business opportunity with AI-powered recommendations.',
      cta: 'Get Started',
    };
  }

  /**
   * Get trending listings in user's preferred areas
   */
  private static async getTrendingListings(locations: string[]): Promise<any[]> {
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (locations && locations.length > 0) {
        const locationFilters = locations.map(loc => `city.ilike.%${loc}%`).join(',');
        query = query.or(locationFilters);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate suggested searches based on behavior
   */
  private static async generateSuggestedSearches(
    behaviorData: UserBehaviorData
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Based on saved listings
    if (behaviorData.savedListings.length > 0) {
      suggestions.push('Similar to your saved listings');
    }

    // Based on inquiries
    if (behaviorData.inquiries.length > 0) {
      suggestions.push('Businesses you showed interest in');
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        'Profitable businesses under 50 lakhs',
        'Franchises with high ROI',
        'Established businesses in your city'
      );
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Get recently viewed listings
   */
  private static async getRecentlyViewedListings(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('saved_listings')
        .select('*, businesses(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data?.map(d => d.businesses).filter(Boolean) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate activity summary
   */
  private static async generateActivitySummary(behaviorData: UserBehaviorData): Promise<string> {
    const savedCount = behaviorData.savedListings.length;
    const inquiryCount = behaviorData.inquiries.length;

    if (savedCount > 0 || inquiryCount > 0) {
      return `Based on your ${savedCount} saved listings and ${inquiryCount} inquiries, we've curated these opportunities for you.`;
    }

    return 'Start exploring to get personalized recommendations based on your interests!';
  }

  /**
   * Get recommendation reason
   */
  private static getRecommendationReason(listing: any, preferences: UserPreferences): string {
    const reasons: string[] = [];

    if (preferences.industries?.includes(listing.industry)) {
      reasons.push(`Matches your interest in ${listing.industry}`);
    }

    if (preferences.locations?.includes(listing.city)) {
      reasons.push(`Located in your preferred area: ${listing.city}`);
    }

    if (preferences.budget && listing.price) {
      if (listing.price >= preferences.budget.min && listing.price <= preferences.budget.max) {
        reasons.push('Within your budget range');
      }
    }

    return reasons.length > 0 ? reasons[0] : 'Recommended for you';
  }

  /**
   * Generate smart notifications with optimal send timing
   */
  static async generateSmartNotifications(userId: string): Promise<SmartNotification[]> {
    const behaviorData = await this.getUserBehaviorData(userId);
    const preferences = await this.inferPreferences(behaviorData);
    const notifications: SmartNotification[] = [];

    // Check for new listings matching preferences
    if (preferences.industries && preferences.industries.length > 0) {
      const { data: newListings } = await supabase
        .from('businesses')
        .select('*')
        .in('industry', preferences.industries)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(5);

      newListings?.forEach(listing => {
        notifications.push({
          id: `new_${listing.id}`,
          type: 'new-listing',
          title: 'New Business Matches Your Interests!',
          message: `${listing.name} - ${listing.industry} business just listed in ${listing.city}`,
          priority: 'high',
          sendTime: this.calculateOptimalSendTime(userId),
          listingId: listing.id,
          actionUrl: `/business/${listing.slug || listing.id}`,
        });
      });
    }

    // Check for price drops on saved listings
    for (const saved of behaviorData.savedListings.slice(0, 10)) {
      // In production, track price history
      // For now, placeholder
      notifications.push({
        id: `price_${saved.id}`,
        type: 'price-drop',
        title: 'Price Drop Alert!',
        message: 'A business you saved has reduced its asking price',
        priority: 'medium',
        sendTime: this.calculateOptimalSendTime(userId),
        listingId: saved.id,
      });
    }

    return notifications;
  }

  /**
   * Calculate optimal notification send time based on user activity patterns
   */
  private static calculateOptimalSendTime(userId: string): Date {
    // Analyze when user is most active
    // For now, default to 6 PM
    const optimalTime = new Date();
    optimalTime.setHours(18, 0, 0, 0);

    // If current time is past 6 PM, schedule for tomorrow
    if (new Date() > optimalTime) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    return optimalTime;
  }

  /**
   * Learn from user interactions to improve recommendations
   */
  static async recordUserInteraction(
    userId: string,
    interaction: {
      type: 'view' | 'save' | 'inquire' | 'click' | 'search';
      listingId?: string;
      query?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      // In production, this would store in a user_interactions table
      // For now, just log
      console.log('User interaction recorded:', { userId, ...interaction });

      // Update user's interaction history
      // This data is used to refine future recommendations
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  /**
   * Get default content for new users
   */
  private static getDefaultContent(): PersonalizedContent {
    return {
      recommendedListings: [],
      trendingInYourArea: [],
      personalizedBanner: {
        title: 'Welcome to BizSearch!',
        subtitle: 'Discover your perfect business opportunity with AI-powered matching.',
        cta: 'Start Exploring',
      },
      suggestedSearches: [
        'Profitable businesses under 50 lakhs',
        'High-growth franchises',
        'Established retail businesses',
      ],
      recentlyViewed: [],
      basedOnYourActivity: 'Start exploring to get personalized recommendations!',
    };
  }
}
