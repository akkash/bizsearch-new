import { supabase } from './supabase';
import type { FranchiseLocation } from './franchise-locations-service';

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  locations: FranchiseLocation[];
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export class FranchisorToolsService {
  /**
   * Parse CSV file and validate data
   */
  static parseCSV(csvContent: string): Array<Partial<FranchiseLocation>> {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) throw new Error('CSV file is empty or invalid');

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const locations: Array<Partial<FranchiseLocation>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const location: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header) {
          case 'location_name':
          case 'name':
            location.location_name = value;
            break;
          case 'address':
          case 'address_line1':
            location.address_line1 = value;
            break;
          case 'address_line2':
            location.address_line2 = value;
            break;
          case 'city':
            location.city = value;
            break;
          case 'state':
            location.state = value;
            break;
          case 'zip':
          case 'zip_code':
          case 'zipcode':
            location.zip_code = value;
            break;
          case 'country':
            location.country = value;
            break;
          case 'status':
            location.status = value.toLowerCase() === 'operating' ? 'operating' : 'looking_for_franchise';
            break;
          case 'opening_date':
          case 'opened':
            location.opening_date = value;
            break;
          case 'latitude':
          case 'lat':
            location.latitude = parseFloat(value);
            break;
          case 'longitude':
          case 'lng':
          case 'lon':
            location.longitude = parseFloat(value);
            break;
        }
      });

      // Validate required fields
      if (location.address_line1 && location.city && location.state && location.zip_code) {
        locations.push(location);
      }
    }

    return locations;
  }

  /**
   * Geocode an address using OpenStreetMap Nominatim (free, no API key required)
   */
  static async geocodeAddress(address: string, city: string, state: string, zipCode: string): Promise<GeocodeResult | null> {
    try {
      const query = encodeURIComponent(`${address}, ${city}, ${state} ${zipCode}, USA`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
        {
          headers: {
            'User-Agent': 'BizSearch-Franchise-Locator',
          },
        }
      );

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          formatted_address: data[0].display_name,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Bulk upload locations from CSV
   */
  static async bulkUploadLocations(
    franchiseId: string,
    csvContent: string,
    autoGeocode: boolean = true
  ): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      success: 0,
      failed: 0,
      errors: [],
      locations: [],
    };

    try {
      const parsedLocations = this.parseCSV(csvContent);

      for (let i = 0; i < parsedLocations.length; i++) {
        const location = parsedLocations[i];
        
        try {
          // Auto-geocode if coordinates not provided
          if (autoGeocode && (!location.latitude || !location.longitude)) {
            const geocoded = await this.geocodeAddress(
              location.address_line1!,
              location.city!,
              location.state!,
              location.zip_code!
            );
            
            if (geocoded) {
              location.latitude = geocoded.latitude;
              location.longitude = geocoded.longitude;
            }
            
            // Add small delay to respect API rate limits
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Insert location
          const { data, error } = await supabase
            .from('franchise_locations')
            .insert({
              ...location,
              franchise_id: franchiseId,
            })
            .select()
            .single();

          if (error) throw error;

          result.success++;
          result.locations.push(data);
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: i + 2, // +2 because of header row and 0-index
            error: error.message || 'Unknown error',
          });
        }
      }
    } catch (error: any) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Download CSV template
   */
  static downloadCSVTemplate(): void {
    const template = `location_name,address_line1,address_line2,city,state,zip_code,country,status,opening_date,latitude,longitude
McDonald's Downtown,123 Main St,,New York,NY,10001,United States,operating,2020-01-15,40.7580,-73.9855
Available Location,456 Broadway,,Los Angeles,CA,90012,United States,looking_for_franchise,,,
`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'franchise_locations_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export locations to CSV
   */
  static exportLocationsToCSV(locations: FranchiseLocation[]): void {
    const headers = [
      'location_name',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'zip_code',
      'country',
      'status',
      'opening_date',
      'latitude',
      'longitude',
    ];

    const rows = locations.map((loc) => [
      loc.location_name || '',
      loc.address_line1,
      loc.address_line2 || '',
      loc.city,
      loc.state,
      loc.zip_code,
      loc.country,
      loc.status,
      loc.opening_date || '',
      loc.latitude || '',
      loc.longitude || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `franchise_locations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Update location with geocoded coordinates
   */
  static async geocodeAndUpdateLocation(locationId: string): Promise<FranchiseLocation> {
    // Get location
    const { data: location, error: fetchError } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (fetchError) throw fetchError;

    // Geocode
    const geocoded = await this.geocodeAddress(
      location.address_line1,
      location.city,
      location.state,
      location.zip_code
    );

    if (!geocoded) {
      throw new Error('Could not geocode address');
    }

    // Update location
    const { data, error } = await supabase
      .from('franchise_locations')
      .update({
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
      })
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Batch geocode all locations without coordinates
   */
  static async batchGeocodeLocations(franchiseId: string): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get locations without coordinates
    const { data: locations, error } = await supabase
      .from('franchise_locations')
      .select('*')
      .eq('franchise_id', franchiseId)
      .or('latitude.is.null,longitude.is.null');

    if (error) throw error;
    if (!locations || locations.length === 0) return result;

    for (const location of locations) {
      try {
        await this.geocodeAndUpdateLocation(location.id);
        result.success++;
        
        // Rate limit: wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        result.failed++;
        result.errors.push(`${location.location_name || location.city}: ${error.message}`);
      }
    }

    return result;
  }
}
