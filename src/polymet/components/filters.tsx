import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SMERGERS_BUSINESS_CATEGORIES, FRANCHISE_CATEGORIES } from "@/data/categories";

export interface FilterState {
  searchType: "business" | "franchise";
  industry: string[];
  subcategory: string[];
  state: string[];
  city: string[];
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
  initialCategory?: string; // Category name from URL
  initialSubcategory?: string; // Subcategory name from URL
  onFiltersChange?: (filters: FilterState) => void;
  onApplyFilters?: (filters: FilterState) => void;
  className?: string;
}

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
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
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
  initialCategory,
  initialSubcategory,
  onFiltersChange,
  onApplyFilters: _onApplyFilters, // Kept in interface for future use
  className,
}: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Initialize with URL category if provided
    const initialIndustry = initialCategory ? [initialCategory] : [];
    const initialSub = initialSubcategory ? [initialSubcategory] : [];

    return {
      searchType: type,
      industry: initialIndustry,
      subcategory: initialSub,
      state: [],
      city: [],
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
  });

  // Search states for filters
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Accordion open states - Category and State open by default
  const [openAccordions, setOpenAccordions] = useState<string[]>(["category", "state"]);

  // Get categories based on listing type
  const categories = useMemo(() => {
    return type === "business" ? SMERGERS_BUSINESS_CATEGORIES : FRANCHISE_CATEGORIES;
  }, [type]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Get available subcategories based on selected industries
  const availableSubcategories = useMemo(() => {
    if (filters.industry.length === 0) return [];
    return categories
      .filter(cat => filters.industry.includes(cat.name))
      .flatMap(cat => cat.subcategories);
  }, [categories, filters.industry]);

  // Filter states by search
  const filteredStates = useMemo(() => {
    if (!stateSearch) return allStates;
    return allStates.filter(state =>
      state.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

  // Get available cities based on selected states (Dependent Logic)
  const availableCities = useMemo(() => {
    if (filters.state.length === 0) return [];
    return filters.state.flatMap(state => statesWithCities[state] || []);
  }, [filters.state]);

  // Filter cities by search
  const filteredCities = useMemo(() => {
    if (!citySearch) return availableCities;
    return availableCities.filter(city =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [availableCities, citySearch]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
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
      state: [],
      city: [],
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
    setStateSearch("");
    setCitySearch("");
    setCategorySearch("");
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.industry.length > 0) count++;
    if (filters.subcategory.length > 0) count++;
    if (filters.state.length > 0) count++;
    if (filters.city.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
    if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 50000000) count++;
    if (filters.businessAge) count++;
    if (filters.employees) count++;
    if (filters.businessType.length > 0) count++;
    if (filters.financing) count++;
    if (filters.verification.length > 0) count++;
    if (type === "franchise") {
      if (filters.franchiseFee[0] > 0 || filters.franchiseFee[1] < 5000000) count++;
      if (filters.royaltyPercentage[0] > 0 || filters.royaltyPercentage[1] < 20) count++;
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
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Accordion
          type="multiple"
          value={openAccordions}
          onValueChange={setOpenAccordions}
          className="space-y-2"
        >
          {/* Category/Industry Filter */}
          <AccordionItem value="category" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4" />
                <span className="font-medium">
                  {type === "business" ? "Industry" : "Category"}
                </span>
                {filters.industry.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.industry.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${type === "business" ? "industries" : "categories"}...`}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={filters.industry.includes(category.name) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 px-3 py-1.5 text-sm"
                    onClick={() => {
                      const isSelected = filters.industry.includes(category.name);
                      const newIndustry = isSelected
                        ? filters.industry.filter(i => i !== category.name)
                        : [...filters.industry, category.name];

                      let newSubcategory = filters.subcategory;
                      if (isSelected) {
                        // We are removing a category, so remove its subcategories
                        newSubcategory = filters.subcategory.filter(
                          sub => !category.subcategories.some(s => s.name === sub)
                        );
                      }

                      updateFilters({ industry: newIndustry, subcategory: newSubcategory });
                    }}
                  >
                    {category.name}
                    {filters.industry.includes(category.name) && (
                      <XIcon className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Subcategory Filter - Only show when categories selected */}
          {availableSubcategories.length > 0 && (
            <AccordionItem value="subcategory" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4 w-4" />
                  <span className="font-medium">Subcategory</span>
                  {filters.subcategory.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filters.subcategory.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {availableSubcategories.map((subcategory) => (
                    <Badge
                      key={subcategory.id}
                      variant={filters.subcategory.includes(subcategory.name) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90 px-3 py-1.5 text-xs"
                      onClick={() => toggleArrayFilter("subcategory", subcategory.name)}
                    >
                      {subcategory.name}
                      {filters.subcategory.includes(subcategory.name) && (
                        <XIcon className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* State Filter */}
          <AccordionItem value="state" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                <span className="font-medium">State</span>
                {filters.state.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.state.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search states..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {filteredStates.map((state) => (
                  <Badge
                    key={state}
                    variant={filters.state.includes(state) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 px-3 py-1.5 text-sm"
                    onClick={() => {
                      const isSelected = filters.state.includes(state);
                      const newState = isSelected
                        ? filters.state.filter(s => s !== state)
                        : [...filters.state, state];

                      let newCity = filters.city;

                      // Clear cities from this state when unselecting
                      if (isSelected) {
                        const stateCities = statesWithCities[state] || [];
                        newCity = filters.city.filter(
                          city => !stateCities.includes(city)
                        );
                      }

                      updateFilters({ state: newState, city: newCity });
                    }}

                  >
                    {state}
                    {filters.state.includes(state) && (
                      <XIcon className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* City Filter - Only shows when states are selected (Dependent Logic) */}
          {filters.state.length > 0 && (
            <AccordionItem value="city" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  <span className="font-medium">City</span>
                  {filters.city.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filters.city.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <Badge
                      key={city}
                      variant={filters.city.includes(city) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90 px-3 py-1.5 text-sm"
                      onClick={() => toggleArrayFilter("city", city)}
                    >
                      {city}
                      {filters.city.includes(city) && (
                        <XIcon className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                {filteredCities.length === 0 && citySearch && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No cities found matching "{citySearch}"
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Price/Investment Range */}
          <AccordionItem value="price" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <IndianRupeeIcon className="h-4 w-4" />
                <span className="font-medium">
                  {type === "business" ? "Business Price" : "Investment Required"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="px-2">
                <Slider
                  value={type === "business" ? filters.priceRange : filters.franchiseFee}
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
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>
                    {formatCurrency(
                      type === "business" ? filters.priceRange[0] : filters.franchiseFee[0]
                    )}
                  </span>
                  <span>
                    {formatCurrency(
                      type === "business" ? filters.priceRange[1] : filters.franchiseFee[1]
                    )}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Revenue Range (Business only) */}
          {type === "business" && (
            <AccordionItem value="revenue" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  <span className="font-medium">Annual Revenue</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
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
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatCurrency(filters.revenueRange[0])}</span>
                    <span>{formatCurrency(filters.revenueRange[1])}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Franchise specific: Royalty */}
          {type === "franchise" && (
            <AccordionItem value="royalty" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  <span className="font-medium">Royalty Percentage</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="px-2">
                  <Slider
                    value={filters.royaltyPercentage}
                    onValueChange={(value) =>
                      updateFilters({ royaltyPercentage: value as [number, number] })
                    }
                    max={20}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.royaltyPercentage[0]}%</span>
                    <span>{filters.royaltyPercentage[1]}%</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* More Filters (collapsed by default) */}
          <AccordionItem value="more" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span className="font-medium">More Filters</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              {/* Business Age */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
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

              {/* Outlets (Franchise only) */}
              {type === "franchise" && (
                <div className="space-y-2">
                  <Label className="text-sm">Number of Outlets</Label>
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
              )}

              <Separator />

              {/* Business Type */}
              <div className="space-y-2">
                <Label className="text-sm">Business Type</Label>
                <div className="flex flex-wrap gap-2">
                  {businessTypes.map((bType) => (
                    <Badge
                      key={bType}
                      variant={filters.businessType.includes(bType) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90 px-3 py-1.5 text-xs"
                      onClick={() => toggleArrayFilter("businessType", bType)}
                    >
                      {bType}
                      {filters.businessType.includes(bType) && (
                        <XIcon className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-2">
                <Label className="text-sm">Verification Status</Label>
                <div className="flex flex-wrap gap-2">
                  {verificationTypes.map((verification) => (
                    <Badge
                      key={verification}
                      variant={filters.verification.includes(verification) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90 px-3 py-1.5 text-xs"
                      onClick={() => toggleArrayFilter("verification", verification)}
                    >
                      {verification}
                      {filters.verification.includes(verification) && (
                        <XIcon className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="financing"
                    checked={filters.financing}
                    onCheckedChange={(checked) => updateFilters({ financing: !!checked })}
                  />
                  <Label htmlFor="financing" className="text-sm cursor-pointer">
                    Financing Available
                  </Label>
                </div>

                {type === "franchise" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiUnit"
                      checked={filters.multiUnit}
                      onCheckedChange={(checked) => updateFilters({ multiUnit: !!checked })}
                    />
                    <Label htmlFor="multiUnit" className="text-sm cursor-pointer">
                      Multi-Unit Development
                    </Label>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
