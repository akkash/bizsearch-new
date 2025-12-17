import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Building2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FranchiseMap } from '@/components/franchise-map';
import { FranchisorBulkUpload } from '@/components/franchisor-bulk-upload';
import { useAuth } from '@/contexts/AuthContext';
import {
  FranchiseLocationsService,
  type FranchiseLocation,
  type LocationStats,
} from '@/lib/franchise-locations-service';

export function FranchiseLocationsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [locations, setLocations] = useState<FranchiseLocation[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isFranchisor, setIsFranchisor] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [locs, locStats] = await Promise.all([
        FranchiseLocationsService.getLocations(id),
        FranchiseLocationsService.getLocationStats(id),
      ]);

      setLocations(locs);
      setLocationStats(locStats);

      // Check if current user is the franchisor
      if (user && profile) {
        const { supabase } = await import('@/lib/supabase');
        const { data: franchise } = await supabase
          .from('franchises')
          .select('franchisor_id')
          .eq('id', id)
          .single();
        
        setIsFranchisor(franchise?.franchisor_id === user.id);
      }
    } catch (error) {
      console.error('Error loading franchise locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique states from locations
  const states = Array.from(new Set(locations.map((loc) => loc.state))).sort();

  // Filter locations
  const filteredLocations = locations.filter((loc) => {
    if (filterState !== 'all' && loc.state !== filterState) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.address_line1.toLowerCase().includes(query) ||
        loc.zip_code.includes(query)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    return status === 'operating' ? 'bg-red-500 text-white' : 'bg-white text-gray-800 border border-gray-300';
  };

  const getStatusLabel = (status: string) => {
    return status === 'operating' ? 'Operating' : 'Looking for Franchise';
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Franchise Locations</h1>
            <p className="text-muted-foreground">
              Red pins: Operating franchises • White pins: Available for new franchisors
            </p>
          </div>
          
          {/* Franchisor Tools */}
          {isFranchisor && (
            <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload Locations
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Franchise Locations</DialogTitle>
                </DialogHeader>
                <FranchisorBulkUpload
                  franchiseId={id!}
                  onComplete={(result) => {
                    if (result.success > 0) {
                      loadData(); // Reload locations
                      setTimeout(() => setShowBulkUpload(false), 2000);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationStats?.total_locations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {locationStats?.states_covered || 0} states
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operating</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {locationStats?.operating_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <div className="h-3 w-3 rounded-full bg-white border-2 border-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {locationStats?.looking_for_franchise_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Looking for franchisors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search city, state, or zip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="h-[600px] rounded-lg overflow-hidden">
            <FranchiseMap locations={filteredLocations} />
          </div>
        </CardContent>
      </Card>

      {/* Location Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Locations ({filteredLocations.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {location.location_name || `${location.city} Location`}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {location.city}, {location.state}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(location.status)}>
                    {getStatusLabel(location.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">{location.address_line1}</p>
                  {location.address_line2 && (
                    <p className="text-muted-foreground">{location.address_line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {location.city}, {location.state} {location.zip_code}
                  </p>
                </div>

                {location.opening_date && (
                  <div className="flex items-center text-sm pt-2 border-t">
                    <span className="text-muted-foreground mr-2">Opening Date:</span>
                    <span className="font-medium">{formatDate(location.opening_date)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredLocations.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground">No locations found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
