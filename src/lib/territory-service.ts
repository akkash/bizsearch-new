import { supabase } from './supabase';

export interface SavedTerritory {
  id: string;
  user_id: string;
  territory_id: string;
  notes: string | null;
  created_at: string;
}

export interface TerritoryComparison {
  id: string;
  user_id: string;
  territory_ids: string[];
  comparison_name: string;
  created_at: string;
  updated_at: string;
}

export interface TerritoryRequest {
  id: string;
  user_id: string;
  territory_id: string;
  franchise_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TerritoryWaitlist {
  id: string;
  user_id: string;
  territory_id: string;
  franchise_id: string;
  priority: number;
  notify_on_available: boolean;
  created_at: string;
}

export class TerritoryService {
  /**
   * Save a territory as favorite
   */
  static async saveTerritory(territoryId: string, userId: string, notes?: string): Promise<SavedTerritory> {
    const { data, error } = await supabase
      .from('saved_territories')
      .insert({
        user_id: userId,
        territory_id: territoryId,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get saved territories for user
   */
  static async getSavedTerritories(userId: string): Promise<SavedTerritory[]> {
    const { data, error } = await supabase
      .from('saved_territories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Remove saved territory
   */
  static async unsaveTerritory(territoryId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_territories')
      .delete()
      .eq('territory_id', territoryId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Create territory comparison
   */
  static async createComparison(
    userId: string,
    territoryIds: string[],
    name: string
  ): Promise<TerritoryComparison> {
    const { data, error } = await supabase
      .from('territory_comparisons')
      .insert({
        user_id: userId,
        territory_ids: territoryIds,
        comparison_name: name,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's territory comparisons
   */
  static async getComparisons(userId: string): Promise<TerritoryComparison[]> {
    const { data, error } = await supabase
      .from('territory_comparisons')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Delete comparison
   */
  static async deleteComparison(comparisonId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('territory_comparisons')
      .delete()
      .eq('id', comparisonId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Request territory information
   */
  static async requestTerritoryInfo(
    userId: string,
    territoryId: string,
    franchiseId: string,
    message: string
  ): Promise<TerritoryRequest> {
    const { data, error } = await supabase
      .from('territory_requests')
      .insert({
        user_id: userId,
        territory_id: territoryId,
        franchise_id: franchiseId,
        message: message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's territory requests
   */
  static async getTerritoryRequests(userId: string): Promise<TerritoryRequest[]> {
    const { data, error } = await supabase
      .from('territory_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Join territory waitlist
   */
  static async joinWaitlist(
    userId: string,
    territoryId: string,
    franchiseId: string,
    notifyOnAvailable: boolean = true
  ): Promise<TerritoryWaitlist> {
    // Get current waitlist count for priority
    const { count } = await supabase
      .from('territory_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('territory_id', territoryId);

    const { data, error } = await supabase
      .from('territory_waitlist')
      .insert({
        user_id: userId,
        territory_id: territoryId,
        franchise_id: franchiseId,
        priority: (count || 0) + 1,
        notify_on_available: notifyOnAvailable,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get waitlist position
   */
  static async getWaitlistPosition(userId: string, territoryId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('territory_waitlist')
      .select('priority')
      .eq('territory_id', territoryId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data?.priority || null;
  }

  /**
   * Leave waitlist
   */
  static async leaveWaitlist(userId: string, territoryId: string): Promise<void> {
    const { error } = await supabase
      .from('territory_waitlist')
      .delete()
      .eq('territory_id', territoryId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
