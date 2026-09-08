import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { BusinessCard } from "@/polymet/components/business-card";
import { Filters, FilterState } from "@/polymet/components/filters";
import { BusinessService } from "@/lib/business-service";
import { SkeletonLoader } from "@/polymet/components/skeleton-loader";
import { EmptyState } from "@/polymet/components/empty-state";
import type { Business } from "@/types/listings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  GridIcon,
  ListIcon,
  MapIcon,
  FilterIcon,
  SortAscIcon,
  SearchIcon,
  ChevronRightIcon,
  HomeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SMERGERS_BUSINESS_CATEGORIES, getBusinessCategoryBySlug } from "@/data/categories";

interface BusinessListingsProps {
  className?: string;
}

type ViewMode = "grid" | "list" | "map";
type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "revenue-high"
  | "newest"
  | "oldest";

export function BusinessListings({ className }: BusinessListingsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isListingSaved, toggleSave } = useSavedListings();
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Parse URL params for category filtering and search
  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('subcategory');
  const urlSearchQuery = searchParams.get('q');
  const currentCategory = categorySlug ? getBusinessCategoryBySlug(categorySlug) : null;
  const currentSubcategory = currentCategory?.subcategories.find(s => s.slug === subcategorySlug);

  // Initialize search query from URL if present
  useEffect(() => {
    if (urlSearchQuery && urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Fetch businesses from Supabase (server-side pagination + filters)
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const industryFilter = currentCategory?.name
          ? [currentCategory.name]
          : filters?.industries;

        const result = await BusinessService.getBusinesses(
          {
            search: searchQuery || undefined,
            industry: industryFilter,
            city: filters?.city,
            state: filters?.state,
            priceMin: filters?.priceRange?.[0],
            priceMax: filters?.priceRange?.[1],
          },
          { page: currentPage, pageSize: itemsPerPage }
        );

        setBusinesses(result.data as Business[]);
        setTotalCount(result.total);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
        setTotalCount(0);
        setFetchError('Unable to load businesses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [currentPage, searchQuery, filters, currentCategory?.name]);

  // Client-side refinement for filters not yet pushed to the server query
  const filteredBusinesses = useMemo(() => {
    let filtered = [...businesses];

    if (currentSubcategory) {
      const subcategoryName = currentSubcategory.name.toLowerCase();
      filtered = filtered.filter((business) => {
        const businessIndustry = business.industry?.toLowerCase() || '';
        return businessIndustry.includes(subcategoryName);
      });
    }

    if (filters) {
      if (filters.subcategory && filters.subcategory.length > 0) {
        filtered = filtered.filter((business) => {
          const sub = (business as Business & { subcategory?: string | string[] }).subcategory;
          const tags = business.highlights || [];
          return filters.subcategory.some((filterSub) => {
            const fs = filterSub.toLowerCase();
            if (typeof sub === 'string' && sub.toLowerCase().includes(fs)) return true;
            if (Array.isArray(sub) && sub.some((s) => s.toLowerCase().includes(fs))) return true;
            if (Array.isArray(tags) && tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(fs))) return true;
            return false;
          });
        });
      }

      if (filters.state && filters.state.length > 0) {
        filtered = filtered.filter((business) => {
          const bLocation = (business.location || '').toLowerCase();
          const bState = (business.state || '').toLowerCase();
          return filters.state.some((s) =>
            bState.includes(s.toLowerCase()) || bLocation.includes(s.toLowerCase())
          );
        });
      }

      if (filters.businessType && filters.businessType.length > 0) {
        filtered = filtered.filter((business) => {
          const bType = (business.businessType || business.business_type || '').toLowerCase();
          return filters.businessType.some((t) => bType.includes(t.toLowerCase()));
        });
      }

      if (filters.businessAge && filters.businessAge !== 'any') {
        filtered = filtered.filter((business) => {
          const estYear = business.establishedYear || business.established_year;
          if (!estYear) return false;
          const age = new Date().getFullYear() - estYear;
          switch (filters.businessAge) {
            case '0-2': return age <= 2;
            case '3-5': return age >= 3 && age <= 5;
            case '6-10': return age >= 6 && age <= 10;
            case '10+': return age > 10;
            default: return true;
          }
        });
      }

      if (filters.employees && filters.employees !== 'any') {
        filtered = filtered.filter((business) => {
          const employees = business.employees || business.employee_count;
          if (employees === undefined || employees === null) return false;
          switch (filters.employees) {
            case '1-10': return employees <= 10;
            case '11-50': return employees >= 11 && employees <= 50;
            case '51-200': return employees >= 51 && employees <= 200;
            case '200+': return employees > 200;
            default: return true;
          }
        });
      }
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'revenue-high':
        filtered.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => (b.establishedYear || 0) - (a.establishedYear || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a.establishedYear || 0) - (b.establishedYear || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [filters, sortBy, businesses, currentSubcategory]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedBusinesses = filteredBusinesses;



  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSave = async (businessId: string) => {
    if (!user) {
      toast.info('Sign in to save businesses');
      navigate('/login');
      return;
    }

    const wasSaved = isListingSaved('business', businessId);
    await toggleSave('business', businessId);
    toast.success(wasSaved ? 'Removed from saved list' : 'Business saved');
  };

  const handleShare = (businessId: string) => {
    console.log("Share business:", businessId);
  };

  const handleContact = (businessId: string) => {
    // Find the business to get details
    const business = businesses.find(b => b.id === businessId);
    const businessName = business?.name || 'Business';
    const identifier = business?.slug || businessId;

    // Show toast with contact info
    toast.success(`Contacting ${businessName}`, {
      description: "Opening contact options...",
    });

    // Navigate to detail page with contact param to trigger contact dialog
    navigate(`/business/${identifier}?contact=true`);
  };

  const handleViewDetails = (businessId: string) => {
    // Find the business to get its slug
    const business = businesses.find(b => b.id === businessId);
    const identifier = business?.slug || businessId;
    navigate(`/business/${identifier}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Businesses for Sale</h1>
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            type="error"
            title="Unable to load businesses"
            description={fetchError}
            actionText="Try again"
            onAction={() => setCurrentPage(1)}
          />
        </div>
      </div>
    );
  }

  // Empty state - still show header with category navigation
  if (!loading && filteredBusinesses.length === 0 && businesses.length === 0) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6 md:py-8">
            {currentCategory && (
              <nav className="flex items-center gap-2 text-sm mb-4">
                <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  <HomeIcon className="h-4 w-4" />
                  Home
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                <Link to="/businesses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Businesses
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{currentCategory.name}</span>
              </nav>
            )}

            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                {currentCategory?.name || "Businesses for sale"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {currentCategory
                  ? `${currentCategory.name} businesses listed for sale`
                  : "Browse businesses listed for sale across industries and locations"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SMERGERS_BUSINESS_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/businesses?category=${cat.slug}`}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md border transition-colors",
                    currentCategory?.id === cat.id
                      ? "bg-growth-green text-white border-growth-green"
                      : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <EmptyState
            type="no-data"
            title={currentCategory ? `No ${currentCategory.name} Businesses Yet` : "No Businesses Available Yet"}
            description="No businesses are listed in this category yet. Check back later or list your business."
            actionText="List Your Business"
            actionLink="/add-business-listing"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {(currentCategory || currentSubcategory) && (
            <nav className="flex items-center gap-2 text-sm mb-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <Link to="/businesses" className="text-muted-foreground hover:text-foreground transition-colors">
                Businesses
              </Link>
              {currentCategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={`/businesses?category=${currentCategory.slug}`}
                    className={currentSubcategory ? "text-muted-foreground hover:text-foreground transition-colors" : "font-medium text-foreground"}
                  >
                    {currentCategory.name}
                  </Link>
                </>
              )}
              {currentSubcategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{currentSubcategory.name}</span>
                </>
              )}
            </nav>
          )}

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
              {currentSubcategory?.name || currentCategory?.name || "Businesses for sale"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {currentCategory
                ? `Filter and compare ${currentCategory.name.toLowerCase()} listings by price, location, and revenue`
                : "Filter and compare businesses listed for sale by price, location, and industry"}
            </p>
          </div>

          {!currentCategory && (
            <div className="flex flex-wrap gap-2">
              {SMERGERS_BUSINESS_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/businesses?category=${cat.slug}`}
                  className="px-3 py-1.5 text-sm rounded-md bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {currentCategory && currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/businesses?category=${currentCategory.slug}`}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md border transition-colors",
                  !currentSubcategory
                    ? "bg-growth-green text-white border-growth-green"
                    : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                )}
              >
                All {currentCategory.name}
              </Link>
              {currentCategory.subcategories.slice(0, 10).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/businesses?category=${currentCategory.slug}&subcategory=${sub.slug}`}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md border transition-colors",
                    currentSubcategory?.id === sub.id
                      ? "bg-growth-green text-white border-growth-green"
                      : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                  )}
                >
                  {sub.name}
                </Link>
              ))}
              {currentCategory.subcategories.length > 10 && (
                <span className="px-3 py-1.5 text-sm text-muted-foreground">
                  +{currentCategory.subcategories.length - 10} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 space-y-6">
              <Filters
                type="business"
                initialCategory={currentCategory?.name}
                initialSubcategory={currentSubcategory?.name}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Controls Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <FilterIcon className="h-4 w-4" />
                      {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                    <Separator orientation="vertical" className="h-6" />

                    <div className="text-sm text-muted-foreground">
                      {totalCount} businesses found
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <SortAscIcon className="h-4 w-4" />

                      <Select
                        value={sortBy}
                        onValueChange={(value: SortOption) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Best Match</SelectItem>
                          <SelectItem value="price-low">
                            Lowest Price
                          </SelectItem>
                          <SelectItem value="price-high">
                            Highest Price
                          </SelectItem>
                          <SelectItem value="revenue-high">
                            Highest Revenue
                          </SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
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
                        <GridIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-none"
                      >
                        <ListIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "map" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("map")}
                        className="rounded-l-none"
                      >
                        <MapIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {filters && (
              <div className="flex flex-wrap gap-2">
                {filters.industry.map((industry) => (
                  <Badge key={industry} variant="secondary">
                    Industry: {industry}
                  </Badge>
                ))}
                {filters.state?.map((state) => (
                  <Badge key={state} variant="secondary">
                    State: {state}
                  </Badge>
                ))}
                {filters.city?.map((city) => (
                  <Badge key={city} variant="secondary">
                    City: {city}
                  </Badge>
                ))}
                {(filters.priceRange[0] > 0 ||
                  filters.priceRange[1] < 10000000) && (
                    <Badge variant="secondary">
                      Price: ₹{(filters.priceRange[0] / 100000).toFixed(1)}L - ₹
                      {(filters.priceRange[1] / 100000).toFixed(1)}L
                    </Badge>
                  )}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <p className="text-muted-foreground">Loading businesses...</p>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === "grid" && (
              <>
                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {paginatedBusinesses.map((business) => (
                      <div
                        key={business.id}
                        className="flex-none w-80 snap-start"
                      >
                        <BusinessCard
                          business={business}
                          onSave={handleSave}
                          onShare={handleShare}
                          onContact={handleContact}
                          onViewDetails={handleViewDetails}
                          isSaved={isListingSaved('business', business.id)}
                        />
                      </div>
                    ))}
                    {paginatedBusinesses.length === 0 && (
                      <div className="flex-none w-80 p-8 text-center text-muted-foreground">
                        No businesses match your criteria
                      </div>
                    )}
                  </div>

                  {/* Mobile Scroll Indicator */}
                  <div className="flex justify-center gap-1 mt-4">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(paginatedBusinesses.length / 3)
                        ),
                      },
                      (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i === 0 ? "bg-primary" : "bg-muted"
                            }`}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      onSave={handleSave}
                      onShare={handleShare}
                      onContact={handleContact}
                      onViewDetails={handleViewDetails}
                      isSaved={isListingSaved('business', business.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {viewMode === "list" && (
              <div className="space-y-4">
                {paginatedBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onSave={handleSave}
                    onShare={handleShare}
                    onContact={handleContact}
                    onViewDetails={handleViewDetails}
                    isSaved={isListingSaved('business', business.id)}
                    className="flex flex-row items-center p-4 h-auto"
                  />
                ))}
              </div>
            )}

            {viewMode === "map" && (
              <Card className="h-96">
                <CardContent className="p-6 flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

                    <h3 className="font-semibold mb-2">Map View</h3>
                    <p className="text-muted-foreground">
                      Interactive map view coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {filteredBusinesses.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

                  <h3 className="font-semibold mb-2">No businesses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilters(null);
                      setCurrentPage(1);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
