import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Building2, Upload, ArrowLeftIcon, Search, TrendingUpIcon, CheckCircleIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FranchiseMap } from '@/components/franchise-map';
import { FranchisorBulkUpload } from '@/components/franchisor-bulk-upload';
import { useAuth } from '@/contexts/AuthContext';
import { FranchiseService } from '@/lib/franchise-service';
import {
  FranchiseLocationsService,
  type FranchiseLocation,
  type LocationStats,
} from '@/lib/franchise-locations-service';

export function FranchiseLocationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [locations, setLocations] = useState<FranchiseLocation[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);
  const [franchiseName, setFranchiseName] = useState<string>('');
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

  // Helper to check if string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [locs, locStats, franchiseData] = await Promise.all([
        FranchiseLocationsService.getLocations(id),
        FranchiseLocationsService.getLocationStats(id),
        FranchiseService.getFranchiseByIdOrSlug(id),
      ]);

      setLocations(locs);
      setLocationStats(locStats);
      if (franchiseData && !Array.isArray(franchiseData)) {
        setFranchiseName((franchiseData as any).brand_name || (franchiseData as any).brandName || 'Franchise');
      }

      // Check if current user is the franchisor (supports both UUID and slug)
      if (user && profile) {
        const { supabase } = await import('@/lib/supabase');

        // Determine if id is UUID or slug and query accordingly
        const query = supabase
          .from('franchises')
          .select('franchisor_id');

        const { data: franchise } = await (isValidUUID(id)
          ? query.eq('id', id).single()
          : query.eq('slug', id).single());

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
    return status === 'operating'
      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const getStatusLabel = (status: string) => {
    return status === 'operating' ? 'Operating' : 'Available';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/franchise/${id}`)}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to {franchiseName || 'Franchise'}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold">{franchiseName} Locations</h1>
                <p className="text-sm text-muted-foreground">
                  {locationStats?.total_locations || 0} locations across {locationStats?.states_covered || 0} states
                </p>
              </div>
            </div>

            {/* Franchisor Tools */}
            {isFranchisor && (
              <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
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
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{locationStats?.total_locations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {locationStats?.states_covered || 0} states
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Operating</CardTitle>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {locationStats?.operating_count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently running franchises</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <TrendingUpIcon className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {locationStats?.looking_for_franchise_count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Open for new franchisees</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search city, state, or zip code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="w-full md:w-[200px]">
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

        {/* Map and Legend */}
        <Card className="mb-6 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Location Map</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Operating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Available</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px]">
              <FranchiseMap locations={filteredLocations} />
            </div>
          </CardContent>
        </Card>

        {/* Location Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">All Locations</h2>
            <Badge variant="secondary" className="text-sm">
              {filteredLocations.length} results
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">
                        {location.location_name || `${location.city} Location`}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <MapPin className="inline h-3 w-3 mr-1 text-muted-foreground" />
                        {location.city}, {location.state}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(location.status)}>
                      {getStatusLabel(location.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{location.address_line1}</p>
                    {location.address_line2 && (
                      <p>{location.address_line2}</p>
                    )}
                    <p>
                      {location.city}, {location.state} {location.zip_code}
                    </p>
                  </div>

                  {location.opening_date && (
                    <div className="flex items-center text-sm pt-2 border-t">
                      <span className="text-muted-foreground mr-2">Opened:</span>
                      <span className="font-medium">{formatDate(location.opening_date)}</span>
                    </div>
                  )}

                  {location.status !== 'operating' && (
                    <Button className="w-full mt-2" size="sm" onClick={() => navigate(`/franchise/${id}?contact=true`)}>
                      Enquire About This Location
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredLocations.length === 0 && (
              <div className="col-span-full">
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">No locations found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
