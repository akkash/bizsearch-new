import { supabase } from './supabase';
import type { FranchiseLocation } from './franchise-locations-service';

export interface DiscoveryFilters {
    franchiseIds?: string[];
    categories?: string[];
    franchiseFeeMin?: number;
    franchiseFeeMax?: number;
    investmentMin?: number;
    investmentMax?: number;
    status?: 'operating' | 'looking_for_franchise' | 'all';
    states?: string[];
}

export interface FranchiseBrief {
    id: string;
    brand_name: string;
    slug: string;
    industry: string;
    logo_url: string | null;
    franchise_fee: number | null;
    total_investment_min: number | null;
    total_investment_max: number | null;
}

export interface LocationWithFranchise extends FranchiseLocation {
    franchise: FranchiseBrief;
}

export interface DiscoveryStats {
    totalLocations: number;
    operatingCount: number;
    availableCount: number;
    franchiseCount: number;
    statesCount: number;
}

export interface AvailableFilters {
    franchises: Array<{ id: string; brand_name: string; slug: string; industry: string; locationCount: number }>;
    categories: string[];
    states: string[];
}

export class FranchiseMapDiscoveryService {
    /**
     * Get all locations across all franchises with franchise details
     */
    static async getAllLocationsWithFranchises(
        filters?: DiscoveryFilters
    ): Promise<LocationWithFranchise[]> {
        // Build the query with franchise join
        let query = supabase
            .from('franchise_locations')
            .select(`
        *,
        franchise:franchises!inner (
          id,
          brand_name,
          slug,
          industry,
          logo_url,
          franchise_fee,
          total_investment_min,
          total_investment_max
        )
      `)
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

        // Apply filters
        if (filters) {
            // Franchise filter
            if (filters.franchiseIds && filters.franchiseIds.length > 0) {
                query = query.in('franchise_id', filters.franchiseIds);
            }

            // Status filter
            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }

            // State filter
            if (filters.states && filters.states.length > 0) {
                query = query.in('state', filters.states);
            }

            // Category filter (on franchise)
            if (filters.categories && filters.categories.length > 0) {
                query = query.in('franchise.industry', filters.categories);
            }

            // Franchise fee filter (on franchise)
            if (filters.franchiseFeeMin !== undefined) {
                query = query.gte('franchise.franchise_fee', filters.franchiseFeeMin);
            }
            if (filters.franchiseFeeMax !== undefined) {
                query = query.lte('franchise.franchise_fee', filters.franchiseFeeMax);
            }

            // Investment filter (on franchise)
            if (filters.investmentMin !== undefined) {
                query = query.gte('franchise.total_investment_min', filters.investmentMin);
            }
            if (filters.investmentMax !== undefined) {
                query = query.lte('franchise.total_investment_max', filters.investmentMax);
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching discovery locations:', error);
            throw error;
        }

        // Transform the data to match our interface
        return (data || []).map((loc: any) => ({
            ...loc,
            franchise: loc.franchise as FranchiseBrief,
        }));
    }

    /**
     * Get available filter options based on current data
     */
    static async getAvailableFilters(): Promise<AvailableFilters> {
        // Get franchises with location counts
        const { data: franchisesData, error: franchisesError } = await supabase
            .from('franchises')
            .select(`
        id,
        brand_name,
        slug,
        industry,
        franchise_locations (count)
      `)
            .eq('status', 'active');

        if (franchisesError) {
            console.error('Error fetching franchises for filters:', franchisesError);
        }

        // Get unique states from locations
        const { data: statesData, error: statesError } = await supabase
            .from('franchise_locations')
            .select('state')
            .not('latitude', 'is', null);

        if (statesError) {
            console.error('Error fetching states for filters:', statesError);
        }

        // Extract unique states
        const uniqueStates = [...new Set((statesData || []).map((s: any) => s.state))].sort();

        // Extract unique categories
        const uniqueCategories = [...new Set((franchisesData || []).map((f: any) => f.industry))].filter(Boolean).sort();

        // Format franchises with location counts
        const franchises = (franchisesData || []).map((f: any) => ({
            id: f.id,
            brand_name: f.brand_name,
            slug: f.slug,
            industry: f.industry,
            locationCount: f.franchise_locations?.[0]?.count || 0,
        })).filter(f => f.locationCount > 0);

        return {
            franchises,
            categories: uniqueCategories as string[],
            states: uniqueStates as string[],
        };
    }

    /**
     * Get aggregate statistics for the discovery page
     */
    static async getDiscoveryStats(filters?: DiscoveryFilters): Promise<DiscoveryStats> {
        const locations = await this.getAllLocationsWithFranchises(filters);

        const operatingCount = locations.filter(l => l.status === 'operating').length;
        const availableCount = locations.filter(l => l.status === 'looking_for_franchise').length;
        const uniqueFranchises = new Set(locations.map(l => l.franchise_id));
        const uniqueStates = new Set(locations.map(l => l.state));

        return {
            totalLocations: locations.length,
            operatingCount,
            availableCount,
            franchiseCount: uniqueFranchises.size,
            statesCount: uniqueStates.size,
        };
    }

    /**
     * Get brand colors for map legend based on franchise IDs
     */
    static getBrandColors(franchiseIds: string[]): Record<string, string> {
        // Predefined color palette for brands
        const colors = [
            '#3B82F6', // Blue
            '#10B981', // Emerald
            '#8B5CF6', // Violet
            '#F59E0B', // Amber
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#F97316', // Orange
            '#6366F1', // Indigo
            '#14B8A6', // Teal
        ];

        const colorMap: Record<string, string> = {};
        franchiseIds.forEach((id, index) => {
            colorMap[id] = colors[index % colors.length];
        });

        return colorMap;
    }
}
