import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { BusinessCard } from "@/polymet/components/business-card";
import { Filters, FilterState } from "@/polymet/components/filters";
import { SearchBar } from "@/polymet/components/search-bar";
import { BusinessService } from "@/lib/business-service";
import { SkeletonLoader } from "@/polymet/components/skeleton-loader";
import { EmptyState } from "@/polymet/components/empty-state";
import type { Business } from "@/polymet/data/businesses-data";
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
import { Input } from "@/components/ui/input";
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
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [savedBusinesses, setSavedBusinesses] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Parse URL params for category filtering
  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('subcategory');
  const currentCategory = categorySlug ? getBusinessCategoryBySlug(categorySlug) : null;
  const currentSubcategory = currentCategory?.subcategories.find(s => s.slug === subcategorySlug);

  // Fetch businesses from Supabase
  useEffect(() => {
    const fetchBusinesses = async () => {
      console.log('📥 BusinessListings: Starting fetch...');
      setLoading(true);
      try {
        const result = await BusinessService.getBusinesses({});
        console.log('📦 BusinessListings: Received result:', result);
        if (result && Array.isArray(result)) {
          setBusinesses(result as Business[]);
          console.log('✅ BusinessListings: Set', result.length, 'businesses from database');
        } else {
          setBusinesses([]);
          console.log('ℹ️ BusinessListings: No businesses in database');
        }
      } catch (error) {
        console.error('❌ BusinessListings: Error fetching businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
        console.log('🏁 BusinessListings: Loading complete');
      }
    };
    fetchBusinesses();
  }, []);

  // Filter and search logic
  const filteredBusinesses = useMemo(() => {
    let filtered = [...businesses];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(query) ||
          business.industry.toLowerCase().includes(query) ||
          business.location.toLowerCase().includes(query) ||
          business.description.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters) {
      // Industry filter
      if (filters.industry.length > 0) {
        filtered = filtered.filter((business) =>
          filters.industry.includes(business.industry)
        );
      }

      // Subcategory filter (check if business has subcategory field)
      if (filters.subcategory && filters.subcategory.length > 0) {
        filtered = filtered.filter((business) =>
          filters.subcategory.includes((business as any).subcategory || '')
        );
      }

      // Location filter
      if (filters.location.length > 0) {
        filtered = filtered.filter((business) =>
          filters.location.some((loc) => business.location.includes(loc))
        );
      }

      // Price range filter
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) {
        filtered = filtered.filter((business) => {
          const price = business.price;
          return (
            price >= filters.priceRange[0] && price <= filters.priceRange[1]
          );
        });
      }

      // Revenue range filter
      if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 50000000) {
        filtered = filtered.filter((business) => {
          const revenue = business.revenue || 0;
          return (
            revenue >= filters.revenueRange[0] &&
            revenue <= filters.revenueRange[1]
          );
        });
      }

      // Business age filter
      if (filters.businessAge) {
        filtered = filtered.filter((business) => {
          const age = new Date().getFullYear() - business.establishedYear;
          switch (filters.businessAge) {
            case "0-2":
              return age <= 2;
            case "3-5":
              return age >= 3 && age <= 5;
            case "6-10":
              return age >= 6 && age <= 10;
            case "10+":
              return age > 10;
            default:
              return true;
          }
        });
      }

      // Employees filter
      if (filters.employees) {
        filtered = filtered.filter((business) => {
          const employees = business.employees;
          switch (filters.employees) {
            case "1-10":
              return employees <= 10;
            case "11-50":
              return employees >= 11 && employees <= 50;
            case "51-200":
              return employees >= 51 && employees <= 200;
            case "200+":
              return employees > 200;
            default:
              return true;
          }
        });
      }

      // Verification filter
      if (filters.verification.length > 0) {
        filtered = filtered.filter((business) =>
          filters.verification.some((verification) =>
            business.badges.includes(verification)
          )
        );
      }

      // Financing filter
      if (filters.financing) {
        filtered = filtered.filter((business) =>
          business.badges.includes("Financing Available")
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "revenue-high":
        filtered.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        break;
      case "newest":
        filtered.sort((a, b) => b.establishedYear - a.establishedYear);
        break;
      case "oldest":
        filtered.sort((a, b) => a.establishedYear - b.establishedYear);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [searchQuery, filters, sortBy, businesses]);

  // Pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (
    query: string,
    type: "business" | "franchise",
    searchFilters: any
  ) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSave = (businessId: string) => {
    setSavedBusinesses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };

  const handleShare = (businessId: string) => {
    console.log("Share business:", businessId);
  };

  const handleContact = (businessId: string) => {
    console.log("Contact business:", businessId);
  };

  const handleViewDetails = (businessId: string) => {
    navigate(`/business/${businessId}`);
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

  // Empty state - still show header with category navigation
  if (!loading && filteredBusinesses.length === 0 && businesses.length === 0) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        {/* Header with breadcrumbs and category chips */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb Navigation */}
            {currentCategory && (
              <nav className="flex items-center gap-2 text-sm mb-4">
                <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <HomeIcon className="h-4 w-4" />
                  Home
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                <Link to="/businesses" className="text-muted-foreground hover:text-foreground">
                  Businesses
                </Link>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{currentCategory.name}</span>
              </nav>
            )}

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {currentCategory?.name || 'Businesses for Sale'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {currentCategory
                  ? `Find ${currentCategory.name.toLowerCase()} businesses for sale`
                  : 'Discover verified businesses ready for acquisition'
                }
              </p>
            </div>

            {/* Quick Filter Category Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {SMERGERS_BUSINESS_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/businesses?category=${cat.slug}`}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${currentCategory?.id === cat.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
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
            description="We're constantly adding new business opportunities. Check back soon or get notified when new listings are added."
            actionText="List Your Business"
            actionLink="/add-business-listing"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb Navigation */}
          {(currentCategory || currentSubcategory) && (
            <nav className="flex items-center gap-2 text-sm mb-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <Link to="/businesses" className="text-muted-foreground hover:text-foreground">
                Businesses
              </Link>
              {currentCategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={`/businesses?category=${currentCategory.slug}`}
                    className={currentSubcategory ? "text-muted-foreground hover:text-foreground" : "font-medium text-foreground"}
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

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {currentSubcategory?.name || currentCategory?.name || 'Business Listings'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {currentCategory
                ? `Explore ${currentCategory.name.toLowerCase()} businesses for sale`
                : 'Discover verified businesses ready for acquisition'
              }
            </p>
            <div className="flex justify-center">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Quick Filter Category Chips */}
          {!currentCategory && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {SMERGERS_BUSINESS_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/businesses?category=${cat.slug}`}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Subcategory Chips when category is selected */}
          {currentCategory && currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Link
                to={`/businesses?category=${currentCategory.slug}`}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${!currentSubcategory
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                All {currentCategory.name}
              </Link>
              {currentCategory.subcategories.slice(0, 10).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/businesses?category=${currentCategory.slug}&subcategory=${sub.slug}`}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${currentSubcategory?.id === sub.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
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
              <Filters type="business" onFiltersChange={handleFiltersChange} />
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
                      {filteredBusinesses.length} businesses found
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
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="price-low">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="price-high">
                            Price: High to Low
                          </SelectItem>
                          <SelectItem value="revenue-high">
                            Revenue: High to Low
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
                {filters.location.map((location) => (
                  <Badge key={location} variant="secondary">
                    Location: {location}
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
                          isSaved={savedBusinesses.has(business.id)}
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
                      isSaved={savedBusinesses.has(business.id)}
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
                    isSaved={savedBusinesses.has(business.id)}
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
    </div>
  );
}
