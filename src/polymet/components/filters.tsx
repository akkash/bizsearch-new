import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FilterIcon,
  XIcon,
  MapPinIcon,
  IndianRupeeIcon,
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SMERGERS_BUSINESS_CATEGORIES, FRANCHISE_CATEGORIES } from "@/data/categories";

export interface FilterState {
  searchType: "business" | "franchise";
  industry: string[];
  subcategory: string[];
  location: string[];
  priceRange: [number, number];
  revenueRange: [number, number];
  businessAge: string;
  employees: string;
  businessType: string[];
  financing: boolean;
  verification: string[];
  // Franchise specific
  franchiseFee: [number, number];
  royaltyPercentage: [number, number];
  trainingDuration: string;
  outlets: string;
  multiUnit: boolean;
}

interface FiltersProps {
  type: "business" | "franchise";
  onFiltersChange?: (filters: FilterState) => void;
  onApplyFilters?: (filters: FilterState) => void;
  className?: string;
}

// Dynamic categories based on listing type - now imported from data/categories

// Indian states with major cities
const statesWithCities: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  "Delhi NCR": ["New Delhi", "Gurgaon", "Noida", "Faridabad", "Ghaziabad"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Telangana": ["Hyderabad", "Secunderabad", "Warangal", "Nizamabad"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad"],
  "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
};

const allStates = Object.keys(statesWithCities);
const allCities = Object.values(statesWithCities).flat();

const businessTypes = [
  "Sole Proprietorship",
  "Partnership",
  "Private Limited",
  "Public Limited",
  "LLP",
  "One Person Company",
];

const verificationTypes = [
  "Identity Verified",
  "Document Verified",
  "Financial Verified",
  "Legal Verified",
  "Broker Verified",
];

