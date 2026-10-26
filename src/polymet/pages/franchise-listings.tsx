import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import { Filters, FilterState, countActiveFilters, createFilterState } from "@/polymet/components/filters";
import { ComparisonFeature } from "@/polymet/components/comparison-feature";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { FranchiseService, type FranchiseFilters } from "@/lib/franchise-service";
import { sortFranchisesByBestMatch } from "@/lib/franchise-best-match";
import { SavedSearchService } from "@/lib/saved-search-service";
import { useFeatureFlag } from "@/contexts/FeatureFlagsContext";
import { SkeletonLoader } from "@/polymet/components/skeleton-loader";
import { EmptyState } from "@/polymet/components/empty-state";
import type { Franchise } from "@/types/listings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useFranchiseCompare } from "@/hooks/use-franchise-compare";
import { FranchiseeIntentService } from "@/lib/franchisee-intent-service";
import { readMatchDraft, saveMatchDraft } from "@/lib/intent-draft";
import { getStoreFormatsFromFranchise } from "@/lib/store-formats";
import {
  buildCompareSlots,
  budgetToCapacity,
  parseCompareParam,
  searchFromParams,
  serializeCompareParam,
  timeToExperience,
  type CompareSeeker,
} from "@/lib/franchise-compare";
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
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  GridIcon,
  ListIcon,
  FilterIcon,
  SortAscIcon,
  SearchIcon,
  TrendingUpIcon,
  ChevronRightIcon,
  HomeIcon,
  Scale,
  XIcon,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/seo-head";
import { FRANCHISE_CATEGORIES, getCategoryBySlug } from "@/data/categories";
import { franchiseMatchesCity } from "@/lib/franchise-search";

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

