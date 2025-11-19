import { supabase } from './supabase';

export interface BusinessFilters {
  industry?: string[];
  city?: string[];
  state?: string[];
  priceMin?: number;
  priceMax?: number;
  revenueMin?: number;
  revenueMax?: number;
  employeesMin?: number;
  employeesMax?: number;
  establishedYearMin?: number;
  establishedYearMax?: number;
  featured?: boolean;
  trending?: boolean;
  verified?: boolean;
  search?: string;
}

export interface BusinessCreateInput {
  name: string;
  industry: string;
  description: string;
  city: string;
  state: string;
  country?: string;
  location: string;
  full_address?: string;
  price: number;
  revenue?: number;
  established_year?: number;
  employees?: number;
  business_type?: 'asset_sale' | 'stock_sale' | 'franchise';
  tagline?: string;
  business_model?: string;
  images?: string[];
  logo_url?: string;
  highlights?: string[];
  contact_email?: string;
  contact_phone?: string;
  operating_hours?: string;
  days_open_per_week?: number;
  // Add other fields as needed
  [key: string]: any;
}

export interface BusinessUpdateInput extends Partial<BusinessCreateInput> {
  status?: 'draft' | 'pending_review' | 'active' | 'sold' | 'inactive' | 'rejected';
}

export class BusinessService {
  /**
   * Get all active businesses with optional filters
   */
  static async getBusinesses(filters?: BusinessFilters) {
    console.log('🏪 Fetching businesses with filters:', filters);
    
    try {
      // Try direct fetch as fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('🌐 Using direct fetch to:', `${supabaseUrl}/rest/v1/businesses?select=*&order=created_at.desc`);
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/businesses?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Businesses fetched via direct fetch:', data?.length || 0, 'businesses');
      return data;
    } catch (err) {
      console.error('❌ Exception in getBusinesses:', err);
      throw err;
    }
  }

  /**
   * Get a single business by ID
   */
  static async getBusinessById(id: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Get business by slug
   */
  static async getBusinessBySlug(slug: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, profiles(*)')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get featured businesses
   */
  static async getFeaturedBusinesses(limit = 10) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get trending businesses
   */
  static async getTrendingBusinesses(limit = 10) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .eq('trending', true)
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Create a new business listing
   */
  static async createBusiness(userId: string, business: BusinessCreateInput) {
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        seller_id: userId,
        ...business,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a business listing
   */
  static async updateBusiness(businessId: string, updates: BusinessUpdateInput) {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a business listing
   */
  static async deleteBusiness(businessId: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;
  }

  /**
   * Get user's businesses
   */
  static async getUserBusinesses(userId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Search businesses by text
   */
  static async searchBusinesses(searchTerm: string, filters?: BusinessFilters) {
    let query = supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`);

    if (filters) {
      // Apply additional filters
      if (filters.industry && filters.industry.length > 0) {
        query = query.in('industry', filters.industry);
      }
      if (filters.city && filters.city.length > 0) {
        query = query.in('city', filters.city);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Save/bookmark a business
   */
  static async saveBusiness(userId: string, businessId: string, notes?: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .insert({
        user_id: userId,
        listing_type: 'business',
        listing_id: businessId,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Unsave/unbookmark a business
   */
  static async unsaveBusiness(userId: string, businessId: string) {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_type', 'business')
      .eq('listing_id', businessId);

    if (error) throw error;
  }

  /**
   * Get user's saved businesses
   */
  static async getSavedBusinesses(userId: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .select('*, businesses(*)')
      .eq('user_id', userId)
      .eq('listing_type', 'business')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Check if business is saved by user
   */
  static async isBusinessSaved(userId: string, businessId: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_type', 'business')
      .eq('listing_id', businessId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  /**
   * Send inquiry about a business
   */
  static async sendInquiry(
    senderId: string,
    businessId: string,
    recipientId: string,
    message: string,
    subject?: string,
    contactEmail?: string,
    contactPhone?: string
  ) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        sender_id: senderId,
        listing_type: 'business',
        listing_id: businessId,
        recipient_id: recipientId,
        message,
        subject,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment inquiries count
    await supabase
      .from('businesses')
      .update({ inquiries_count: supabase.rpc('increment', { x: 1 }) })
      .eq('id', businessId);

    return data;
  }

  /**
   * Get inquiries for a business
   */
  static async getBusinessInquiries(businessId: string, userId: string) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, sender:profiles!sender_id(*)')
      .eq('listing_type', 'business')
      .eq('listing_id', businessId)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get businesses by industry
   */
  static async getBusinessesByIndustry(industry: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active')
      .eq('industry', industry)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get businesses by location
   */
  static async getBusinessesByLocation(city?: string, state?: string) {
    let query = supabase
      .from('businesses')
      .select('*')
      .eq('status', 'active');

    if (city) {
      query = query.eq('city', city);
    }
    if (state) {
      query = query.eq('state', state);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Publish a draft business
   */
  static async publishBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark business as sold
   */
  static async markAsSold(businessId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