export function Filters({
  type,
  onFiltersChange,
  onApplyFilters,
  className,
}: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchType: type,
    industry: [],
    subcategory: [],
    location: [],
    priceRange: [0, 10000000],
    revenueRange: [0, 50000000],
    businessAge: "",
    employees: "",
    businessType: [],
    financing: false,
    verification: [],
    franchiseFee: [0, 5000000],
    royaltyPercentage: [0, 20],
    trainingDuration: "",
    outlets: "",
    multiUnit: false,
  });

  // Get categories based on listing type
  const categories = useMemo(() => {
    return type === "business" ? SMERGERS_BUSINESS_CATEGORIES : FRANCHISE_CATEGORIES;
  }, [type]);

  // Get available subcategories based on selected industries
  const availableSubcategories = useMemo(() => {
    if (filters.industry.length === 0) return [];
    return categories
      .filter(cat => filters.industry.includes(cat.name))
      .flatMap(cat => cat.subcategories);
  }, [categories, filters.industry]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setHasUnappliedChanges(true);
    onFiltersChange?.(updatedFilters);
  };

  const applyFilters = () => {
    setHasUnappliedChanges(false);
    onApplyFilters?.(filters);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilters({ [key]: newArray });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      searchType: type,
      industry: [],
      subcategory: [],
      location: [],
      priceRange: [0, 10000000],
      revenueRange: [0, 50000000],
      businessAge: "",
      employees: "",
      businessType: [],
      financing: false,
      verification: [],
      franchiseFee: [0, 5000000],
      royaltyPercentage: [0, 20],
      trainingDuration: "",
      outlets: "",
      multiUnit: false,
    };
    setFilters(clearedFilters);
    setHasUnappliedChanges(true);
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.industry.length > 0) count++;
    if (filters.subcategory.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
    if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 50000000)
      count++;
    if (filters.businessAge) count++;
    if (filters.employees) count++;
    if (filters.businessType.length > 0) count++;
    if (filters.financing) count++;
    if (filters.verification.length > 0) count++;
    if (type === "franchise") {
      if (filters.franchiseFee[0] > 0 || filters.franchiseFee[1] < 5000000)
        count++;
      if (filters.royaltyPercentage[0] > 0 || filters.royaltyPercentage[1] < 20)
        count++;
      if (filters.trainingDuration) count++;
      if (filters.outlets) count++;
      if (filters.multiUnit) count++;
    }
    return count;
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Less" : "More"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Industry/Category Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            {type === "business" ? "Industry" : "Category"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {categories
              .map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    filters.industry.includes(category.name) ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => {
                    toggleArrayFilter("industry", category.name);
                    // Clear subcategories if unchecking category
                    if (filters.industry.includes(category.name)) {
                      const remainingSubcats = filters.subcategory.filter(
                        sub => !category.subcategories.some(s => s.name === sub)
                      );
                      updateFilters({ subcategory: remainingSubcats });
                    }
                  }}
                >
                  {category.name}
                  {filters.industry.includes(category.name) && (
                    <XIcon className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
          </div>
        </div>

        {/* Subcategory Filter - Show when categories selected */}
        {availableSubcategories.length > 0 && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ChevronRightIcon className="h-4 w-4" />
              Subcategory
            </Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableSubcategories
                .slice(0, isExpanded ? availableSubcategories.length : 8)
                .map((subcategory) => (
                  <Badge
                    key={subcategory.id}
                    variant={
                      filters.subcategory.includes(subcategory.name) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/90 text-xs"
                    onClick={() => toggleArrayFilter("subcategory", subcategory.name)}
                  >
                    {subcategory.name}
                    {filters.subcategory.includes(subcategory.name) && (
                      <XIcon className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              {!isExpanded && availableSubcategories.length > 8 && (
                <Badge variant="secondary" className="text-xs text-muted-foreground">
                  +{availableSubcategories.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* State Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            State
          </Label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {allStates.map((state) => (
              <Badge
                key={state}
                variant={
                  filters.location.includes(state) ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => toggleArrayFilter("location", state)}
              >
                {state}
                {filters.location.includes(state) && (
                  <XIcon className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* City Filter - Shows cities based on selected states or all cities */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            City
          </Label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {(filters.location.some(loc => allStates.includes(loc))
              ? filters.location
                .filter(loc => allStates.includes(loc))
                .flatMap(state => statesWithCities[state] || [])
              : allCities.slice(0, 15)
            ).map((city) => (
              <Badge
                key={city}
                variant={
                  filters.location.includes(city) ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary/90 text-xs"
                onClick={() => toggleArrayFilter("location", city)}
              >
                {city}
                {filters.location.includes(city) && (
                  <XIcon className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <IndianRupeeIcon className="h-4 w-4" />

            {type === "business" ? "Business Price" : "Investment Required"}
          </Label>
          <div className="px-2">
            <Slider
              value={
                type === "business" ? filters.priceRange : filters.franchiseFee
              }
              onValueChange={(value) =>
                updateFilters(
                  type === "business"
                    ? { priceRange: value as [number, number] }
                    : { franchiseFee: value as [number, number] }
                )
              }
              max={type === "business" ? 10000000 : 5000000}
              step={100000}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>
                {formatCurrency(
                  type === "business"
                    ? filters.priceRange[0]
                    : filters.franchiseFee[0]
                )}
              </span>
              <span>
                {formatCurrency(
                  type === "business"
                    ? filters.priceRange[1]
                    : filters.franchiseFee[1]
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Range (Business only) */}
        {type === "business" && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Annual Revenue
            </Label>
            <div className="px-2">
              <Slider
                value={filters.revenueRange}
                onValueChange={(value) =>
                  updateFilters({ revenueRange: value as [number, number] })
                }
                max={50000000}
                step={500000}
                className="w-full"
              />

              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{formatCurrency(filters.revenueRange[0])}</span>
                <span>{formatCurrency(filters.revenueRange[1])}</span>
              </div>
            </div>
          </div>
        )}

        {/* Franchise specific filters */}
        {type === "franchise" && (
          <>
            <div className="space-y-3">
              <Label>Royalty Percentage</Label>
              <div className="px-2">
                <Slider
                  value={filters.royaltyPercentage}
                  onValueChange={(value) =>
                    updateFilters({
                      royaltyPercentage: value as [number, number],
                    })
                  }
                  max={20}
                  step={0.5}
                  className="w-full"
                />

                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{filters.royaltyPercentage[0]}%</span>
                  <span>{filters.royaltyPercentage[1]}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Number of Outlets</Label>
              <Select
                value={filters.outlets}
                onValueChange={(value) => updateFilters({ outlets: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outlet range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1-10">1-10 outlets</SelectItem>
                  <SelectItem value="11-50">11-50 outlets</SelectItem>
                  <SelectItem value="51-100">51-100 outlets</SelectItem>
                  <SelectItem value="100+">100+ outlets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {isExpanded && (
          <>
            <Separator />

            {/* Business Age */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Business Age
              </Label>
              <Select
                value={filters.businessAge}
                onValueChange={(value) => updateFilters({ businessAge: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employees */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Number of Employees
              </Label>
              <Select
                value={filters.employees}
                onValueChange={(value) => updateFilters({ employees: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="200+">200+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Business Type */}
            <div className="space-y-3">
              <Label>Business Type</Label>
              <div className="flex flex-wrap gap-2">
                {businessTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={
                      filters.businessType.includes(type)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => toggleArrayFilter("businessType", type)}
                  >
                    {type}
                    {filters.businessType.includes(type) && (
                      <XIcon className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-3">
              <Label>Verification Status</Label>
              <div className="flex flex-wrap gap-2">
                {verificationTypes.map((verification) => (
                  <Badge
                    key={verification}
                    variant={
                      filters.verification.includes(verification)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() =>
                      toggleArrayFilter("verification", verification)
                    }
                  >
                    {verification}
                    {filters.verification.includes(verification) && (
                      <XIcon className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financing"
                  checked={filters.financing}
                  onCheckedChange={(checked) =>
                    updateFilters({ financing: !!checked })
                  }
                />

                <Label htmlFor="financing">Financing Available</Label>
              </div>

              {type === "franchise" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiUnit"
                    checked={filters.multiUnit}
                    onCheckedChange={(checked) =>
                      updateFilters({ multiUnit: !!checked })
                    }
                  />

                  <Label htmlFor="multiUnit">Multi-Unit Development</Label>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
