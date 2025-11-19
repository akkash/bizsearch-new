import { supabase } from '@/lib/supabase';

export interface SavedListing {
  id: string;
  user_id: string;
  listing_type: 'business' | 'franchise';
  listing_id: string;
  notes?: string;
  created_at: string;
}

export interface SavedListingWithDetails extends SavedListing {
  listing?: any;
}

export class SavedListingsService {
  /**
   * Get all saved listings for a user
   */
  static async getSavedListings(userId: string): Promise<SavedListingWithDetails[]> {
    try {
      console.log('📥 Fetching saved listings for user:', userId);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/saved_listings?user_id=eq.${userId}&select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedListings = await response.json();
      console.log('✅ Saved listings fetched:', savedListings.length);
      
      // Fetch details for each listing
      const listingsWithDetails = await Promise.all(
        savedListings.map(async (saved: SavedListing) => {
          const details = await this.getListingDetails(saved.listing_type, saved.listing_id);
          return {
            ...saved,
            listing: details
          };
        })
      );
      
      return listingsWithDetails;
    } catch (error) {
      console.error('❌ Error fetching saved listings:', error);
      throw error;
    }
  }

  /**
   * Get listing details
   */
  private static async getListingDetails(listingType: 'business' | 'franchise', listingId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const table = listingType === 'business' ? 'businesses' : 'franchises';
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/${table}?id=eq.${listingId}&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Error fetching listing details:', error);
      return null;
    }
  }

  /**
   * Save a listing
   */
  static async saveListing(
    userId: string,
    listingType: 'business' | 'franchise',
    listingId: string,
    notes?: string
  ): Promise<SavedListing> {
    const { data, error } = await supabase
      .from('saved_listings')
      .insert({
        user_id: userId,
        listing_type: listingType,
        listing_id: listingId,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Unsave a listing
   */
  static async unsaveListing(
    userId: string,
    listingType: 'business' | 'franchise',
    listingId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_type', listingType)
      .eq('listing_id', listingId);

    if (error) throw error;
  }

  /**
   * Check if a listing is saved
   */
  static async isListingSaved(
    userId: string,
    listingType: 'business' | 'franchise',
    listingId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_type', listingType)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  /**
   * Update notes for a saved listing
   */
  static async updateNotes(
    userId: string,
    listingType: 'business' | 'franchise',
    listingId: string,
    notes: string
  ): Promise<void> {
    const { error } = await supabase
      .from('saved_listings')
      .update({ notes })
      .eq('user_id', userId)
      .eq('listing_type', listingType)
      .eq('listing_id', listingId);

    if (error) throw error;
  }

  /**
   * Get saved listings count
   */
  static async getSavedListingsCount(userId: string): Promise<number> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/saved_listings?user_id=eq.${userId}&select=count`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        }
      );
      
      if (!response.ok) {
        return 0;
      }
      
      const countHeader = response.headers.get('content-range');
      if (countHeader) {
        const count = parseInt(countHeader.split('/')[1] || '0');
        return count;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Error fetching saved listings count:', error);
      return 0;
    }
  }
}
