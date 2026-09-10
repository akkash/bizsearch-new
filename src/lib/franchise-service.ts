import { supabase } from './supabase';
import { isUUID, sanitizeSlug } from './slug-utils';
import { mapFranchiseFromDb, mapFranchisesFromDb } from './franchise-mapper';
import type { Franchise } from '@/types/listings';

export { mapFranchiseFromDb, mapFranchisesFromDb } from './franchise-mapper';

/** @deprecated Use mapFranchiseFromDb */
export const normalizeFranchise = mapFranchiseFromDb;

export interface FranchiseFilters {
  industry?: string[];
  state?: string[];
  city?: string[];
  franchiseFeeMin?: number;
  franchiseFeeMax?: number;
  investmentMin?: number;
  investmentMax?: number;
  royaltyMin?: number;
  royaltyMax?: number;
  spaceMax?: number;
  verificationStatus?: string[];
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
  space_required_sqft?: number; // Legacy field, prefer store_formats
  // Store formats for multiple outlet types (Kiosk, Express, Standard, etc.)
  store_formats?: {
    id: string;
    name: string;
    minSqft: number;
    maxSqft: number;
    investmentMin?: number;
    investmentMax?: number;
    description?: string;
  }[];
  tagline?: string;
  brand_story?: string;
  operating_locations?: string[];
  expansion_territories?: string[];
  support_provided?: string[];
  images?: string[];
  videos?: { id: string; name: string; url: string; type: string; size: number }[];
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
  private static buildPublicFranchisesQuery(filters?: FranchiseFilters): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('status', 'eq.active');
    params.set('order', 'created_at.desc');

    if (filters?.featured) params.set('featured', 'eq.true');
    if (filters?.trending) params.set('trending', 'eq.true');
    if (filters?.verified) params.set('verified', 'eq.true');
    if (filters?.verificationStatus?.length === 1) {
      params.set('verification_status', `eq.${filters.verificationStatus[0]}`);
    }
    if (filters?.investmentMin != null) {
      params.set('total_investment_min', `gte.${filters.investmentMin}`);
    }
    if (filters?.investmentMax != null) {
      params.set('total_investment_max', `lte.${filters.investmentMax}`);
    }
    if (filters?.franchiseFeeMin != null) {
      params.set('franchise_fee', `gte.${filters.franchiseFeeMin}`);
    }
    if (filters?.franchiseFeeMax != null) {
      params.set('franchise_fee', `lte.${filters.franchiseFeeMax}`);
    }
    if (filters?.industry?.length === 1) {
      params.set('industry', `ilike.*${filters.industry[0]}*`);
    }
    if (filters?.state?.length === 1) {
      params.set('headquarters_state', `ilike.*${filters.state[0]}*`);
    }
    if (filters?.search?.trim()) {
      const term = encodeURIComponent(`*${filters.search.trim()}*`);
      params.set('or', `(brand_name.ilike.${term},description.ilike.${term},industry.ilike.${term})`);
    }

    return `${supabaseUrl}/rest/v1/franchises?${params.toString()}`;
  }

  static async getFranchises(filters?: FranchiseFilters): Promise<Franchise[]> {
    console.log('🏪 Fetching active franchises with filters:', filters);

    try {
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const url = this.buildPublicFranchisesQuery(filters);

      const response = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let rows = Array.isArray(data) ? data : [];

      if (filters?.industry && filters.industry.length > 1) {
        const industries = filters.industry.map((i) => i.toLowerCase());
        rows = rows.filter((row: Record<string, unknown>) =>
          industries.some((ind) => String(row.industry || '').toLowerCase().includes(ind))
        );
      }

      console.log('✅ Franchises fetched:', rows.length, 'active franchises');
      return mapFranchisesFromDb(rows);
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
    return mapFranchiseFromDb(data[0]);
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
    return mapFranchiseFromDb(data[0]);
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
   * Public marketplace fetch — active listings only unless viewer owns the listing.
   */
  static async getPublicFranchiseByIdOrSlug(
    identifier: string,
    viewerUserId?: string
  ): Promise<Franchise | null> {
    try {
      const franchise = (await this.getFranchiseByIdOrSlug(identifier)) as Franchise;
      if (franchise.status === 'active') return franchise;
      const ownerId = franchise.franchisorId || franchise.franchisor_id || franchise.owner_id;
      if (viewerUserId && ownerId === viewerUserId) return franchise;
      return null;
    } catch {
      return null;
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
    let rows = Array.isArray(data) ? data : [];

    if (rows.length === 0) {
      const fallback = await fetch(
        `${supabaseUrl}/rest/v1/franchises?select=*&status=eq.active&order=created_at.desc&limit=${limit}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (fallback.ok) {
        rows = await fallback.json();
      }
    }

    console.log('✅ Featured franchises fetched:', rows.length);
    return mapFranchisesFromDb(rows.slice(0, limit));
  }

  /**
   * Create a new franchise listing
   */
  static async createFranchise(userId: string, franchise: FranchiseCreateInput) {
    const payload = {
      franchisor_id: userId,
      ...franchise,
      status: 'pending_review' as const,
    };

    const { data, error } = await supabase
      .from('franchises')
      .insert(payload)
      .select()
      .single();

    if (
      error &&
      (error.code === 'PGRST204' ||
        [
          'property_type',
          'min_area_sqft',
          'max_area_sqft',
          'owner_operator_required',
          'opening_timeline',
          'preferred_cities',
          'preferred_experience',
          'ground_floor',
          'parking_required',
          'max_rent',
          'frontage_ft',
        ].some((col) => error.message?.includes(col)))
    ) {
      const fallback = { ...payload } as Record<string, unknown>;
      delete fallback.property_type;
      delete fallback.min_area_sqft;
      delete fallback.max_area_sqft;
      delete fallback.owner_operator_required;
      delete fallback.opening_timeline;
      delete fallback.preferred_cities;
      delete fallback.preferred_experience;
      delete fallback.ground_floor;
      delete fallback.parking_required;
      delete fallback.max_rent;
      delete fallback.frontage_ft;
      const retry = await supabase.from('franchises').insert(fallback).select().single();
      if (retry.error) throw retry.error;
      return retry.data;
    }

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
    return mapFranchisesFromDb(data || []);
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
