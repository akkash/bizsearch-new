import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Info,
} from "lucide-react";

interface RoyaltyTier {
  id: string;
  minRevenue: number;
  maxRevenue?: number;
  percentage: number;
  description?: string;
}

interface MarketingFeeStructure {
  type: "fixed" | "percentage" | "tiered";
  value: number;
  tiers?: RoyaltyTier[];
}

interface RoyaltySchedule {
  type: "fixed" | "tiered" | "performance_based";
  baseTiers: RoyaltyTier[];
  marketingFee: MarketingFeeStructure;
  performanceIncentives?: {
    enabled: boolean;
    bonusThreshold: number;
    bonusReduction: number;
  };
  volumeDiscounts?: {
    enabled: boolean;
    multiUnitDiscount: number;
    loyaltyDiscount: number;
  };
}

interface RoyaltySchedulerProps {
  initialSchedule?: RoyaltySchedule;
  onScheduleChange?: (schedule: RoyaltySchedule) => void;
  className?: string;
}

const defaultSchedule: RoyaltySchedule = {
  type: "fixed",
  baseTiers: [
    {
      id: "base",
      minRevenue: 0,
      percentage: 6,
      description: "Standard royalty rate",
    },
  ],

  marketingFee: {
    type: "percentage",
    value: 2,
  },
  performanceIncentives: {
    enabled: false,
    bonusThreshold: 5000000,
    bonusReduction: 1,
  },
  volumeDiscounts: {
    enabled: false,
    multiUnitDiscount: 0.5,
    loyaltyDiscount: 0.25,
  },
};

