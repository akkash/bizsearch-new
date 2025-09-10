import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  Mic,
  MicOff,
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

export function SearchBar({
  onSearch,
  onSearchTypeChange,
  className,
}: SearchBarProps) {
  const [searchType, setSearchType] = useState<"business" | "franchise">(
    "business"
  );
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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
            variant={searchType === "business" ? "default" : "ghost"}
            size="lg"
            onClick={() => {
              setSearchType("business");
              onSearchTypeChange?.("business");
            }}
            className="flex items-center gap-3 relative flex-1 h-12 text-sm font-medium"
          >
            <div
              className={`p-2 rounded-full ${
                searchType === "business"
                  ? "bg-white/20"
                  : "bg-muted-foreground/10"
              }`}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Businesses for Sale</span>
            <span className="sm:hidden">Business</span>
          </Button>
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
              className={`p-2 rounded-full ${
                searchType === "franchise"
                  ? "bg-white/20"
                  : "bg-muted-foreground/10"
              }`}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">Franchise Opportunities</span>
            <span className="sm:hidden">Franchise</span>
          </Button>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />

          <Input
            placeholder={
              searchType === "business"
                ? "Search businesses (e.g., restaurant in Mumbai under ₹50L)"
                : "Search franchises (e.g., food franchise under ₹20L)"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-12 h-12 text-base shadow-sm border-2 focus:border-primary transition-all duration-200"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 rounded-full ${
              isListening
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
            onClick={handleSearch}
            size="lg"
            className="px-8 h-12 shadow-sm bg-primary hover:bg-primary/90 transition-all duration-200 font-semibold"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Example Queries - Mobile Optimized */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4 font-medium">
          💡 Try searching:
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {searchType === "business" ? (
            <>
              <button
                onClick={() => setQuery("restaurant in Mumbai under ₹50L")}
                className="text-sm px-5 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              >
                "Café in Chennai under ₹25L"
              </button>
              <button
                onClick={() => setQuery("tech business Bangalore")}
                className="text-sm px-5 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              >
                "tech business Bangalore"
              </button>
              <button
                onClick={() => setQuery("manufacturing business under ₹1Cr")}
                className="text-sm px-5 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              >
                "manufacturing under ₹1Cr"
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setQuery("food franchise under ₹20L")}
                className="text-sm px-5 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              >
                "food franchise under ₹20L"
              </button>
              <button
                onClick={() => setQuery("education franchise Delhi")}
                className="text-sm px-5 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              >
                "education franchise Delhi"
              </button>
              <button
                onClick={() => setQuery("retail franchise under ₹15L")}
                className="text-sm px-5 py-2.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-200 font-medium border border-transparent hover:border-primary/20"
              >
                "retail franchise under ₹15L"
              </button>
            </>
          )}
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
