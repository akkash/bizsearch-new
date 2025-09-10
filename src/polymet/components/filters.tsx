import React, { useState } from "react";
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
  FilterIcon,
  XIcon,
  MapPinIcon,
  IndianRupeeIcon,
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  searchType: "business" | "franchise";
  industry: string[];
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

const industries = [
  "Technology",
  "Food & Beverage",
  "Retail",
  "Healthcare",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Automotive",
  "Finance",
  "Hospitality",
  "Beauty & Wellness",
  "Agriculture",
];

const locations = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

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
        {/* Industry Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            Industry
          </Label>
          <div className="flex flex-wrap gap-2">
            {industries
              .slice(0, isExpanded ? industries.length : 6)
              .map((industry) => (
                <Badge
                  key={industry}
                  variant={
                    filters.industry.includes(industry) ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => toggleArrayFilter("industry", industry)}
                >
                  {industry}
                  {filters.industry.includes(industry) && (
                    <XIcon className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            Location
          </Label>
          <div className="flex flex-wrap gap-2">
            {locations
              .slice(0, isExpanded ? locations.length : 5)
              .map((location) => (
                <Badge
                  key={location}
                  variant={
                    filters.location.includes(location) ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => toggleArrayFilter("location", location)}
                >
                  {location}
                  {filters.location.includes(location) && (
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