export function RoyaltyScheduler({
  initialSchedule = defaultSchedule,
  onScheduleChange,
  className,
}: RoyaltySchedulerProps) {
  const [schedule, setSchedule] = useState<RoyaltySchedule>(initialSchedule);
  const [newTier, setNewTier] = useState<Partial<RoyaltyTier>>({});
  const [simulationRevenue, setSimulationRevenue] = useState(2400000);

  useEffect(() => {
    onScheduleChange?.(schedule);
  }, [schedule, onScheduleChange]);

  const addRoyaltyTier = () => {
    if (newTier.minRevenue && newTier.percentage) {
      const tier: RoyaltyTier = {
        id: `tier-${Date.now()}`,
        minRevenue: newTier.minRevenue,
        maxRevenue: newTier.maxRevenue,
        percentage: newTier.percentage,
        description: newTier.description || "",
      };

      setSchedule((prev) => ({
        ...prev,
        baseTiers: [...prev.baseTiers, tier].sort(
          (a, b) => a.minRevenue - b.minRevenue
        ),
      }));

      setNewTier({});
    }
  };

  const removeTier = (tierId: string) => {
    setSchedule((prev) => ({
      ...prev,
      baseTiers: prev.baseTiers.filter((tier) => tier.id !== tierId),
    }));
  };

  const updateTier = (tierId: string, updates: Partial<RoyaltyTier>) => {
    setSchedule((prev) => ({
      ...prev,
      baseTiers: prev.baseTiers.map((tier) =>
        tier.id === tierId ? { ...tier, ...updates } : tier
      ),
    }));
  };

  const calculateRoyalty = (
    revenue: number
  ): { amount: number; rate: number; tier?: RoyaltyTier } => {
    if (schedule.type === "fixed") {
      const rate = schedule.baseTiers[0]?.percentage || 0;
      return {
        amount: revenue * (rate / 100),
        rate,
        tier: schedule.baseTiers[0],
      };
    }

    if (schedule.type === "tiered") {
      let totalRoyalty = 0;
      let effectiveRate = 0;
      let applicableTier: RoyaltyTier | undefined;

      for (const tier of schedule.baseTiers) {
        const tierMin = tier.minRevenue;
        const tierMax = tier.maxRevenue || Infinity;

        if (revenue > tierMin) {
          const tierRevenue = Math.min(revenue, tierMax) - tierMin;
          if (tierRevenue > 0) {
            totalRoyalty += tierRevenue * (tier.percentage / 100);
            applicableTier = tier;
          }
        }
      }

      effectiveRate = revenue > 0 ? (totalRoyalty / revenue) * 100 : 0;

      return {
        amount: totalRoyalty,
        rate: effectiveRate,
        tier: applicableTier,
      };
    }

    return { amount: 0, rate: 0 };
  };

  const calculateMarketingFee = (revenue: number): number => {
    if (schedule.marketingFee.type === "fixed") {
      return schedule.marketingFee.value;
    }
    return revenue * (schedule.marketingFee.value / 100);
  };

  const simulationResult = calculateRoyalty(simulationRevenue);
  const marketingFeeAmount = calculateMarketingFee(simulationRevenue);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Royalty Structure Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Royalty Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Royalty Type</Label>
            <Select
              value={schedule.type}
              onValueChange={(value: RoyaltySchedule["type"]) =>
                setSchedule((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Percentage</SelectItem>
                <SelectItem value="tiered">Tiered Structure</SelectItem>
                <SelectItem value="performance_based">
                  Performance Based
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {schedule.type === "fixed" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fixed-royalty">Royalty Percentage (%)</Label>
                  <Input
                    id="fixed-royalty"
                    type="number"
                    step="0.1"
                    value={schedule.baseTiers[0]?.percentage || 0}
                    onChange={(e) =>
                      updateTier(schedule.baseTiers[0]?.id || "base", {
                        percentage: Number(e.target.value),
                      })
                    }
                    placeholder="6.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixed-description">Description</Label>
                  <Input
                    id="fixed-description"
                    value={schedule.baseTiers[0]?.description || ""}
                    onChange={(e) =>
                      updateTier(schedule.baseTiers[0]?.id || "base", {
                        description: e.target.value,
                      })
                    }
                    placeholder="Standard royalty rate"
                  />
                </div>
              </div>
            </div>
          )}

          {schedule.type === "tiered" && (
            <div className="space-y-4">
              {/* Existing Tiers */}
              <div className="space-y-3">
                <Label>Royalty Tiers</Label>
                {schedule.baseTiers.map((tier, index) => (
                  <div
                    key={tier.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Tier {index + 1}</Badge>
                      {schedule.baseTiers.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTier(tier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Min Revenue (₹)</Label>
                        <Input
                          type="number"
                          value={tier.minRevenue}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              minRevenue: Number(e.target.value),
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Revenue (₹)</Label>
                        <Input
                          type="number"
                          value={tier.maxRevenue || ""}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              maxRevenue: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="No limit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Royalty (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={tier.percentage}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              percentage: Number(e.target.value),
                            })
                          }
                          placeholder="6.0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={tier.description || ""}
                        onChange={(e) =>
                          updateTier(tier.id, { description: e.target.value })
                        }
                        placeholder="Tier description..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Tier */}
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                <Label>Add New Tier</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Min Revenue (₹)</Label>
                    <Input
                      type="number"
                      value={newTier.minRevenue || ""}
                      onChange={(e) =>
                        setNewTier((prev) => ({
                          ...prev,
                          minRevenue: Number(e.target.value),
                        }))
                      }
                      placeholder="5000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Revenue (₹)</Label>
                    <Input
                      type="number"
                      value={newTier.maxRevenue || ""}
                      onChange={(e) =>
                        setNewTier((prev) => ({
                          ...prev,
                          maxRevenue: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Royalty (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newTier.percentage || ""}
                      onChange={(e) =>
                        setNewTier((prev) => ({
                          ...prev,
                          percentage: Number(e.target.value),
                        }))
                      }
                      placeholder="5.0"
                    />
                  </div>
                </div>
                <Button
                  onClick={addRoyaltyTier}
                  disabled={!newTier.minRevenue || !newTier.percentage}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketing Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Marketing Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Marketing Fee Type</Label>
            <Select
              value={schedule.marketingFee.type}
              onValueChange={(value: MarketingFeeStructure["type"]) =>
                setSchedule((prev) => ({
                  ...prev,
                  marketingFee: { ...prev.marketingFee, type: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  Percentage of Revenue
                </SelectItem>
                <SelectItem value="fixed">Fixed Monthly Amount</SelectItem>
                <SelectItem value="tiered">Tiered Structure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marketing-value">
              {schedule.marketingFee.type === "percentage"
                ? "Percentage (%)"
                : "Monthly Amount (₹)"}
            </Label>
            <Input
              id="marketing-value"
              type="number"
              step={
                schedule.marketingFee.type === "percentage" ? "0.1" : "1000"
              }
              value={schedule.marketingFee.value}
              onChange={(e) =>
                setSchedule((prev) => ({
                  ...prev,
                  marketingFee: {
                    ...prev.marketingFee,
                    value: Number(e.target.value),
                  },
                }))
              }
              placeholder={
                schedule.marketingFee.type === "percentage" ? "2.0" : "50000"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Incentives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Incentives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="performance-incentives"
              checked={schedule.performanceIncentives?.enabled}
              onCheckedChange={(checked) =>
                setSchedule((prev) => ({
                  ...prev,
                  performanceIncentives: {
                    ...prev.performanceIncentives!,
                    enabled: !!checked,
                  },
                }))
              }
            />

            <Label htmlFor="performance-incentives">
              Enable Performance Incentives
            </Label>
          </div>

          {schedule.performanceIncentives?.enabled && (
            <div className="ml-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bonus-threshold">
                    Performance Threshold (₹)
                  </Label>
                  <Input
                    id="bonus-threshold"
                    type="number"
                    value={schedule.performanceIncentives.bonusThreshold}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        performanceIncentives: {
                          ...prev.performanceIncentives!,
                          bonusThreshold: Number(e.target.value),
                        },
                      }))
                    }
                    placeholder="5000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus-reduction">Royalty Reduction (%)</Label>
                  <Input
                    id="bonus-reduction"
                    type="number"
                    step="0.1"
                    value={schedule.performanceIncentives.bonusReduction}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        performanceIncentives: {
                          ...prev.performanceIncentives!,
                          bonusReduction: Number(e.target.value),
                        },
                      }))
                    }
                    placeholder="1.0"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Franchisees exceeding ₹
                {schedule.performanceIncentives.bonusThreshold.toLocaleString()}
                annual revenue receive a{" "}
                {schedule.performanceIncentives.bonusReduction}% royalty
                reduction.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Volume Discounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="volume-discounts"
              checked={schedule.volumeDiscounts?.enabled}
              onCheckedChange={(checked) =>
                setSchedule((prev) => ({
                  ...prev,
                  volumeDiscounts: {
                    ...prev.volumeDiscounts!,
                    enabled: !!checked,
                  },
                }))
              }
            />

            <Label htmlFor="volume-discounts">Enable Volume Discounts</Label>
          </div>

          {schedule.volumeDiscounts?.enabled && (
            <div className="ml-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="multi-unit-discount">
                    Multi-Unit Discount (%)
                  </Label>
                  <Input
                    id="multi-unit-discount"
                    type="number"
                    step="0.1"
                    value={schedule.volumeDiscounts.multiUnitDiscount}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        volumeDiscounts: {
                          ...prev.volumeDiscounts!,
                          multiUnitDiscount: Number(e.target.value),
                        },
                      }))
                    }
                    placeholder="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loyalty-discount">Loyalty Discount (%)</Label>
                  <Input
                    id="loyalty-discount"
                    type="number"
                    step="0.1"
                    value={schedule.volumeDiscounts.loyaltyDiscount}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        volumeDiscounts: {
                          ...prev.volumeDiscounts!,
                          loyaltyDiscount: Number(e.target.value),
                        },
                      }))
                    }
                    placeholder="0.25"
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • Multi-unit operators receive{" "}
                  {schedule.volumeDiscounts.multiUnitDiscount}% royalty
                  reduction
                </p>
                <p>
                  • Franchisees with 5+ years receive{" "}
                  {schedule.volumeDiscounts.loyaltyDiscount}% loyalty discount
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Royalty Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="simulation-revenue">Annual Revenue (₹)</Label>
            <Input
              id="simulation-revenue"
              type="number"
              value={simulationRevenue}
              onChange={(e) => setSimulationRevenue(Number(e.target.value))}
              placeholder="2400000"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {simulationResult.rate.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Effective Royalty Rate
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  ₹{(simulationResult.amount / 100000).toFixed(1)}L
                </div>
                <div className="text-sm text-muted-foreground">
                  Annual Royalty
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  ₹{(marketingFeeAmount / 100000).toFixed(1)}L
                </div>
                <div className="text-sm text-muted-foreground">
                  Marketing Fee
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />

                <span className="font-medium text-blue-800">
                  Calculation Details
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Revenue: ₹{simulationRevenue.toLocaleString()}</p>
                <p>
                  Royalty: ₹{simulationResult.amount.toLocaleString()} (
                  {simulationResult.rate.toFixed(2)}%)
                </p>
                <p>Marketing Fee: ₹{marketingFeeAmount.toLocaleString()}</p>
                <p>
                  Total Fees: ₹
                  {(
                    simulationResult.amount + marketingFeeAmount
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
