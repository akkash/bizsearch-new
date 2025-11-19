import { supabase } from './supabase';

export interface FranchiseFilters {
  industry?: string[];
  investmentMin?: number;
  investmentMax?: number;
  franchiseFeeMin?: number;
  franchiseFeeMax?: number;
  royaltyMin?: number;
  royaltyMax?: number;
  totalOutletsMin?: number;
  featured?: boolean;
  trending?: boolean;
  verified?: boolean;
  search?: string;
}

export interface FranchiseCreateInput {
  brand_name: string;
  industry: string;
  description: string;
  franchise_fee: number;
  total_investment_min?: number;
  total_investment_max?: number;
  royalty_percentage?: number;
  tagline?: string;
  brand_story?: string;
  logo_url?: string;
  images?: string[];
  highlights?: string[];
  support_provided?: string[];
  contact_email?: string;
  contact_phone?: string;
  // Add other fields as needed
  [key: string]: any;
}

export interface FranchiseUpdateInput extends Partial<FranchiseCreateInput> {
  status?: 'draft' | 'pending_review' | 'active' | 'sold' | 'inactive' | 'rejected';
}

export class FranchiseService {
  /**
   * Get all active franchises with optional filters
   */
  static async getFranchises(filters?: FranchiseFilters) {
    console.log('🍔 Fetching franchises with filters:', filters);
    
    try {
      // Use direct fetch as fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('🌐 Using direct fetch to:', `${supabaseUrl}/rest/v1/franchises?select=*&order=created_at.desc`);
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/franchises?select=*&order=created_at.desc`,
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
      console.log('✅ Franchises fetched via direct fetch:', data?.length || 0, 'franchises');
      return data;
    } catch (err) {
      console.error('❌ Exception in getFranchises:', err);
      throw err;
    }
  }

  /**
   * Get a single franchise by ID
   */
  static async getFranchiseById(id: string) {
    const { data, error } = await supabase
      .from('franchises')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get franchise by slug
   */
  static async getFranchiseBySlug(slug: string) {
    const { data, error } = await supabase
      .from('franchises')
      .select('*, profiles(*)')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get featured franchises
   */
  static async getFeaturedFranchises(limit = 10) {
    const { data, error } = await supabase
      .from('franchises')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get trending franchises
   */
  static async getTrendingFranchises(limit = 10) {
    const { data, error } = await supabase
      .from('franchises')
      .select('*')
      .eq('status', 'active')
      .eq('trending', true)
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Create a new franchise listing
   */
  static async createFranchise(userId: string, franchise: FranchiseCreateInput) {
    const { data, error } = await supabase
      .from('franchises')
      .insert({
        franchisor_id: userId,
        ...franchise,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a franchise listing
   */
  static async updateFranchise(franchiseId: string, updates: FranchiseUpdateInput) {
    const { data, error } = await supabase
      .from('franchises')
      .update(updates)
      .eq('id', franchiseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a franchise listing
   */
  static async deleteFranchise(franchiseId: string) {
    const { error } = await supabase
      .from('franchises')
      .delete()
      .eq('id', franchiseId);

    if (error) throw error;
  }

  /**
   * Get user's franchises
   */
  static async getUserFranchises(userId: string) {
    const { data, error } = await supabase
      .from('franchises')
      .select('*')
      .eq('franchisor_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Search franchises
   */
  static async searchFranchises(searchTerm: string, filters?: FranchiseFilters) {
    let query = supabase
      .from('franchises')
      .select('*')
      .eq('status', 'active')
      .or(`brand_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`);

    if (filters?.industry && filters.industry.length > 0) {
      query = query.in('industry', filters.industry);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Save/bookmark a franchise
   */
  static async saveFranchise(userId: string, franchiseId: string, notes?: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .insert({
        user_id: userId,
        listing_type: 'franchise',
        listing_id: franchiseId,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Unsave/unbookmark a franchise
   */
  static async unsaveFranchise(userId: string, franchiseId: string) {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_type', 'franchise')
      .eq('listing_id', franchiseId);

    if (error) throw error;
  }

  /**
   * Get user's saved franchises
   */
  static async getSavedFranchises(userId: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .select('*, franchises(*)')
      .eq('user_id', userId)
      .eq('listing_type', 'franchise')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Send inquiry about a franchise
   */
  static async sendInquiry(
    senderId: string,
    franchiseId: string,
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
        listing_type: 'franchise',
        listing_id: franchiseId,
        recipient_id: recipientId,
        message,
        subject,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment inquiries count (non-blocking, silent failure)
    try {
      const { data: franchise } = await supabase
        .from('franchises')
        .select('inquiries_count')
        .eq('id', franchiseId)
        .single();
      
      if (franchise) {
        const newCount = (franchise.inquiries_count || 0) + 1;
        await supabase
          .from('franchises')
          .update({ inquiries_count: newCount })
          .eq('id', franchiseId);
      }
    } catch (error) {
      // Silently fail - don't block inquiry creation
    }

    return data;
  }

  /**
   * Publish a draft franchise
   */
  static async publishFranchise(franchiseId: string) {
    const { data, error } = await supabase
      .from('franchises')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
      })
      .eq('id', franchiseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