const chipClass =
  "shrink-0 inline-flex items-center justify-center min-h-11 rounded-full px-4 text-sm border transition-colors";

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
  const savedSearchesEnabled = useFeatureFlag("saved_searches");
  const [savingSearch, setSavingSearch] = useState(false);
  const { isListingSaved, toggleSave } = useSavedListings();
  const { compareIds, toggleCompare, replaceCompare, removeCompare, clearCompare, isCompared, maxCompare } =
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isDesktopFilters, setIsDesktopFilters] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
  );
  const [shortlist, setShortlist] = useState<Franchise[]>([]);
  const [enquireFranchise, setEnquireFranchise] = useState<Franchise | null>(null);
  const [enquiringId, setEnquiringId] = useState<string | null>(null);
  const [seekerIntent, setSeekerIntent] = useState<CompareSeeker>({ cities: [] });
  const appliedCompareTokens = useRef("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvestmentRange, setSelectedInvestmentRange] =
    useState<string>("");
  const itemsPerPage = 12;

  // Parse URL params for category filtering and search
  const categorySlug = searchParams.get("category") || searchParams.get("industry");
  const subcategorySlug = searchParams.get('subcategory');
  const urlSearchQuery = searchParams.get('q');
  const urlCity = searchParams.get("city") || "";
  const urlBudget = Number(searchParams.get("budget") || "");
  const compareParsed = parseCompareParam(searchParams.get("compare"));
  const workspaceOpen = compareParsed.openWorkspace;
  const currentCategory = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const currentSubcategory = currentCategory?.subcategories.find(s => s.slug === subcategorySlug);

  useEffect(() => {
    const key = compareParsed.tokens.join(",");
    if (!compareParsed.tokens.length || key === appliedCompareTokens.current) return;
    appliedCompareTokens.current = key;
    let cancelled = false;
    const hydrate = async () => {
      const found = await FranchiseService.getFranchisesByTokens(compareParsed.tokens);
      if (cancelled) return;
      setShortlist(found);
      replaceCompare(
        compareParsed.tokens.map((token) => {
          const match = found.find(
            (row) => row.id === token || String(row.slug || "").toLowerCase() === token.toLowerCase()
          );
          return match?.id || token;
        })
      );
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [compareParsed.tokens.join(","), replaceCompare]);

  useEffect(() => {
    if (!compareIds.length) {
      if (!compareParsed.tokens.length) setShortlist([]);
      return;
    }
    let cancelled = false;
    void FranchiseService.getFranchisesByTokens(compareIds).then((found) => {
      if (!cancelled) setShortlist(found);
    });
    return () => {
      cancelled = true;
    };
  }, [compareIds.join(",")]);

  const applyListingSearch = (params: URLSearchParams, replace = false) => {
    navigate({ pathname: "/franchises", search: searchFromParams(params) }, { replace });
  };

  const listingsHref = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    return `/franchises${searchFromParams(params)}`;
  };

  useEffect(() => {
    if (!workspaceOpen) return;
    if (
      compareParsed.tokens.length &&
      appliedCompareTokens.current !== compareParsed.tokens.join(",")
    ) {
      return;
    }
    const next = serializeCompareParam(compareIds, true);
    const current = searchParams.get("compare");
    if (!next || next === current) return;
    const params = new URLSearchParams(searchParams);
    params.set("compare", next);
    applyListingSearch(params, true);
  }, [compareIds.join(","), workspaceOpen, compareParsed.tokens.join(",")]);

  useEffect(() => {
    const draft = readMatchDraft();
    const fromUrl = urlCity ? [urlCity] : [];
    if (!user) {
      setSeekerIntent({
        cities: fromUrl.length ? fromUrl : draft?.preferredLocations || [],
        budgetMax: draft?.budgetMax ?? (urlBudget || null),
        timeCommitment: draft?.timeCommitment,
        liquidCapital: draft?.liquidCapital,
        netWorth: draft?.netWorth,
      });
      return;
    }
    let cancelled = false;
    void FranchiseeIntentService.get(user.id).then((intent) => {
      if (cancelled) return;
      const cities =
        fromUrl.length
          ? fromUrl
          : intent?.preferredCities?.length
            ? intent.preferredCities
            : draft?.preferredLocations || [];
      setSeekerIntent({
        cities,
        budgetMax: intent?.investmentBudgetMax ?? draft?.budgetMax ?? (urlBudget || null),
        timeCommitment: intent?.timeCommitment || draft?.timeCommitment,
        liquidCapital: intent?.liquidCapital ?? draft?.liquidCapital,
        netWorth: intent?.netWorth ?? draft?.netWorth,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, urlCity, urlBudget]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktopFilters(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
        if (urlCity) {
          serverFilters.city = [urlCity];
        }
        if (filters?.city?.length) {
          serverFilters.city = filters.city;
        }
        if (Number.isFinite(urlBudget) && urlBudget > 0) {
          serverFilters.capitalMax = urlBudget;
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
  }, [urlSearchQuery, searchQuery, filters, selectedInvestmentRange, currentCategory?.name, urlCity, urlBudget]);

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

    if (urlCity) {
      filtered = filtered.filter((franchise) => franchiseMatchesCity(franchise, urlCity));
    }

    if (Number.isFinite(urlBudget) && urlBudget > 0) {
      filtered = filtered.filter((franchise) => {
        const minInv =
          franchise.investmentMin ??
          franchise.total_investment_min ??
          franchise.investmentMax ??
          franchise.total_investment_max ??
          0;
        return minInv <= urlBudget;
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

      if (filters.spaceRange && (filters.spaceRange[0] > 0 || filters.spaceRange[1] < 5000)) {
        filtered = filtered.filter((franchise) => {
          const min = franchise.min_area_sqft ?? franchise.space_required_sqft ?? 0;
          const max = franchise.max_area_sqft ?? min;
          if (!min && !max) return true;
          return filters.spaceRange[0] <= max && min <= filters.spaceRange[1];
        });
      }

      if (filters.formatModel?.length) {
        filtered = filtered.filter((franchise) => {
          const ownerOp = franchise.owner_operator_required;
          if (ownerOp == null) return true;
          const models: string[] = [];
          if (ownerOp === true) models.push("FOFO");
          if (ownerOp === false) models.push("FOCO");
          return filters.formatModel.some((m) => models.includes(m));
        });
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
        return sortFranchisesByBestMatch(filtered, {
          city: urlCity || filters?.city?.[0] || undefined,
          budgetMax: Number.isFinite(urlBudget) && urlBudget > 0 ? urlBudget : undefined,
        });
    }

    return filtered;
  }, [searchQuery, filters, sortBy, selectedInvestmentRange, franchises, currentCategory, currentSubcategory, urlCity, urlBudget]);

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

  const openWorkspace = () => {
    const params = new URLSearchParams(searchParams);
    params.set("compare", serializeCompareParam(compareIds, true) || "1");
    applyListingSearch(params);
    window.requestAnimationFrame(() => {
      document.getElementById("compare-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeWorkspace = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("compare");
    applyListingSearch(params);
  };

  const handleCompare = (franchiseId: string) => {
    if (isCompared(franchiseId)) {
      removeCompare(franchiseId);
      return;
    }
    const added = toggleCompare(franchiseId);
    if (!added) {
      toast.error(`You can compare up to ${maxCompare} franchises at a time`);
    }
  };

  const handleShareCompare = async () => {
    const params = new URLSearchParams(searchParams);
    params.set("compare", serializeCompareParam(compareIds, true) || "1");
    const url = `${window.location.origin}/franchises${searchFromParams(params)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Compare link copied");
  };

  const handleKeepFit = (franchise: Franchise) => {
    const draft = readMatchDraft();
    saveMatchDraft({
      ...draft,
      budgetMax: seekerIntent.budgetMax ?? draft?.budgetMax,
      preferredLocations: seekerIntent.cities.length ? seekerIntent.cities : draft?.preferredLocations,
      liquidCapital: seekerIntent.liquidCapital ?? draft?.liquidCapital,
      netWorth: seekerIntent.netWorth ?? draft?.netWorth,
      timeCommitment: seekerIntent.timeCommitment || draft?.timeCommitment,
      industries: franchise.industry ? [franchise.industry] : draft?.industries,
      enquireFranchiseId: franchise.id,
    });
    navigate("/match");
  };

  const handleEnquireCompare = (franchise: Franchise) => {
    setEnquiringId(franchise.id);
    setEnquireFranchise(franchise);
  };

  const compareSource = useMemo(() => {
    const byId = new Map(shortlist.map((row) => [row.id, row]));
    franchises.forEach((row) => {
      if (compareIds.includes(row.id) && !byId.has(row.id)) byId.set(row.id, row);
    });
    return Array.from(byId.values());
  }, [shortlist, franchises, compareIds]);
  const compareSlots = buildCompareSlots(compareIds, compareSource);
  const showCompareTray = compareIds.length > 0 || workspaceOpen;

  const handleShare = (franchiseId: string) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    const identifier = franchise?.slug || franchiseId;
    const url = `${window.location.origin}/franchise/${identifier}`;
    navigator.clipboard.writeText(url);
    toast.success("Franchise link copied");
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast.info("Sign in to get alerts when new franchises match this search.");
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setSavingSearch(true);
    try {
      const city = urlCity || filters?.city?.[0] || undefined;
      const nameParts = [
        currentCategory?.name,
        city,
        searchQuery.trim() || urlSearchQuery,
      ].filter(Boolean);
      await SavedSearchService.create(user.id, {
        name: nameParts.join(" · ") || "Franchise search",
        query: searchQuery.trim() || urlSearchQuery || undefined,
        industry: currentCategory?.name,
        city,
        budgetMax: Number.isFinite(urlBudget) && urlBudget > 0 ? urlBudget : undefined,
      });
      toast.success("Search saved. We will notify you when a matching franchise goes live.");
    } catch (error) {
      console.error("Failed to save search:", error);
      toast.error("Could not save this search.");
    } finally {
      setSavingSearch(false);
    }
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
      <div className={cn("bg-background overflow-x-hidden", className)}>
        <SEOHead
          title="Franchise opportunities in India"
          description="Browse public franchise listings by industry, investment, and location. Compare brands and enquire when you find a fit."
          canonicalUrl="/franchises"
        />
        <div className="container mx-auto px-4 py-8 xl:px-8">
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
      <div className={cn("bg-background overflow-x-hidden", className)}>
        <SEOHead
          title="Franchise opportunities in India"
          description="Browse public franchise listings by industry, investment, and location."
          canonicalUrl="/franchises"
        />
        <div className="container mx-auto px-4 py-8 xl:px-8">
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
      <div className={cn("bg-background overflow-x-hidden", className)}>
        <SEOHead
          title="Franchise opportunities in India"
          description="Browse public franchise listings by industry, investment, and location."
          canonicalUrl="/franchises"
        />
        <div className="container mx-auto px-4 py-8 xl:px-8">
          <EmptyState
            type="no-data"
            title="No details found in the table."
            description="Listings will appear here when they are published."
            actionText="List Your Franchise"
            actionLink="/list-your-franchise"
          />
        </div>
      </div>
    );
  }

  const panelFilters =
    filters ??
    createFilterState("franchise", {
      category: currentCategory?.name,
      subcategory: currentSubcategory?.name,
    });
  const listedFilterCount =
    countActiveFilters(panelFilters, "franchise") + (selectedInvestmentRange ? 1 : 0);

  const filtersPanel = (
    <Filters
      type="franchise"
      initialCategory={currentCategory?.name}
      initialSubcategory={currentSubcategory?.name}
      initialValue={filters}
      onFiltersChange={handleFiltersChange}
    />
  );

  return (
    <div className={cn("bg-background overflow-x-hidden", showCompareTray && "pb-28", className)}>
      <SEOHead
        title={currentCategory ? `${currentCategory.name} franchises` : "Franchise opportunities in India"}
        description="Browse public franchise listings by industry, investment, and location. Compare brands and enquire when you find a fit."
        canonicalUrl="/franchises"
      />
      {workspaceOpen && (
        <div id="compare-workspace" className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6 xl:px-8">
            <ComparisonFeature
              slots={compareSlots}
              seeker={seekerIntent}
              onRemoveItem={removeCompare}
              onAddMore={() => {
                document.getElementById("franchise-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onEnquire={handleEnquireCompare}
              onKeepFit={handleKeepFit}
              onShare={() => {
                void handleShareCompare();
              }}
              enquiringId={enquiringId}
              signedIn={Boolean(user)}
            />
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={closeWorkspace}>
                Hide compare
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 xl:px-8 lg:py-4">
          {(currentCategory || currentSubcategory) && (
            <nav className="mb-2 flex items-center gap-2 text-xs md:mb-4 md:text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              <Link to={listingsHref({ category: null, industry: null, subcategory: null })} className="text-muted-foreground hover:text-foreground transition-colors">
                Franchises
              </Link>
              {currentCategory && (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={listingsHref({ category: currentCategory.slug, subcategory: null })}
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

          <div className="mb-2 lg:mb-0">
            <h1 className="font-display text-2xl lg:text-3xl font-bold normal-case tracking-tight text-foreground">
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
            <p className="hidden md:block text-sm text-muted-foreground max-w-2xl">
              {currentCategory
                ? `Compare ${currentCategory.name.toLowerCase()} franchise investment, royalty, and outlet counts`
                : "Compare franchise brands by investment range, industry, and location"}
            </p>
          </div>

          <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide flex-nowrap lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="lg:hidden h-11 min-h-11 shrink-0 px-4 normal-case tracking-normal"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <FilterIcon className="h-4 w-4" />
              {listedFilterCount > 0 ? `Filters (${listedFilterCount})` : "Filters"}
            </Button>

            {!currentCategory &&
              FRANCHISE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={listingsHref({ category: cat.slug, subcategory: null })}
                  className={cn(
                    chipClass,
                    "border-border hover:bg-foreground hover:text-background"
                  )}
                >
                  {cat.name}
                </Link>
              ))}

            {currentCategory && currentCategory.subcategories.length > 0 && (
              <>
                <Link
                  to={listingsHref({ category: currentCategory.slug, subcategory: null })}
                  className={cn(
                    chipClass,
                    !currentSubcategory
                      ? "bg-growth-green text-white border-growth-green"
                      : "border-border hover:bg-foreground hover:text-background"
                  )}
                >
                  All {currentCategory.name}
                </Link>
                {currentCategory.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={listingsHref({ category: currentCategory.slug, subcategory: sub.slug })}
                    className={cn(
                      chipClass,
                      currentSubcategory?.id === sub.id
                        ? "bg-growth-green text-white border-growth-green"
                        : "border-border hover:bg-foreground hover:text-background"
                    )}
                  >
                    {sub.name}
                  </Link>
                ))}
              </>
            )}

            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUpIcon className="h-4 w-4 text-growth-green" />
              Investment range
            </span>
            <ToggleGroup
              type="single"
              value={selectedInvestmentRange}
              onValueChange={(value) => setSelectedInvestmentRange(value || "")}
              className="flex shrink-0 flex-nowrap justify-start gap-2"
            >
              <ToggleGroupItem
                value=""
                className="h-11 min-h-11 shrink-0 rounded-full px-4 text-sm border border-border bg-transparent data-[state=on]:bg-growth-green data-[state=on]:text-white data-[state=on]:border-growth-green text-foreground hover:bg-foreground hover:text-background"
              >
                All Ranges
              </ToggleGroupItem>
              {investmentRanges.map((range) => (
                <ToggleGroupItem
                  key={range.label}
                  value={range.label}
                  className="h-11 min-h-11 shrink-0 rounded-full px-4 text-sm border border-border bg-transparent data-[state=on]:bg-growth-green data-[state=on]:text-white data-[state=on]:border-growth-green text-foreground hover:bg-foreground hover:text-background"
                >
                  {range.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div id="franchise-results" className="container mx-auto px-4 py-2 xl:px-8 lg:py-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {isDesktopFilters && showFilters && (
            <div className="lg:w-80 shrink-0">
              {filtersPanel}
            </div>
          )}

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-6 pt-8"
            >
              <SheetTitle className="sr-only">Filters</SheetTitle>
              {!isDesktopFilters && filtersPanel}
              <Button
                className="sticky bottom-0 z-10 mt-4 min-h-11 w-full bg-background"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show results
              </Button>
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-3 lg:space-y-6">
            {/* Controls Bar */}
            <div className="flex items-center gap-2 md:hidden">
              <p className="shrink-0 text-sm font-medium">
                {filteredFranchises.length} {filteredFranchises.length === 1 ? "brand" : "brands"}
              </p>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="h-11 min-h-11 min-w-0 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Best Match</SelectItem>
                  <SelectItem value="investment-low">Lowest Investment</SelectItem>
                  <SelectItem value="investment-high">Highest Investment</SelectItem>
                  <SelectItem value="roi-high">Highest ROI</SelectItem>
                  <SelectItem value="outlets-high">Most Outlets</SelectItem>
                  <SelectItem value="newest">Newest Brands</SelectItem>
                </SelectContent>
              </Select>
              {savedSearchesEnabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveSearch}
                  disabled={savingSearch}
                  className="h-11 min-h-11 shrink-0 px-3"
                  aria-label="Alert me"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Card className="hidden md:block">
              <CardContent className="p-3 md:p-4">
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="hidden lg:inline-flex gap-2 min-h-11"
                    >
                      <FilterIcon className="h-4 w-4" />
                      {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                    <Separator orientation="vertical" className="hidden h-6 lg:block" />

                    <div className="text-sm font-medium">
                      Showing {filteredFranchises.length} {filteredFranchises.length === 1 ? "Opportunity" : "Opportunities"}
                    </div>
                    {(urlCity || filters?.city?.length || filters?.state?.length) ? (
                      <p className="basis-full text-xs text-muted-foreground sm:basis-auto sm:max-w-md">
                        Location filters use headquarters and listed expansion text, not confirmed open territories.
                      </p>
                    ) : null}
                    {savedSearchesEnabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveSearch}
                        disabled={savingSearch}
                        className="h-11 min-h-11 shrink-0"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Alert me
                      </Button>
                    )}
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {/* Sort */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
                      <SortAscIcon className="h-4 w-4 shrink-0" />

                      <Select
                        value={sortBy}
                        onValueChange={(value: SortOption) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-full sm:w-48">
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
                    <div className="flex shrink-0 items-center rounded-lg border border-border overflow-hidden">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "h-11 w-11 min-h-11 min-w-11 rounded-none",
                          viewMode === "grid" ? "bg-growth-green text-white" : "text-muted-foreground"
                        )}
                        aria-pressed={viewMode === "grid"}
                        aria-label="Grid view"
                      >
                        <GridIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "h-11 w-11 min-h-11 min-w-11 rounded-none",
                          viewMode === "list" ? "bg-growth-green text-white" : "text-muted-foreground"
                        )}
                        aria-pressed={viewMode === "list"}
                        aria-label="List view"
                      >
                        <ListIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {(filters || selectedInvestmentRange || urlCity || currentCategory) && (
              <div className="hidden md:flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-visible">
                {selectedInvestmentRange && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Investment: {selectedInvestmentRange}
                    <button type="button" aria-label="Remove investment filter" onClick={() => setSelectedInvestmentRange("")}>
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {urlCity && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    City: {urlCity}
                  </Badge>
                )}
                {currentCategory && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Industry: {currentCategory.name}
                    <Link to="/franchises" aria-label="Remove industry filter">
                      <XIcon className="h-3 w-3" />
                    </Link>
                  </Badge>
                )}
                {filters?.industry.map((industry) => (
                  <Badge key={industry} variant="secondary" className="rounded-lg">
                    Industry: {industry}
                  </Badge>
                ))}
                {filters &&
                  (filters.franchiseFee[0] > 0 ||
                    filters.franchiseFee[1] < 5000000) && (
                    <Badge variant="secondary" className="rounded-lg">
                      Investment: ₹
                      {(filters.franchiseFee[0] / 100000).toFixed(1)}L - ₹
                      {(filters.franchiseFee[1] / 100000).toFixed(1)}L
                    </Badge>
                  )}
                {filters &&
                  (filters.royaltyPercentage[0] > 0 ||
                    filters.royaltyPercentage[1] < 20) && (
                    <Badge variant="secondary" className="rounded-lg">
                      Royalty: {filters.royaltyPercentage[0]}% -{" "}
                      {filters.royaltyPercentage[1]}%
                    </Badge>
                  )}
                {filters?.city?.map((city) => (
                  <Badge key={city} variant="secondary" className="rounded-lg">
                    City: {city}
                  </Badge>
                ))}
                {filters?.state?.map((state) => (
                  <Badge key={state} variant="secondary" className="rounded-lg">
                    State: {state}
                  </Badge>
                ))}
                {(filters || selectedInvestmentRange || currentCategory) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setSelectedInvestmentRange("");
                      setFilters(null);
                      if (currentCategory || urlCity) {
                        applyListingSearch(
                          (() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete("category");
                            params.delete("industry");
                            params.delete("subcategory");
                            params.delete("city");
                            params.delete("q");
                            params.delete("budget");
                            return params;
                          })()
                        );
                      }
                    }}
                  >
                    Clear All
                  </Button>
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
                <div className="grid grid-cols-1 gap-4 md:hidden">
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
                  {paginatedFranchises.length === 0 && (
                    <p className="p-8 text-center text-muted-foreground">
                      No franchises match this search.
                    </p>
                  )}
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
                    variant="list"
                  />
                ))}
              </div>
            )}

            {filteredFranchises.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-2">
                    {franchises.length === 0
                      ? "No details found in the table."
                      : "No franchises match this search"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {franchises.length === 0
                      ? "Listings will appear here when they are published."
                      : "Try a broader city, budget, or industry filter."}
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

      {showCompareTray && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[26rem] z-40">
          <Card className="shadow-xl border-growth-green/30">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Scale className="h-4 w-4 text-growth-green" />
                {compareIds.length
                  ? `${compareIds.length} selected to compare`
                  : "Compare workspace open"}
              </div>
              <div className="flex gap-2">
                {compareIds.length > 0 && (
                  <Button size="sm" variant="outline" onClick={clearCompare}>
                    Clear
                  </Button>
                )}
                {workspaceOpen ? (
                  <Button size="sm" variant="outline" onClick={closeWorkspace}>
                    Hide
                  </Button>
                ) : (
                  <Button size="sm" onClick={openWorkspace}>
                    Compare
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <InquiryDialog
        open={Boolean(enquireFranchise)}
        onOpenChange={(open) => {
          if (!open) {
            setEnquireFranchise(null);
            setEnquiringId(null);
          }
        }}
        listingId={enquireFranchise?.id || ""}
        listingType="franchise"
        listingName={enquireFranchise?.brandName || enquireFranchise?.brand_name || "Franchise"}
        ownerId=""
        storeFormats={enquireFranchise ? getStoreFormatsFromFranchise(enquireFranchise) : []}
        qualificationDefaults={
          enquireFranchise
            ? {
                investmentCapacity: budgetToCapacity(seekerIntent.budgetMax),
                preferredLocation: seekerIntent.cities[0] || "",
                openingTimeline: "3_6_months",
                relevantExperience: timeToExperience(seekerIntent.timeCommitment),
              }
            : undefined
        }
      />
    </div>
  );
}
