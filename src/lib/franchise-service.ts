import { supabase } from './supabase';
import { isUUID, sanitizeSlug } from './slug-utils';

export interface FranchiseFilters {
  industry?: string[];
  state?: string[];
  franchiseFeeMin?: number;
  franchiseFeeMax?: number;
  investmentMin?: number;
  investmentMax?: number;
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
  headquarters_state?: string;
  headquarters_city?: string;
  headquarters_country?: string;
  franchise_fee: number;
  total_investment_min?: number;
  total_investment_max?: number;
  royalty_percentage?: number;
  marketing_fee_percentage?: number;
  established_year?: number;
  total_outlets?: number;
  company_owned_outlets?: number;
  franchise_outlets?: number;
  space_required_sqft?: number;
  tagline?: string;
  brand_story?: string;
  operating_locations?: string[];
  expansion_territories?: string[];
  support_provided?: string[];
  images?: string[];
  logo_url?: string;
  highlights?: string[];
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  website?: string;
  training_provided?: boolean;
  training_duration_days?: number;
  marketing_support?: boolean;
  minimum_net_worth?: number;
  minimum_liquid_capital?: number;
  experience_required?: string;
  average_unit_revenue?: number;
  average_unit_profit?: number;
  payback_period_months?: number;
  expected_roi_percentage?: number;
  // Add other fields as needed
  [key: string]: any;
}

export interface FranchiseUpdateInput extends Partial<FranchiseCreateInput> {
  status?: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected';
}

export class FranchiseService {
  /**
   * Get all active franchises with optional filters
   */
  static async getFranchises(filters?: FranchiseFilters) {
    console.log('🏪 Fetching franchises with filters:', filters);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
      console.log('✅ Franchises fetched:', data?.length || 0, 'franchises');
      return data;
    } catch (err) {
      console.error('❌ Exception in getFranchises:', err);
      throw err;
    }
  }

  /**
   * Get a single franchise by ID (UUID) - using direct fetch
   */
  static async getFranchiseById(id: string) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('🔍 Fetching franchise by ID:', id);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/franchises?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Franchise not found');
    }

    console.log('✅ Franchise fetched by ID:', data[0]?.brand_name);
    return data[0];
  }

  /**
   * Get franchise by slug - using direct fetch
   */
  static async getFranchiseBySlug(slug: string) {
    const sanitized = sanitizeSlug(slug);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('🔍 Fetching franchise by slug:', sanitized);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/franchises?slug=eq.${encodeURIComponent(sanitized)}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Franchise not found');
    }

    console.log('✅ Franchise fetched by slug:', data[0]?.brand_name);
    return data[0];
  }

  /**
   * Get franchise by ID or Slug (auto-detects which one)
   * Use this method for route handlers that accept both UUID and slug
   */
  static async getFranchiseByIdOrSlug(identifier: string) {
    // Add timeout to prevent infinite loading (15 seconds for better reliability)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 15000);
    });

    console.log('🔍 Fetching franchise by identifier:', identifier, 'isUUID:', isUUID(identifier));

    const fetchPromise = isUUID(identifier)
      ? this.getFranchiseById(identifier)
      : this.getFranchiseBySlug(identifier);

    try {
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error fetching franchise:', error);
      throw error;
    }
  }

  /**
   * Get featured franchises - using direct fetch
   */
  static async getFeaturedFranchises(limit = 10) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('🌟 Fetching featured franchises...');

    const response = await fetch(
      `${supabaseUrl}/rest/v1/franchises?select=*&status=eq.active&featured=eq.true&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Featured franchises fetched:', data?.length || 0);
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
        status: 'pending_review', // Start as pending review
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
   * Submit franchise for review
   */
  static async submitForReview(franchiseId: string) {
    return this.updateFranchise(franchiseId, {
      status: 'pending_review',
    });
  }

  /**
   * Publish a franchise (admin action)
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

  /**
   * Increment view count
   */
  static async incrementViews(franchiseId: string) {
    const { error } = await supabase.rpc('increment_franchise_views', {
      franchise_id: franchiseId,
    });

    if (error) console.error('Error incrementing views:', error);
  }
}
