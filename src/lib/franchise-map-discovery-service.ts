import { supabase } from './supabase';
import type { FranchiseLocation } from './franchise-locations-service';
import { FranchiseService } from './franchise-service';
import { coordinatesForPlace } from './india-city-coordinates';
import type { Franchise } from '@/types/listings';

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

function placeKey(city: string): string {
    return city.trim().toLowerCase();
}

function operatingPlaces(franchise: Franchise): Array<{ city: string; state: string | null }> {
    const raw = franchise.operating_locations ?? franchise.operatingLocations;
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((item) => {
        if (typeof item === 'string' && item.trim()) return [{ city: item.trim(), state: null }];
        if (!item || typeof item !== 'object') return [];
        const record = item as { city?: string; state?: string };
        const city = String(record.city || '').trim();
        if (!city) return [];
        return [{ city, state: String(record.state || '').trim() || null }];
    });
}

function briefFor(franchise: Franchise): FranchiseBrief {
    return {
        id: franchise.id,
        brand_name: franchise.brand_name || franchise.brandName || 'Franchise',
        slug: franchise.slug || franchise.id,
        industry: franchise.industry || 'Franchise',
        logo_url: franchise.logo_url || franchise.logo || null,
        franchise_fee: franchise.franchise_fee ?? franchise.franchiseFee ?? null,
        total_investment_min: franchise.total_investment_min ?? franchise.investmentMin ?? null,
        total_investment_max: franchise.total_investment_max ?? franchise.investmentMax ?? null,
    };
}

function makePin(
    franchise: Franchise,
    city: string,
    state: string,
    status: FranchiseLocation['status'],
    locationName: string,
    point: { latitude: number; longitude: number }
): LocationWithFranchise {
    const now = new Date().toISOString();
    return {
        id: `${franchise.id}:${placeKey(city)}:${status}`,
        franchise_id: franchise.id,
        location_name: locationName,
        address_line1: '',
        address_line2: null,
        city,
        state,
        zip_code: '',
        country: 'India',
        latitude: point.latitude,
        longitude: point.longitude,
        status,
        opening_date: null,
        closing_date: null,
        verified: false,
        created_at: franchise.created_at || now,
        updated_at: now,
        franchise: briefFor(franchise),
    };
}

function pinsFromFranchise(franchise: Franchise): LocationWithFranchise[] {
    const pins: LocationWithFranchise[] = [];
    const seen = new Set<string>();
    const hqState = franchise.headquarters_state || franchise.headquartersState || '';

    const add = (
        city: string,
        state: string | null,
        status: FranchiseLocation['status'],
        locationName: string
    ) => {
        const key = placeKey(city);
        if (!key || seen.has(key)) return;
        const point = coordinatesForPlace(city, state || hqState);
        if (!point) return;
        seen.add(key);
        pins.push(makePin(franchise, city, state || hqState || 'India', status, locationName, point));
    };

    for (const place of operatingPlaces(franchise)) {
        add(place.city, place.state, 'operating', place.city);
    }

    const hqCity = franchise.headquarters_city || franchise.headquartersCity;
    if (hqCity) add(hqCity, hqState || null, 'operating', 'Headquarters');

    for (const city of franchise.preferred_cities || []) {
        add(city, null, 'looking_for_franchise', 'Listed expansion city');
    }

    if (pins.length === 0 && hqState) {
        const point = coordinatesForPlace(null, hqState);
        if (point) pins.push(makePin(franchise, hqState, hqState, 'operating', 'Headquarters', point));
    }

    return pins;
}

function spreadOverlappingPins(pins: LocationWithFranchise[]): LocationWithFranchise[] {
    const groups = new Map<string, LocationWithFranchise[]>();
    for (const pin of pins) {
        const key = `${pin.latitude?.toFixed(3)},${pin.longitude?.toFixed(3)}`;
        const group = groups.get(key) || [];
        group.push(pin);
        groups.set(key, group);
    }
    for (const group of groups.values()) {
        if (group.length < 2) continue;
        group.forEach((pin, index) => {
            const angle = (2 * Math.PI * index) / group.length;
            const radius = 0.06;
            pin.latitude = (pin.latitude || 0) + Math.cos(angle) * radius;
            pin.longitude = (pin.longitude || 0) + Math.sin(angle) * radius;
        });
    }
    return pins;
}

