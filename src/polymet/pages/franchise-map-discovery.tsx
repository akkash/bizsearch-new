import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    MapPin,
    Building2,
    Filter,
    Loader2,
    TrendingUp,
    Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatureFlag } from '@/contexts/FeatureFlagsContext';
import { FranchiseMapFilters } from '@/components/franchise-map-filters';
import { FranchiseMapDiscoveryMap } from '@/components/franchise-map-discovery-map';
import {
    FranchiseMapDiscoveryService,
    type DiscoveryFilters,
    type AvailableFilters,
    type LocationWithFranchise,
    type DiscoveryStats,
} from '@/lib/franchise-map-discovery-service';

interface FranchiseMapDiscoveryPageProps {
    className?: string;
}

export function FranchiseMapDiscoveryPage({ className }: FranchiseMapDiscoveryPageProps) {
    const [locations, setLocations] = useState<LocationWithFranchise[]>([]);
    const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
        franchises: [],
        categories: [],
        states: [],
    });
    const [filters, setFilters] = useState<DiscoveryFilters>({});
    const [stats, setStats] = useState<DiscoveryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Feature flag
    const isFranchiseMapEnabled = useFeatureFlag('franchise_map');

    // Load available filters on mount
    useEffect(() => {
        if (!isFranchiseMapEnabled) return;

        const loadFilters = async () => {
            try {
                const available = await FranchiseMapDiscoveryService.getAvailableFilters();
                setAvailableFilters(available);
            } catch (error) {
                console.error('Error loading filters:', error);
            }
        };
        loadFilters();
    }, [isFranchiseMapEnabled]);

    // Load locations when filters change
    useEffect(() => {
        if (!isFranchiseMapEnabled) return;

        const loadLocations = async () => {
            setLoading(true);
            try {
                const [locs, statsData] = await Promise.all([
                    FranchiseMapDiscoveryService.getAllLocationsWithFranchises(filters),
                    FranchiseMapDiscoveryService.getDiscoveryStats(filters),
                ]);
                setLocations(locs);
                setStats(statsData);
            } catch (error) {
                console.error('Error loading locations:', error);
            } finally {
                setLoading(false);
            }
        };
        loadLocations();
    }, [filters, isFranchiseMapEnabled]);

    const handleFiltersChange = (newFilters: DiscoveryFilters) => {
        setFilters(newFilters);
        setShowMobileFilters(false);
    };

    // Show coming soon if feature is disabled
    if (!isFranchiseMapEnabled) {
        return (
            <div className={cn('min-h-screen bg-background flex items-center justify-center', className)}>
                <Card className="max-w-md mx-auto text-center p-8">
                    <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Feature Coming Soon</h2>
                    <p className="text-muted-foreground mb-4">
                        The Franchise Location Explorer is currently disabled. Check back later!
                    </p>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn('min-h-screen bg-background', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <MapPin className="h-8 w-8 text-primary" />
                                Franchise Location Explorer
                            </h1>
                            <p className="text-muted-foreground">
                                Discover franchise opportunities across India on an interactive map
                            </p>
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="md:hidden">
                            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        Filters
                                        {Object.keys(filters).length > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {Object.values(filters).filter(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)).length}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-full sm:w-96 p-0">
                                    <div className="p-4 h-full overflow-y-auto">
                                        <FranchiseMapFilters
                                            availableFilters={availableFilters}
                                            currentFilters={filters}
                                            onFiltersChange={handleFiltersChange}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    {stats && (
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Card className="px-4 py-2 bg-background/80 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <strong>{stats.totalLocations}</strong> locations
                                    </span>
                                </div>
                            </Card>
                            <Card className="px-4 py-2 bg-background/80 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <strong>{stats.franchiseCount}</strong> franchises
                                    </span>
                                </div>
                            </Card>
                            <Card className="px-4 py-2 bg-background/80 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-sm">
                                        <strong>{stats.operatingCount}</strong> operating
                                    </span>
                                </div>
                            </Card>
                            <Card className="px-4 py-2 bg-background/80 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-400" />
                                    <span className="text-sm">
                                        <strong>{stats.availableCount}</strong> available
                                    </span>
                                </div>
                            </Card>
                            <Card className="px-4 py-2 bg-background/80 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <strong>{stats.statesCount}</strong> states
                                    </span>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Filters Sidebar - Desktop */}
                    <div className="hidden md:block w-80 flex-shrink-0">
                        <div className="sticky top-4">
                            <FranchiseMapFilters
                                availableFilters={availableFilters}
                                currentFilters={filters}
                                onFiltersChange={handleFiltersChange}
                            />
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="h-[600px] flex items-center justify-center bg-muted/20">
                                        <div className="text-center">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                            <p className="text-muted-foreground">Loading locations...</p>
                                        </div>
                                    </div>
                                ) : locations.length === 0 ? (
                                    <div className="h-[600px] flex items-center justify-center bg-muted/20">
                                        <div className="text-center">
                                            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                            <h3 className="text-lg font-semibold mb-2">No Locations Found</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Try adjusting your filters to see more locations
                                            </p>
                                            <Button variant="outline" onClick={() => setFilters({})}>
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[600px]">
                                        <FranchiseMapDiscoveryMap
                                            locations={locations}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Results Summary */}
                        {!loading && locations.length > 0 && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {locations.length} locations from {stats?.franchiseCount || 0} franchises across {stats?.statesCount || 0} states
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
