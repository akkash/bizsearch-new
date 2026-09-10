import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import { Filters, FilterState } from "@/polymet/components/filters";
import { ComparisonFeature } from "@/polymet/components/comparison-feature";
import { FranchiseService, type FranchiseFilters } from "@/lib/franchise-service";
import { SkeletonLoader } from "@/polymet/components/skeleton-loader";
import { EmptyState } from "@/polymet/components/empty-state";
import type { Franchise } from "@/types/listings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useFranchiseCompare } from "@/hooks/use-franchise-compare";
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
  GitCompareArrows,
  Scale,
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
  const { user } = useAuth();
  const { isListingSaved, toggleSave } = useSavedListings();
  const { compareIds, toggleCompare, removeCompare, clearCompare, isCompared, maxCompare } =
    useFranchiseCompare();
  const [searchParams] = useSearchParams();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvestmentRange, setSelectedInvestmentRange] =
    useState<string>("");
  const itemsPerPage = 12;

  // Parse URL params for category filtering and search
  const categorySlug = searchParams.get("category") || searchParams.get("industry");
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

  // Fetch franchises from Supabase (active only, with server-side filters)
  useEffect(() => {
    const fetchFranchises = async () => {
      setLoading(true);
      setError(null);
      try {
        const serverFilters: FranchiseFilters = {};
        if (urlSearchQuery) serverFilters.search = urlSearchQuery;
        if (searchQuery.trim()) serverFilters.search = searchQuery.trim();
        if (currentCategory) {
          serverFilters.industry = [currentCategory.name];
        }
        if (filters?.industry?.length) {
          serverFilters.industry = filters.industry;
        }
        if (filters?.state?.length) {
          serverFilters.state = filters.state;
        }
        if (filters?.city?.length) {
          serverFilters.city = filters.city;
        }
        if (filters?.franchiseFee) {
          serverFilters.investmentMin = filters.franchiseFee[0];
          serverFilters.investmentMax = filters.franchiseFee[1];
        }
        if (selectedInvestmentRange) {
          const range = investmentRanges.find((r) => r.label === selectedInvestmentRange);
          if (range) {
            serverFilters.investmentMin = range.min;
            serverFilters.investmentMax = range.max === Infinity ? undefined : range.max;
          }
        }

        const result = await FranchiseService.getFranchises(serverFilters);
        setFranchises(Array.isArray(result) ? result : []);
      } catch (fetchError) {
        console.error('❌ FranchiseListings: Error:', fetchError);
        setFranchises([]);
        setError('Unable to load franchise listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFranchises();
  }, [urlSearchQuery, searchQuery, filters, selectedInvestmentRange, currentCategory?.name]);

  // Filter and search logic
  const filteredFranchises = useMemo(() => {
    let filtered = [...franchises];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (franchise) =>
          franchise.brandName?.toLowerCase().includes(query) ||
          franchise.brand_name?.toLowerCase().includes(query) ||
          franchise.industry.toLowerCase().includes(query) ||
          franchise.description.toLowerCase().includes(query) ||
          (franchise.highlights || franchise.competitiveEdge || []).some((advantage: unknown) =>
            String(advantage).toLowerCase().includes(query)
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
          const investment =
            franchise.investmentMin ??
            franchise.total_investment_min ??
            franchise.investmentMax ??
            franchise.total_investment_max ??
            0;
          return investment >= range.min && investment <= range.max;
        });
      }
    }

    // Apply filters
    if (filters) {
      // Industry filter
      if (filters.industry.length > 0) {
        filtered = filtered.filter((franchise) => {
          const fIndustry = franchise.industry?.toLowerCase() || '';
          return filters.industry.some(ind => fIndustry.includes(ind.toLowerCase()));
        });
      }

      // Investment range filter (franchiseFee from filter state maps to total_investment)
      if (filters.franchiseFee[0] > 0 || filters.franchiseFee[1] < 5000000) {
        filtered = filtered.filter((franchise) => {
          const minInv =
            franchise.investmentMin ??
            franchise.total_investment_min ??
            0;
          const maxInv =
            franchise.investmentMax ??
            franchise.total_investment_max ??
            minInv;
          return filters.franchiseFee[0] <= maxInv && minInv <= filters.franchiseFee[1];
        });
      }

      // Royalty percentage filter
      if (
        filters.royaltyPercentage[0] > 0 ||
        filters.royaltyPercentage[1] < 20
      ) {
        filtered = filtered.filter((franchise) => {
          const royalty = franchise.royaltyPercentage ?? franchise.royalty_percentage;
          if (royalty === undefined || royalty === null) return true;
          return (
            royalty >= filters.royaltyPercentage[0] &&
            royalty <= filters.royaltyPercentage[1]
          );
        });
      }

      // Outlets filter
      if (filters.outlets && filters.outlets !== 'any') {
        filtered = filtered.filter((franchise) => {
          const outlets = franchise.outlets ?? franchise.totalOutlets ?? franchise.total_outlets ?? 0;
          switch (filters.outlets) {
            case "1-10": return outlets <= 10;
            case "11-50": return outlets >= 11 && outlets <= 50;
            case "51-100": return outlets >= 51 && outlets <= 100;
            case "100+": return outlets > 100;
            default: return true;
          }
        });
      }

      // Multi-unit filter
      if (filters.multiUnit) {
        filtered = filtered.filter((franchise) =>
          franchise.multiUnit === true ||
          (franchise.badges || []).includes("Multi-Unit Available")
        );
      }

      // Financing filter
      if (filters.financing) {
        filtered = filtered.filter((franchise) =>
          franchise.financing === true ||
          (franchise.badges || []).includes("Financing Available")
        );
      }

      // Verification filter
      if (filters.verification.length > 0) {
        filtered = filtered.filter((franchise) => {
          const badges = franchise.badges || [];
          return filters.verification.some((verification) =>
            badges.includes(verification)
          );
        });
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "investment-low":
        filtered.sort(
          (a, b) =>
            (a.investmentMin ?? a.total_investment_min ?? 0) -
            (b.investmentMin ?? b.total_investment_min ?? 0)
        );
        break;
      case "investment-high":
        filtered.sort(
          (a, b) =>
            (b.investmentMin ?? b.total_investment_min ?? 0) -
            (a.investmentMin ?? a.total_investment_min ?? 0)
        );
        break;
      case "roi-high":
        filtered.sort((a, b) => {
          const roiA = a.expectedRoiPercentage ?? a.expected_roi_percentage ?? 0;
          const roiB = b.expectedRoiPercentage ?? b.expected_roi_percentage ?? 0;
          return roiB - roiA;
        });
        break;
      case "outlets-high":
        filtered.sort(
          (a, b) =>
            (b.outlets ?? b.total_outlets ?? 0) - (a.outlets ?? a.total_outlets ?? 0)
        );
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
          const dateB = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
          return dateB - dateA;
        });
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

  const handleSave = async (franchiseId: string) => {
    if (!user) {
      toast.info("Sign in to save franchises");
      navigate("/login");
      return;
    }
    await toggleSave("franchise", franchiseId);
  };

  const handleCompare = (franchiseId: string) => {
    if (isCompared(franchiseId)) {
      removeCompare(franchiseId);
      return;
    }
    const added = toggleCompare(franchiseId);
    if (!added) {
      toast.error(`You can compare up to ${maxCompare} franchises at a time`);
      return;
    }
    setShowComparePanel(true);
  };

  const compareItems = compareIds
    .map((id) => franchises.find((f) => f.id === id))
    .filter(Boolean)
    .map((franchise) => ({
      id: franchise!.id,
      type: "franchise" as const,
      data: franchise!,
    }));

  const handleShare = (franchiseId: string) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    const identifier = franchise?.slug || franchiseId;
    const url = `${window.location.origin}/franchise/${identifier}`;
    navigator.clipboard.writeText(url);
    toast.success("Franchise link copied");
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
          <h1 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight mb-6">
            Franchise Opportunities
          </h1>
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>
    );
  }

  // Error state
  if (!loading && error) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            type="error"
            title="No details found in the table."
            description={error}
            actionText="Try Again"
            onAction={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Empty database state — not a filtered search with zero hits
  const hasActiveQuery = Boolean(
    urlSearchQuery ||
      searchQuery.trim() ||
      filters ||
      selectedInvestmentRange ||
      currentCategory
  );
  if (!loading && !error && franchises.length === 0 && !hasActiveQuery) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            type="no-data"
            title="No details found in the table."
            description="Listings will appear here when they are published."
            actionText="List Your Franchise"
            actionLink="/add-franchise-listing"
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
              <Link to="/franchises" className="text-muted-foreground hover:text-foreground transition-colors">
                Franchises
              </Link>
              {currentCategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={`/franchises?category=${currentCategory.slug}`}
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
            <h1 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight mb-3 text-foreground">
              {(() => {
                const categoryName = currentSubcategory?.name || currentCategory?.name || '';
                const locationName = filters?.city?.length
                  ? filters.city.join(', ')
                  : filters?.state?.length
                    ? filters.state.join(', ')
                    : '';

                if (categoryName && locationName) {
                  return `${categoryName} franchises in ${locationName}`;
                } else if (categoryName) {
                  return `${categoryName} franchises`;
                } else if (locationName) {
                  return `Franchises in ${locationName}`;
                }
                return 'Franchise opportunities';
              })()}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {currentCategory
                ? `Compare ${currentCategory.name.toLowerCase()} franchise investment, royalty, and outlet counts`
                : "Compare franchise brands by investment range, industry, and location"}
            </p>
          </div>

          {!currentCategory && (
            <div className="flex flex-wrap gap-2 mb-4">
              {FRANCHISE_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/franchises?category=${cat.slug}`}
                  className="px-3 py-1.5 text-sm border-2 border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {currentCategory && currentCategory.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                to={`/franchises?category=${currentCategory.slug}`}
                className={cn(
                  "px-3 py-1.5 text-sm border-2 transition-colors",
                  !currentSubcategory
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/20 hover:bg-foreground hover:text-background"
                )}
              >
                All {currentCategory.name}
              </Link>
              {currentCategory.subcategories.slice(0, 10).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/franchises?category=${currentCategory.slug}&subcategory=${sub.slug}`}
                  className={cn(
                    "px-3 py-1.5 text-sm border-2 transition-colors",
                    currentSubcategory?.id === sub.id
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/20 hover:bg-foreground hover:text-background"
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

          {/* Investment Range Quick Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUpIcon className="h-4 w-4 text-growth-green" />
              <span className="text-sm font-medium text-muted-foreground">Investment range</span>
            </div>
            <ToggleGroup
              type="single"
              value={selectedInvestmentRange}
              onValueChange={(value) => setSelectedInvestmentRange(value || "")}
              className="flex flex-wrap justify-start gap-1"
            >
              <ToggleGroupItem
                value=""
                className="px-3 py-1.5 text-sm border-2 border-foreground/20 bg-transparent data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                All Ranges
              </ToggleGroupItem>
              {investmentRanges.map((range) => (
                <ToggleGroupItem
                  key={range.label}
                  value={range.label}
                  className="px-3 py-1.5 text-sm border-2 border-foreground/20 bg-transparent data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
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
              <Filters
                type="franchise"
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
                          <SelectItem value="relevance">Best Match</SelectItem>
                          <SelectItem value="investment-low">
                            Lowest Investment
                          </SelectItem>
                          <SelectItem value="investment-high">
                            Highest Investment
                          </SelectItem>
                          <SelectItem value="roi-high">
                            Highest ROI
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
                          onCompare={handleCompare}
                          isSaved={isListingSaved("franchise", franchise.id)}
                          isCompared={isCompared(franchise.id)}
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
                      onCompare={handleCompare}
                      isSaved={isListingSaved("franchise", franchise.id)}
                      isCompared={isCompared(franchise.id)}
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
                    onCompare={handleCompare}
                    isSaved={isListingSaved("franchise", franchise.id)}
                    isCompared={isCompared(franchise.id)}
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

            {filteredFranchises.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

                  <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-2">No details found in the table.</h3>
                  <p className="text-muted-foreground mb-4">
                    Try a broader search or clear filters.
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
                    Clear Filters
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

      {compareIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40">
          <Card className="shadow-xl border-growth-green/30">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Scale className="h-4 w-4 text-growth-green" />
                {compareIds.length} selected to compare
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearCompare}>
                  Clear
                </Button>
                <Button size="sm" onClick={() => setShowComparePanel(true)}>
                  Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showComparePanel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="container mx-auto max-w-6xl py-8">
            <ComparisonFeature
              items={compareItems}
              onRemoveItem={(id) => {
                removeCompare(id);
              }}
              onAddMore={() => setShowComparePanel(false)}
              className="bg-background"
            />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowComparePanel(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
