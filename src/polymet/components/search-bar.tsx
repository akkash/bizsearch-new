import { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  Mic,
  MicOff,
  TrendingUp,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface SearchBarProps {
  onSearch?: (
    query: string,
    type: "business" | "franchise",
    filters: SearchFilters
  ) => void;
  onSearchTypeChange?: (type: "business" | "franchise") => void;
  className?: string;
}

interface SearchFilters {
  industry: string;
  location: string;
  priceRange: [number, number];
  businessType?: string;
  employees?: string;
  established?: string;
}

const industries = [
  "All Industries",
  "Food & Beverage",
  "Technology",
  "Health & Fitness",
  "Retail",
  "Education",
  "Agriculture",
  "Manufacturing",
  "Services",
];

const locations = [
  "All Locations",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Ahmedabad",
];

const businessTypes = [
  "All Types",
  "Private Limited",
  "Partnership",
  "Sole Proprietorship",
  "LLP",
  "Franchise",
];

const popularSearches = {
  business: [
    { text: "Restaurant Mumbai", query: "restaurant in Mumbai" },
    { text: "Café under ₹25L", query: "café under ₹25L" },
    { text: "Tech Business", query: "tech business Bangalore" },
    { text: "Manufacturing", query: "manufacturing business" },
    { text: "Retail Store", query: "retail store" },
  ],
  franchise: [
    { text: "Food Franchise", query: "food franchise under ₹20L" },
    { text: "Education", query: "education franchise" },
    { text: "Fitness", query: "fitness franchise" },
    { text: "Retail Franchise", query: "retail franchise under ₹15L" },
    { text: "Convenience Store", query: "convenience store franchise" },
  ],
};

const quickFilters = {
  business: [
    { label: "Under ₹10L", priceRange: [0, 1000000] },
    { label: "₹10L - ₹50L", priceRange: [1000000, 5000000] },
    { label: "₹50L - ₹1Cr", priceRange: [5000000, 10000000] },
  ],
  franchise: [
    { label: "Under ₹5L", priceRange: [0, 500000] },
    { label: "₹5L - ₹20L", priceRange: [500000, 2000000] },
    { label: "₹20L+", priceRange: [2000000, 10000000] },
  ],
};

export function SearchBar({
  onSearch,
  onSearchTypeChange,
  className,
}: SearchBarProps) {
  const [searchType, setSearchType] = useState<"business" | "franchise">(
    "franchise"
  );
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    industry: "All Industries",
    location: "All Locations",
    priceRange: [0, 10000000],
    businessType: "All Types",
    employees: "Any",
    established: "Any",
  });
  const [isListening, setIsListening] = useState(false);

  const handleSearch = () => {
    onSearch?.(query, searchType, filters);
  };

  const handleVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert("Voice recognition error. Please try again.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Voice recognition not supported in this browser.");
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatPrice = (value: number) => {
    if (value >= 10000000) return "₹1Cr+";
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Search Type Toggle - Mobile-First Design */}
      <div className="flex items-center justify-center">
        <div className="flex bg-muted rounded-xl p-1.5 w-full max-w-lg shadow-sm">
          <Button
            variant={searchType === "franchise" ? "default" : "ghost"}
            size="lg"
            onClick={() => {
              setSearchType("franchise");
              onSearchTypeChange?.("franchise");
            }}
            className="flex items-center gap-3 relative flex-1 h-12 text-sm font-medium"
          >
            <div
              className={`p-2 rounded-full ${searchType === "franchise"
                ? "bg-white/20"
                : "bg-muted-foreground/10"
                }`}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Franchise Opportunities</span>
            <span className="sm:hidden">Franchise</span>
          </Button>
          <Button
            variant={searchType === "business" ? "default" : "ghost"}
            size="lg"
            onClick={() => {
              setSearchType("business");
              onSearchTypeChange?.("business");
            }}
            className="flex items-center gap-3 relative flex-1 h-12 text-sm font-medium"
          >
            <div
              className={`p-2 rounded-full ${searchType === "business"
                ? "bg-white/20"
                : "bg-muted-foreground/10"
                }`}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Businesses for Sale</span>
            <span className="sm:hidden">Business</span>
          </Button>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />

          <Input
            placeholder={
              searchType === "business"
                ? "Search for restaurants, retail stores, tech startups..."
                : "Search for food, education, fitness franchises..."
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => query.length === 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-12 pr-12 h-14 text-base shadow-lg border-2 focus:border-primary transition-all duration-200 rounded-xl font-medium"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
                setShowSuggestions(false);
              }
            }}
          />

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border-2 border-muted z-[100] max-h-96 overflow-y-auto">
              {query.length === 0 ? (
                <>
                  {/* Popular Searches */}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Popular Searches
                    </div>
                    <div className="space-y-1">
                      {popularSearches[searchType].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuery(item.query);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-3 group"
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium group-hover:text-primary">
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  {/* Quick Filters */}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                      <IndianRupee className="h-3.5 w-3.5" />
                      Quick Price Filters
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickFilters[searchType].map((filter, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleFilterChange("priceRange", filter.priceRange);
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-2 bg-muted hover:bg-primary hover:text-white rounded-full text-sm font-medium transition-colors"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Filtered suggestions based on query */}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      💡 Suggestions
                    </div>
                    <div className="space-y-1">
                      {popularSearches[searchType]
                        .filter((item) =>
                          item.query.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(item.query);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-3 group"
                          >
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium group-hover:text-primary">
                              {item.query}
                            </span>
                          </button>
                        ))}
                      {popularSearches[searchType].filter((item) =>
                        item.query.toLowerCase().includes(query.toLowerCase())
                      ).length === 0 && (
                          <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                            Press Enter to search for "{query}"
                          </div>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 rounded-full ${isListening
              ? "text-red-500 animate-pulse bg-red-50"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2 h-12 shadow-sm border-2 hover:border-primary transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(filters.industry !== "All Industries" ||
                  filters.location !== "All Locations" ||
                  filters.priceRange[0] > 0 ||
                  filters.priceRange[1] < 10000000) && (
                    <Badge variant="secondary" className="ml-1">
                      {[
                        filters.industry !== "All Industries" ? 1 : 0,
                        filters.location !== "All Locations" ? 1 : 0,
                        filters.priceRange[0] > 0 ||
                          filters.priceRange[1] < 10000000
                          ? 1
                          : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Industry
                  </label>
                  <Select
                    value={filters.industry}
                    onValueChange={(value) =>
                      handleFilterChange("industry", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) =>
                      handleFilterChange("location", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {searchType === "business"
                      ? "Price Range"
                      : "Investment Range"}
                  </label>
                  <div className="px-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        handleFilterChange("priceRange", value)
                      }
                      max={10000000}
                      min={0}
                      step={100000}
                      className="w-full"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatPrice(filters.priceRange[0])}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {searchType === "business" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Business Type
                    </label>
                    <Select
                      value={filters.businessType}
                      onValueChange={(value) =>
                        handleFilterChange("businessType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        industry: "All Industries",
                        location: "All Locations",
                        priceRange: [0, 10000000],
                        businessType: "All Types",
                        employees: "Any",
                        established: "Any",
                      });
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowFilters(false);
                      handleSearch();
                    }}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => {
              handleSearch();
              setShowSuggestions(false);
            }}
            size="lg"
            className="px-10 h-14 shadow-lg bg-gradient-to-r from-growth-green to-emerald-600 hover:from-emerald-600 hover:to-growth-green transition-all duration-200 font-bold text-base rounded-xl"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Quick Industry Filters */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3 font-semibold">
          Browse by Industry:
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {industries.slice(1, 7).map((industry) => (
            <button
              key={industry}
              onClick={() => {
                handleFilterChange("industry", industry);
                handleSearch();
              }}
              className="text-sm px-4 py-2 bg-muted dark:bg-muted/50 text-foreground hover:bg-primary hover:text-white rounded-full transition-all duration-200 font-medium border-2 border-border dark:border-border/50 hover:border-primary shadow-sm"
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {(filters.industry !== "All Industries" ||
        filters.location !== "All Locations" ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < 10000000) && (
          <div className="flex flex-wrap justify-center gap-2">
            {filters.industry !== "All Industries" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.industry}
                <button
                  onClick={() => handleFilterChange("industry", "All Industries")}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.location !== "All Locations" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />

                {filters.location}
                <button
                  onClick={() => handleFilterChange("location", "All Locations")}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatPrice(filters.priceRange[0])} -{" "}
                {formatPrice(filters.priceRange[1])}
                <button
                  onClick={() => handleFilterChange("priceRange", [0, 10000000])}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
    </div>
  );
}
