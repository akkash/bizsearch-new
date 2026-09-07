import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Plus,
  Scale,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Building,
  Star,
  Shield,
} from "lucide-react";
import { Business, Franchise } from "@/types/listings";

interface ComparisonItem {
  id: string;
  type: "business" | "franchise";
  data: Business | Franchise;
}

interface ComparisonFeatureProps {
  items: ComparisonItem[];
  onRemoveItem: (id: string) => void;
  onAddMore: () => void;
  className?: string;
}

export function ComparisonFeature({
  items,
  onRemoveItem,
  onAddMore,
  className,
}: ComparisonFeatureProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "financials" | "details"
  >("overview");

  if (items.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Scale className="h-12 w-12 text-muted-foreground mb-4" />

          <h3 className="text-lg font-semibold mb-2">Start Comparing</h3>
          <p className="text-muted-foreground text-center mb-4">
            Add up to 3 franchises to compare investment, fees, and requirements side-by-side
          </p>
          <Button onClick={onAddMore}>
            <Plus className="h-4 w-4 mr-2" />
            Add Items to Compare
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  const getBusinessName = (item: ComparisonItem) => {
    if (item.type === "business") {
      return (item.data as Business).name;
    }
    const franchise = item.data as Franchise;
    return franchise.brandName || franchise.brand_name || "Franchise";
  };

  const getPrice = (item: ComparisonItem): number | null => {
    if (item.type === "business") {
      return (item.data as Business).price ?? null;
    }
    const franchise = item.data as Franchise;
    return franchise.investmentMin ?? franchise.total_investment_min ?? franchise.franchiseFee ?? franchise.franchise_fee ?? null;
  };

  const getFranchiseFee = (item: ComparisonItem): number | null => {
    if (item.type !== "franchise") return null;
    const franchise = item.data as Franchise;
    return franchise.franchiseFee ?? franchise.franchise_fee ?? null;
  };

  const getRoyalty = (item: ComparisonItem): number | null => {
    if (item.type !== "franchise") return null;
    const franchise = item.data as Franchise;
    return franchise.royaltyPercentage ?? franchise.royalty_percentage ?? null;
  };

  const getRevenue = (item: ComparisonItem): number | null => {
    if (item.type === "business") {
      return (item.data as Business).revenue ?? null;
    }
    const franchise = item.data as Franchise;
    return franchise.average_unit_revenue ?? null;
  };

  const getLocation = (item: ComparisonItem) => {
    if (item.type === "business") {
      return (item.data as Business).location || "N/A";
    }
    const franchise = item.data as Franchise;
    const city = (franchise as Record<string, unknown>).headquarters_city as string | undefined;
    const state = (franchise as Record<string, unknown>).headquarters_state as string | undefined;
    if (city && state) return `${city}, ${state}`;
    if (city || state) return city || state;
    const territories = franchise.territories || franchise.expansion_territories;
    if (Array.isArray(territories) && territories.length > 0) {
      return String(territories[0]);
    }
    return "Contact for territories";
  };

  const getIndustry = (item: ComparisonItem) => {
    return item.type === "business"
      ? (item.data as Business).industry
      : (item.data as Franchise).industry;
  };

  const getEstablished = (item: ComparisonItem) => {
    if (item.type === "business") {
      return (item.data as Business).establishedYear ?? (item.data as Business).established_year ?? "N/A";
    }
    const franchise = item.data as Franchise;
    return franchise.establishedYear ?? franchise.established_year ?? "N/A";
  };

  const getEmployees = (item: ComparisonItem) => {
    if (item.type === "business") {
      return (item.data as Business).employees ?? "N/A";
    }
    const franchise = item.data as Franchise;
    return franchise.outlets ?? franchise.total_outlets ?? "N/A";
  };

  const getBadges = (item: ComparisonItem) => {
    const badges = item.type === "business"
      ? (item.data as Business).badges
      : (item.data as Franchise).badges;
    return Array.isArray(badges) ? badges : [];
  };

  const formatOptionalCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "Not provided";
    return formatCurrency(value);
  };

  const formatOptionalText = (value: unknown) => {
    if (value === null || value === undefined || value === '') return "Not provided";
    return String(value);
  };

  const getMarketingFee = (item: ComparisonItem): number | null => {
    if (item.type !== "franchise") return null;
    const franchise = item.data as Franchise;
    return franchise.marketingFeePercentage ?? franchise.marketing_fee_percentage ?? null;
  };

  const getSpaceRequirement = (item: ComparisonItem) => {
    if (item.type !== "franchise") return "Not provided";
    const franchise = item.data as Franchise;
    const sqft = franchise.spaceRequiredSqft ?? franchise.space_required_sqft;
    return sqft ? `${sqft} sq ft` : "Not provided";
  };

  const getLiquidCapital = (item: ComparisonItem): number | null => {
    if (item.type !== "franchise") return null;
    const franchise = item.data as Franchise;
    return franchise.minimumLiquidCapital ?? franchise.minimum_liquid_capital ?? null;
  };

  const getTraining = (item: ComparisonItem) => {
    if (item.type !== "franchise") return "Not provided";
    const franchise = item.data as Franchise;
    if (franchise.trainingProvided || franchise.training_provided) {
      const days = franchise.trainingDurationDays ?? franchise.training_duration_days;
      return days ? `${days} days training` : "Provided";
    }
    return "Not provided";
  };

  const getSupport = (item: ComparisonItem) => {
    if (item.type !== "franchise") return "Not provided";
    const franchise = item.data as Franchise;
    const support = franchise.supportProvided ?? franchise.support_provided;
    if (Array.isArray(support) && support.length > 0) return support.slice(0, 2).join(', ');
    if (franchise.marketingSupport || franchise.marketing_support) return "Marketing support";
    return "Not provided";
  };

  const getFinancing = (item: ComparisonItem) => {
    if (item.type !== "franchise") return "Not provided";
    const franchise = item.data as Franchise;
    const badges = franchise.badges || [];
    if (badges.includes("Financing Available")) return "Available";
    return "Not provided";
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Compare Opportunities ({items.length})
          <Button
            variant="outline"
            size="sm"
            onClick={onAddMore}
            className="ml-auto"
            disabled={items.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b">
          {["overview", "financials", "details"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-full">
            {items.map((item, index) => (
              <Card key={item.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <CardContent className="pt-6 space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <Badge
                      variant={
                        item.type === "business" ? "default" : "secondary"
                      }
                    >
                      {item.type === "business" ? "Business" : "Franchise"}
                    </Badge>
                    <h4 className="font-semibold text-lg leading-tight">
                      {getBusinessName(item)}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />

                      {getLocation(item)}
                    </div>
                  </div>

                  {activeTab === "overview" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Industry</div>
                          <div className="font-medium">{getIndustry(item)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">
                            Established
                          </div>
                          <div className="font-medium">
                            {getEstablished(item)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {getBadges(item)
                          .slice(0, 3)
                          .map((badge) => (
                            <Badge
                              key={badge}
                              variant="outline"
                              className="text-xs"
                            >
                              {badge === "Verified" && (
                                <Shield className="h-3 w-3 mr-1" />
                              )}
                              {badge}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "financials" && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-muted-foreground text-sm">
                          {item.type === "business"
                            ? "Asking Price"
                            : "Investment Required"}
                        </div>
                        <div className="font-semibold text-lg text-primary">
                          {formatOptionalCurrency(getPrice(item))}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-sm">
                          {item.type === "business"
                            ? "Annual Revenue"
                            : "Avg. Unit Revenue"}
                        </div>
                        <div className="font-semibold text-lg text-green-600">
                          {formatOptionalCurrency(getRevenue(item))}
                        </div>
                      </div>

                      {item.type === "franchise" && (
                        <>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Franchise Fee
                            </div>
                            <div className="font-medium">
                              {formatOptionalCurrency(getFranchiseFee(item))}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Royalty
                            </div>
                            <div className="font-medium">
                              {getRoyalty(item) != null ? `${getRoyalty(item)}%` : "Not provided"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Marketing Fee
                            </div>
                            <div className="font-medium">
                              {getMarketingFee(item) != null ? `${getMarketingFee(item)}%` : "Not provided"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "details" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">
                            {item.type === "business" ? "Employees" : "Outlets"}
                          </div>
                          <div className="font-medium">
                            {getEmployees(item)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium">
                            {item.type === "business"
                              ? (item.data as Business).businessType || (item.data as Business).business_type || "N/A"
                              : (item.data as Franchise).experience_required || (item.data as Record<string, unknown>).experienceRequired || "N/A"}
                          </div>
                        </div>
                      </div>

                      {item.type === "franchise" && (
                        <>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Space Requirement
                            </div>
                            <div className="font-medium">{getSpaceRequirement(item)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Liquid Capital
                            </div>
                            <div className="font-medium">
                              {formatOptionalCurrency(getLiquidCapital(item))}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Experience
                            </div>
                            <div className="font-medium">
                              {formatOptionalText(
                                (item.data as Franchise).experienceRequired ??
                                  (item.data as Franchise).experience_required
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Training
                            </div>
                            <div className="font-medium">{getTraining(item)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Support
                            </div>
                            <div className="font-medium">{getSupport(item)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Financing
                            </div>
                            <div className="font-medium">{getFinancing(item)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t">
                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add More Slot */}
            {items.length < 3 && (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plus className="h-8 w-8 text-muted-foreground mb-2" />

                  <Button variant="ghost" onClick={onAddMore}>
                    Add Another
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comparison Summary */}
        {items.length >= 2 && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Comparison
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Lowest Investment</div>
                <div className="font-semibold">
                  {formatCurrency(Math.min(...items.map(getPrice)))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Highest Revenue</div>
                <div className="font-semibold">
                  {formatCurrency(Math.max(...items.map(getRevenue)))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Most Established</div>
                <div className="font-semibold">
                  {Math.min(...items.map(getEstablished))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
