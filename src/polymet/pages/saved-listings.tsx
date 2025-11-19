import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { SavedListingsService, SavedListingWithDetails } from "@/lib/saved-listings-service";
import { BusinessCard } from "@/polymet/components/business-card";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bookmark,
  Grid3x3,
  List,
  SortAsc,
  Heart,
  Building2,
  Store,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedListingsPageProps {
  className?: string;
}

type ViewMode = "grid" | "list";
type SortOption = "recent" | "oldest" | "alphabetical";
type FilterType = "all" | "business" | "franchise";

export function SavedListingsPage({ className }: SavedListingsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSavedCount, toggleSave, isListingSaved } = useSavedListings();
  const [savedListings, setSavedListings] = useState<SavedListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterType, setFilterType] = useState<FilterType>("all");

  useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user]);

  const fetchSavedListings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const listings = await SavedListingsService.getSavedListings(user.id);
      setSavedListings(listings);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (listingType: 'business' | 'franchise', listingId: string) => {
    if (!user) return;
    
    try {
      await toggleSave(listingType, listingId);
      // Remove from local state
      setSavedListings(prev => 
        prev.filter(item => !(item.listing_type === listingType && item.listing_id === listingId))
      );
    } catch (error) {
      console.error('Error unsaving listing:', error);
    }
  };

  const handleViewDetails = (listingType: 'business' | 'franchise', listingId: string) => {
    navigate(`/${listingType}/${listingId}`);
  };

  // Filter listings
  const filteredListings = savedListings.filter(item => {
    if (filterType === 'all') return true;
    return item.listing_type === filterType;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'alphabetical':
        const aName = a.listing_type === 'business' 
          ? (a.listing?.name || '') 
          : (a.listing?.brand_name || a.listing?.brandName || '');
        const bName = b.listing_type === 'business'
          ? (b.listing?.name || '')
          : (b.listing?.brand_name || b.listing?.brandName || '');
        return aName.localeCompare(bName);
      default:
        return 0;
    }
  });

  const businessCount = savedListings.filter(item => item.listing_type === 'business').length;
  const franchiseCount = savedListings.filter(item => item.listing_type === 'franchise').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your saved listings
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Heart className="h-8 w-8 fill-current text-red-500" />
                Saved Listings
              </h1>
              <p className="text-muted-foreground">
                {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} saved
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-2xl font-bold">{savedListings.length}</p>
                  </div>
                  <Bookmark className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Businesses</p>
                    <p className="text-2xl font-bold">{businessCount}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Franchises</p>
                    <p className="text-2xl font-bold">{franchiseCount}</p>
                  </div>
                  <Store className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                  <Badge variant="secondary" className="ml-2">
                    {savedListings.length}
                  </Badge>
                </Button>
                <Button
                  variant={filterType === 'business' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('business')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Businesses
                  <Badge variant="secondary" className="ml-2">
                    {businessCount}
                  </Badge>
                </Button>
                <Button
                  variant={filterType === 'franchise' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('franchise')}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Franchises
                  <Badge variant="secondary" className="ml-2">
                    {franchiseCount}
                  </Badge>
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading saved listings...</p>
            </div>
          </div>
        ) : sortedListings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Saved Listings</h3>
              <p className="text-muted-foreground mb-6">
                {filterType === 'all'
                  ? "You haven't saved any listings yet. Start browsing to save your favorites!"
                  : `You haven't saved any ${filterType} listings yet.`}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/businesses')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Browse Businesses
                </Button>
                <Button variant="outline" onClick={() => navigate('/franchises')}>
                  <Store className="h-4 w-4 mr-2" />
                  Browse Franchises
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {sortedListings.map((saved) => {
              if (!saved.listing) return null;

              if (saved.listing_type === 'business') {
                return (
                  <BusinessCard
                    key={saved.id}
                    business={saved.listing}
                    onSave={() => handleUnsave('business', saved.listing_id)}
                    onViewDetails={() => handleViewDetails('business', saved.listing_id)}
                    isSaved={true}
                  />
                );
              } else {
                return (
                  <FranchiseCard
                    key={saved.id}
                    franchise={saved.listing}
                    onSave={() => handleUnsave('franchise', saved.listing_id)}
                    onViewDetails={() => handleViewDetails('franchise', saved.listing_id)}
                    isSaved={true}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