function applyDiscoveryFilters(
    pins: LocationWithFranchise[],
    filters?: DiscoveryFilters
): LocationWithFranchise[] {
    if (!filters) return pins;
    return pins.filter((pin) => {
        if (filters.franchiseIds?.length && !filters.franchiseIds.includes(pin.franchise_id)) return false;
        if (filters.states?.length && !filters.states.includes(pin.state)) return false;
        if (filters.status && filters.status !== 'all' && pin.status !== filters.status) return false;
        if (filters.categories?.length && !filters.categories.includes(pin.franchise.industry)) return false;
        const fee = pin.franchise.franchise_fee;
        if (filters.franchiseFeeMin != null && (fee == null || fee < filters.franchiseFeeMin)) return false;
        if (filters.franchiseFeeMax != null && (fee == null || fee > filters.franchiseFeeMax)) return false;
        const min = pin.franchise.total_investment_min;
        const max = pin.franchise.total_investment_max;
        if (filters.investmentMin != null && (min == null || min < filters.investmentMin)) return false;
        if (filters.investmentMax != null && (max == null || max > filters.investmentMax)) return false;
        return true;
    });
}

export class FranchiseMapDiscoveryService {
    /**
     * Pins for every active franchise: published outlets, headquarters, and expansion cities.
     * Stored franchise_locations rows are included when they already have coordinates.
     */
    static async getAllLocationsWithFranchises(
        filters?: DiscoveryFilters
    ): Promise<LocationWithFranchise[]> {
        let franchises: Franchise[] = [];
        try {
            franchises = await FranchiseService.getFranchises();
        } catch (error) {
            console.error('Error fetching franchises for the map:', error);
            throw error;
        }

        const pins = franchises.flatMap(pinsFromFranchise);

        const byId = new Map(franchises.map((franchise) => [franchise.id, franchise]));
        const { data, error } = await supabase
            .from('franchise_locations')
            .select('id, franchise_id, location_name, city, state, latitude, longitude, status, country')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

        if (error) {
            console.error('Error fetching stored franchise locations:', error);
        } else {
            const seen = new Set(pins.map((pin) => `${pin.franchise_id}:${placeKey(pin.city)}`));
            for (const loc of data || []) {
                const row = loc as {
                    franchise_id: string;
                    city: string;
                    state: string;
                    latitude: number;
                    longitude: number;
                    status: FranchiseLocation['status'];
                    location_name: string | null;
                };
                const franchise = byId.get(row.franchise_id);
                if (!franchise) continue;
                const key = `${row.franchise_id}:${placeKey(row.city || '')}`;
                if (seen.has(key)) continue;
                seen.add(key);
                pins.push(
                    makePin(
                        franchise,
                        row.city,
                        row.state,
                        row.status || 'operating',
                        row.location_name || row.city,
                        { latitude: row.latitude, longitude: row.longitude }
                    )
                );
            }
        }

        return applyDiscoveryFilters(spreadOverlappingPins(pins), filters);
    }

    /**
     * Get available filter options based on current data
     */
    static async getAvailableFilters(): Promise<AvailableFilters> {
        const pins = await this.getAllLocationsWithFranchises();
        const byFranchise = new Map<string, AvailableFilters['franchises'][number]>();
        for (const pin of pins) {
            const current = byFranchise.get(pin.franchise_id);
            if (current) {
                current.locationCount += 1;
                continue;
            }
            byFranchise.set(pin.franchise_id, {
                id: pin.franchise.id,
                brand_name: pin.franchise.brand_name,
                slug: pin.franchise.slug,
                industry: pin.franchise.industry,
                locationCount: 1,
            });
        }

        return {
            franchises: [...byFranchise.values()].sort((a, b) => a.brand_name.localeCompare(b.brand_name)),
            categories: [...new Set(pins.map((pin) => pin.franchise.industry).filter(Boolean))].sort(),
            states: [...new Set(pins.map((pin) => pin.state).filter(Boolean))].sort(),
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
