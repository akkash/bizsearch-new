import { supabase } from './supabase';

export interface FranchiseLocation {
  id: string;
  franchise_id: string;
  location_name: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  status: 'operating' | 'looking_for_franchise';
  opening_date: string | null;
  closing_date: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FranchiseTerritory {
  id: string;
  franchise_id: string;
  territory_name: string;
  city: string | null;
  state: string;
  zip_codes: string[] | null;
  country: string;
  territory_bounds: any | null; // GeoJSON
  center_latitude: number | null;
  center_longitude: number | null;
  status: 'available' | 'reserved' | 'occupied' | 'restricted';
  franchise_fee: number | null;
  estimated_investment_min: number | null;
  estimated_investment_max: number | null;
  population: number | null;
  median_income: number | null;
  competition_level: string | null;
  market_potential_score: number | null;
  reserved_by: string | null;
  reserved_until: string | null;
  description: string | null;
  available_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationStats {
  total_locations: number;
  states_covered: number;
  countries_covered: number;
  operating_count: number;
  looking_for_franchise_count: number;
  first_location_date: string;
  latest_location_date: string;
}

export interface TerritoryStats {
  total_territories: number;
  available_count: number;
  reserved_count: number;
  occupied_count: number;
  states_with_territories: number;
  avg_franchise_fee: number;
  avg_market_potential: number;
}

export class FranchiseLocationsService {
  /**
   * Get franchise ID by slug
   */
  static async getFranchiseIdBySlug(slug: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('franchises')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching franchise by slug:', error);
      return null;
    }
    return data?.id || null;
  }

  /**
   * Get all locations for a franchise (supports both UUID and slug)
   */
  static async getLocations(franchiseIdOrSlug: string): Promise<FranchiseLocation[]> {
    // Check if it's a UUID or slug
    let franchiseId = franchiseIdOrSlug;
    
    // If it's not a UUID format, treat it as a slug
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(franchiseIdOrSlug)) {
      const id = await this.getFranchiseIdBySlug(franchiseIdOrSlug);
      if (!id) throw new Error('Franchise not found');
      franchiseId = id;
    }
    const { data, error } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('opening_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get operating locations only
   */
  static async getOperatingLocations(franchiseId: string): Promise<FranchiseLocation[]> {
    const { data, error } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('status', 'operating')
      .order('opening_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get locations by state
   */
  static async getLocationsByState(franchiseId: string, state: string): Promise<FranchiseLocation[]> {
    const { data, error } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('state', state)
      .order('city');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get location statistics (supports both UUID and slug)
   */
  static async getLocationStats(franchiseIdOrSlug: string): Promise<LocationStats | null> {
    // Check if it's a UUID or slug
    let franchiseId = franchiseIdOrSlug;
    
    // If it's not a UUID format, treat it as a slug
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(franchiseIdOrSlug)) {
      const id = await this.getFranchiseIdBySlug(franchiseIdOrSlug);
      if (!id) return null;
      franchiseId = id;
    }

    const { data, error } = await supabase
      .from('franchise_location_summary')
      .select('*')
      .eq('franchise_id', franchiseId)
      .single();

    if (error) {
      console.error('Error fetching location stats:', error);
      return null;
    }
    return data;
  }

  /**
   * Get all territories for a franchise
   */
  static async getTerritories(franchiseId: string): Promise<FranchiseTerritory[]> {
    const { data, error } = await supabase
      .from('franchise_territories')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('state');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get available territories only
   */
  static async getAvailableTerritories(franchiseId: string): Promise<FranchiseTerritory[]> {
    const { data, error } = await supabase
      .from('franchise_territories')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('status', 'available')
      .order('market_potential_score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get territory statistics
   */
  static async getTerritoryStats(franchiseId: string): Promise<TerritoryStats | null> {
    const { data, error } = await supabase
      .from('franchise_territory_summary')
      .select('*')
      .eq('franchise_id', franchiseId)
      .single();

    if (error) {
      console.error('Error fetching territory stats:', error);
      return null;
    }
    return data;
  }

  /**
   * Get locations grouped by state
   */
  static async getLocationsByStateGrouped(franchiseId: string): Promise<Record<string, FranchiseLocation[]>> {
    const locations = await this.getLocations(franchiseId);
    
    return locations.reduce((acc, location) => {
      if (!acc[location.state]) {
        acc[location.state] = [];
      }
      acc[location.state].push(location);
      return acc;
    }, {} as Record<string, FranchiseLocation[]>);
  }

  /**
   * Search locations near coordinates
   */
  static async searchNearby(
    franchiseId: string,
    latitude: number,
    longitude: number,
    radiusMiles: number = 50
  ): Promise<FranchiseLocation[]> {
    // Calculate bounding box (approximate)
    const latDelta = radiusMiles / 69; // ~69 miles per degree latitude
    const lonDelta = radiusMiles / (69 * Math.cos((latitude * Math.PI) / 180));

    const { data, error } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('franchise_id', franchiseId)
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lonDelta)
      .lte('longitude', longitude + lonDelta)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    // Filter by actual distance (Haversine formula)
    const filtered = (data || []).filter((loc) => {
      if (!loc.latitude || !loc.longitude) return false;
      const distance = this.calculateDistance(
        latitude,
        longitude,
        loc.latitude,
        loc.longitude
      );
      return distance <= radiusMiles;
    });

    return filtered;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Add a new location (franchise owner only)
   */
  static async addLocation(location: Partial<FranchiseLocation>): Promise<FranchiseLocation> {
    const { data, error } = await supabase
      .from('franchise_locations')
      .insert(location)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a location (franchise owner only)
   */
  static async updateLocation(
    locationId: string,
    updates: Partial<FranchiseLocation>
  ): Promise<FranchiseLocation> {
    const { data, error } = await supabase
      .from('franchise_locations')
      .update(updates)
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a location (franchise owner only)
   */
  static async deleteLocation(locationId: string): Promise<void> {
    const { error } = await supabase
      .from('franchise_locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;
  }

  /**
   * Add a new territory (franchise owner only)
   */
  static async addTerritory(territory: Partial<FranchiseTerritory>): Promise<FranchiseTerritory> {
    const { data, error } = await supabase
      .from('franchise_territories')
      .insert(territory)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Reserve a territory (franchisee)
   */
  static async reserveTerritory(
    territoryId: string,
    userId: string,
    daysReserved: number = 30
  ): Promise<FranchiseTerritory> {
    const reservedUntil = new Date();
    reservedUntil.setDate(reservedUntil.getDate() + daysReserved);

    const { data, error } = await supabase
      .from('franchise_territories')
      .update({
        status: 'reserved',
        reserved_by: userId,
        reserved_until: reservedUntil.toISOString().split('T')[0],
      })
      .eq('id', territoryId)
      .eq('status', 'available') // Only allow if currently available
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
