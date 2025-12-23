import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import { Filters, FilterState } from "@/polymet/components/filters";
import { FranchiseService } from "@/lib/franchise-service";
import { SkeletonLoader } from "@/polymet/components/skeleton-loader";
import { EmptyState } from "@/polymet/components/empty-state";
import type { Franchise } from "@/types/listings";
import { toast } from "sonner";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  GridIcon,
  ListIcon,
  MapIcon,
  FilterIcon,
  SortAscIcon,
  SearchIcon,
  TrendingUpIcon,
  ChevronRightIcon,
  HomeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FRANCHISE_CATEGORIES, getCategoryBySlug } from "@/data/categories";

interface FranchiseListingsProps {
  className?: string;
}

type ViewMode = "grid" | "list" | "map";
type SortOption =
  | "relevance"
  | "investment-low"
  | "investment-high"
  | "roi-high"
  | "outlets-high"
  | "newest";

const investmentRanges = [
  { label: "Under ₹10L", min: 0, max: 1000000 },
  { label: "₹10L - ₹25L", min: 1000000, max: 2500000 },
  { label: "₹25L - ₹50L", min: 2500000, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "Above ₹1Cr", min: 10000000, max: Infinity },
];

export function FranchiseListings({ className }: FranchiseListingsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [savedFranchises, setSavedFranchises] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvestmentRange, setSelectedInvestmentRange] =
    useState<string>("");
  const itemsPerPage = 12;

  // Parse URL params for category filtering and search
  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('subcategory');
  const urlSearchQuery = searchParams.get('q');
  const currentCategory = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const currentSubcategory = currentCategory?.subcategories.find(s => s.slug === subcategorySlug);

  // Initialize search query from URL if present
  useEffect(() => {
    if (urlSearchQuery && urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Fetch franchises from Supabase
  useEffect(() => {
    const fetchFranchises = async () => {
      setLoading(true);
      try {
        const result = await FranchiseService.getFranchises({});
        if (result && Array.isArray(result)) {
          setFranchises(result as Franchise[]);
          console.log('✅ FranchiseListings: Set', result.length, 'franchises from database');
        } else {
          setFranchises([]);
          console.log('ℹ️ FranchiseListings: No franchises in database');
        }
      } catch (error) {
        console.error('❌ FranchiseListings: Error:', error);
        setFranchises([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFranchises();
  }, []);

  // Filter and search logic
  const filteredFranchises = useMemo(() => {
    let filtered = [...franchises];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (franchise) =>
          franchise.brandName?.toLowerCase().includes(query) ||
          franchise.industry.toLowerCase().includes(query) ||
          franchise.description.toLowerCase().includes(query) ||
          (franchise.competitiveEdge || franchise.highlights || []).some((advantage: any) =>
            advantage?.toLowerCase().includes(query)
          )
      );
    }

    // Apply category filter from URL
    if (currentCategory) {
      filtered = filtered.filter((franchise) => {
        const franchiseIndustry = franchise.industry?.toLowerCase() || '';
        const categoryName = currentCategory.name.toLowerCase();
        // Match by category name or any of its subcategories
        if (currentSubcategory) {
          // Filter by specific subcategory
          const subcategoryName = currentSubcategory.name.toLowerCase();
          return franchiseIndustry.includes(subcategoryName) ||
            franchiseIndustry.includes(categoryName);
        }
        // Match any franchise in this category
        return franchiseIndustry.includes(categoryName) ||
          currentCategory.subcategories.some(sub =>
            franchiseIndustry.includes(sub.name.toLowerCase())
          );
      });
    }

    // Apply investment range quick filter
    if (selectedInvestmentRange) {
      const range = investmentRanges.find(
        (r) => r.label === selectedInvestmentRange
      );
      if (range) {
        filtered = filtered.filter((franchise) => {
          const investment = franchise.total_investment_min || franchise.total_investment_max || 0;
          return investment >= range.min && investment <= range.max;
        });
      }
    }

    // Apply filters
    if (filters) {
      // Industry filter
      if (filters.industry.length > 0) {
        filtered = filtered.filter((franchise) =>
          filters.industry.includes(franchise.industry)
        );
      }

      // Investment range filter
      if (filters.franchiseFee[0] > 0 || filters.franchiseFee[1] < 5000000) {
        filtered = filtered.filter((franchise) => {
          const investment = franchise.total_investment_min || franchise.total_investment_max || 0;
          return (
            investment >= filters.franchiseFee[0] &&
            investment <= filters.franchiseFee[1]
          );
        });
      }

      // Royalty percentage filter
      if (
        filters.royaltyPercentage[0] > 0 ||
        filters.royaltyPercentage[1] < 20
      ) {
        filtered = filtered.filter((franchise) => {
          const royalty = franchise.royalty_percentage || franchise.royaltyPercentage || 0;
          return (
            royalty >= filters.royaltyPercentage[0] &&
            royalty <= filters.royaltyPercentage[1]
          );
        });
      }

      // Outlets filter
      if (filters.outlets) {
        filtered = filtered.filter((franchise) => {
          const outlets = franchise.total_outlets || franchise.outlets || 0;
          switch (filters.outlets) {
            case "1-10":
              return outlets <= 10;
            case "11-50":
              return outlets >= 11 && outlets <= 50;
            case "51-100":
              return outlets >= 51 && outlets <= 100;
            case "100+":
              return outlets > 100;
            default:
              return true;
          }
        });
      }

      // Multi-unit filter
      if (filters.multiUnit) {
        filtered = filtered.filter((franchise) =>
          franchise.badges.includes("Multi-Unit Available")
        );
      }

      // Financing filter
      if (filters.financing) {
        filtered = filtered.filter((franchise) =>
          franchise.badges.includes("Financing Available")
        );
      }

      // Verification filter
      if (filters.verification.length > 0) {
        filtered = filtered.filter((franchise) =>
          filters.verification.some((verification) =>
            franchise.badges.includes(verification)
          )
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "investment-low":
        filtered.sort((a, b) => (a.total_investment_min || 0) - (b.total_investment_min || 0));
        break;
      case "investment-high":
        filtered.sort((a, b) => (b.total_investment_min || 0) - (a.total_investment_min || 0));
        break;
      case "roi-high":
        filtered.sort((a, b) => {
          const roiA = a.expected_roi_percentage || 0;
          const roiB = b.expected_roi_percentage || 0;
          return roiB - roiA;
        });
        break;
      case "outlets-high":
        filtered.sort((a, b) => (b.total_outlets || b.outlets || 0) - (a.total_outlets || a.outlets || 0));
        break;
      case "newest":
        // Since establishedYear doesn't exist, skip this sort
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [searchQuery, filters, sortBy, selectedInvestmentRange, franchises, currentCategory, currentSubcategory]);

  // Pagination
  const totalPages = Math.ceil(filteredFranchises.length / itemsPerPage);
  const paginatedFranchises = filteredFranchises.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSave = (franchiseId: string) => {
    setSavedFranchises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(franchiseId)) {
        newSet.delete(franchiseId);
      } else {
        newSet.add(franchiseId);
      }
      return newSet;
    });
  };

  const handleShare = (franchiseId: string) => {
    console.log("Share franchise:", franchiseId);
  };

  const handleContact = (franchiseId: string) => {
    // Find the franchise to get details
    const franchise = franchises.find(f => f.id === franchiseId);
    const brandName = franchise?.brand_name || franchise?.brandName || 'Franchise';
    const identifier = franchise?.slug || franchiseId;

    // Show toast with contact info
    toast.success(`Contacting ${brandName}`, {
      description: "Opening contact options...",
    });

    // Navigate to detail page with contact param to trigger contact dialog
    navigate(`/franchise/${identifier}?contact=true`);
  };

  const handleViewDetails = (franchiseId: string) => {
    // Find the franchise to get its slug
    const franchise = franchises.find(f => f.id === franchiseId);
    const identifier = franchise?.slug || franchiseId;
    navigate(`/franchise/${identifier}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Franchise Opportunities</h1>
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && filteredFranchises.length === 0 && franchises.length === 0) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Franchise Opportunities</h1>
          <EmptyState
            type="no-data"
            title="No Franchises Available Yet"
            description="We're constantly adding new franchise opportunities. Check back soon!"
            actionText="List Your Franchise"
            actionLink="/add-franchise-listing"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Hero Header - Matching Homepage Design */}
      <div className="relative bg-gradient-to-br from-trust-blue via-[hsl(213,55%,18%)] to-[hsl(213,60%,12%)] dark:from-[hsl(213,40%,8%)] dark:via-[hsl(213,45%,6%)] dark:to-[hsl(213,50%,4%)]">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb Navigation */}
          {(currentCategory || currentSubcategory) && (
            <nav className="flex items-center gap-2 text-sm mb-6">
              <Link to="/" className="text-white/70 hover:text-white flex items-center gap-1 transition-colors">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-white/50" />
              <Link to="/franchises" className="text-white/70 hover:text-white transition-colors">
                Franchises
              </Link>
              {currentCategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-white/50" />
                  <Link
                    to={`/franchises?category=${currentCategory.slug}`}
                    className={currentSubcategory ? "text-white/70 hover:text-white transition-colors" : "font-medium text-white"}
                  >
                    {currentCategory.name}
                  </Link>
                </>
              )}
              {currentSubcategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-white/50" />
                  <span className="font-medium text-white">{currentSubcategory.name}</span>
                </>
              )}
            </nav>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              {(() => {
                const categoryName = currentSubcategory?.name || currentCategory?.name || '';
                const locationName = filters?.city?.length
                  ? filters.city.join(', ')
                  : filters?.state?.length
                    ? filters.state.join(', ')
                    : '';

                if (categoryName && locationName) {
                  return `${categoryName} Franchise Opportunities in ${locationName}`;
                } else if (categoryName) {
                  return `${categoryName} Franchise Opportunities`;
                } else if (locationName) {
                  return `Franchise Opportunities in ${locationName}`;
                }
                return 'Franchise Opportunities';
              })()}
            </h1>
          </div>

          {/* Quick Filter Category Chips */}
          {!currentCategory && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {FRANCHISE_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/franchises?category=${cat.slug}`}
                  className="px-4 py-2 text-sm rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all backdrop-blur-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Subcategory Chips when category is selected */}
          {currentCategory && currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Link
                to={`/franchises?category=${currentCategory.slug}`}
                className={`px-4 py-2 text-sm rounded-full border transition-all backdrop-blur-sm ${!currentSubcategory
                  ? 'bg-growth-green text-white border-growth-green'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                  }`}
              >
                All {currentCategory.name}
              </Link>
              {currentCategory.subcategories.slice(0, 10).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/franchises?category=${currentCategory.slug}&subcategory=${sub.slug}`}
                  className={`px-4 py-2 text-sm rounded-full border transition-all backdrop-blur-sm ${currentSubcategory?.id === sub.id
                    ? 'bg-growth-green text-white border-growth-green'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                    }`}
                >
                  {sub.name}
                </Link>
              ))}
              {currentCategory.subcategories.length > 10 && (
                <span className="px-4 py-2 text-sm text-white/60">
                  +{currentCategory.subcategories.length - 10} more
                </span>
              )}
            </div>
          )}

          {/* Investment Range Quick Filters */}
          <div className="mt-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUpIcon className="h-4 w-4 text-growth-green" />
              <span className="text-sm font-medium text-white">Investment Range:</span>
            </div>
            <ToggleGroup
              type="single"
              value={selectedInvestmentRange}
              onValueChange={(value) => setSelectedInvestmentRange(value || "")}
              className="flex flex-wrap justify-center gap-1"
            >
              <ToggleGroupItem
                value=""
                className="px-4 py-2 text-sm rounded-full border border-white/20 data-[state=on]:bg-growth-green data-[state=on]:text-white data-[state=on]:border-growth-green text-white/80 hover:bg-white/10 transition-all"
              >
                All Ranges
              </ToggleGroupItem>
              {investmentRanges.map((range) => (
                <ToggleGroupItem
                  key={range.label}
                  value={range.label}
                  className="px-4 py-2 text-sm rounded-full border border-white/20 data-[state=on]:bg-growth-green data-[state=on]:text-white data-[state=on]:border-growth-green text-white/80 hover:bg-white/10 transition-all"
                >
                  {range.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 space-y-6">
              <Filters type="franchise" onFiltersChange={handleFiltersChange} />
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
                      {filteredFranchises.length} franchises found
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
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="investment-low">
                            Investment: Low to High
                          </SelectItem>
                          <SelectItem value="investment-high">
                            Investment: High to Low
                          </SelectItem>
                          <SelectItem value="roi-high">
                            ROI: High to Low
                          </SelectItem>
                          <SelectItem value="outlets-high">
                            Most Outlets
                          </SelectItem>
                          <SelectItem value="newest">Newest Brands</SelectItem>
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
            {(filters || selectedInvestmentRange) && (
              <div className="flex flex-wrap gap-2">
                {selectedInvestmentRange && (
                  <Badge variant="secondary">
                    Investment: {selectedInvestmentRange}
                  </Badge>
                )}
                {filters?.industry.map((industry) => (
                  <Badge key={industry} variant="secondary">
                    Industry: {industry}
                  </Badge>
                ))}
                {filters &&
                  (filters.franchiseFee[0] > 0 ||
                    filters.franchiseFee[1] < 5000000) && (
                    <Badge variant="secondary">
                      Investment: ₹
                      {(filters.franchiseFee[0] / 100000).toFixed(1)}L - ₹
                      {(filters.franchiseFee[1] / 100000).toFixed(1)}L
                    </Badge>
                  )}
                {filters &&
                  (filters.royaltyPercentage[0] > 0 ||
                    filters.royaltyPercentage[1] < 20) && (
                    <Badge variant="secondary">
                      Royalty: {filters.royaltyPercentage[0]}% -{" "}
                      {filters.royaltyPercentage[1]}%
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
                    <p className="text-muted-foreground">Loading franchises...</p>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === "grid" && (
              <>
                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {paginatedFranchises.map((franchise) => (
                      <div
                        key={franchise.id}
                        className="flex-none w-80 snap-start"
                      >
                        <FranchiseCard
                          franchise={franchise}
                          onSave={handleSave}
                          onShare={handleShare}
                          onContact={handleContact}
                          onViewDetails={handleViewDetails}
                          isSaved={savedFranchises.has(franchise.id)}
                        />
                      </div>
                    ))}
                    {paginatedFranchises.length === 0 && (
                      <div className="flex-none w-80 p-8 text-center text-muted-foreground">
                        No franchises match your criteria
                      </div>
                    )}
                  </div>

                  {/* Mobile Scroll Indicator */}
                  <div className="flex justify-center gap-1 mt-4">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(paginatedFranchises.length / 3)
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
                  {paginatedFranchises.map((franchise) => (
                    <FranchiseCard
                      key={franchise.id}
                      franchise={franchise}
                      onSave={handleSave}
                      onShare={handleShare}
                      onContact={handleContact}
                      onViewDetails={handleViewDetails}
                      isSaved={savedFranchises.has(franchise.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {viewMode === "list" && (
              <div className="space-y-4">
                {paginatedFranchises.map((franchise) => (
                  <FranchiseCard
                    key={franchise.id}
                    franchise={franchise}
                    onSave={handleSave}
                    onShare={handleShare}
                    onContact={handleContact}
                    onViewDetails={handleViewDetails}
                    isSaved={savedFranchises.has(franchise.id)}
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

                    <h3 className="font-semibold mb-2">Territory Map</h3>
                    <p className="text-muted-foreground">
                      Interactive territory availability map coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {filteredFranchises.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

                  <h3 className="font-semibold mb-2">No franchises found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilters(null);
                      setSelectedInvestmentRange("");
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
