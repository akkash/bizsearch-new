import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
} from "lucide-react";

interface ROIProjection {
  year: number;
  revenue: number;
  expenses: number;
  netIncome: number;
  cumulativeROI: number;
  breakEvenMonth?: number;
}

interface ROIScenario {
  name: string;
  probability: number;
  projections: ROIProjection[];
  assumptions: string[];
}

interface ROICalculatorProps {
  initialInvestment?: number;
  franchiseFee?: number;
  royaltyPercentage?: number;
  marketingFeePercentage?: number;
  industryType?: string;
  locationTier?: "tier1" | "tier2" | "tier3";
  onROIChange?: (roiData: ROIScenario[]) => void;
  className?: string;
}

const industryBenchmarks = {
  "food-beverage": {
    averageRevenue: 2500000,
    grossMargin: 0.65,
    operatingMargin: 0.15,
    breakEvenMonths: 18,
  },
  retail: {
    averageRevenue: 1800000,
    grossMargin: 0.55,
    operatingMargin: 0.12,
    breakEvenMonths: 24,
  },
  services: {
    averageRevenue: 1200000,
    grossMargin: 0.75,
    operatingMargin: 0.25,
    breakEvenMonths: 12,
  },
  fitness: {
    averageRevenue: 800000,
    grossMargin: 0.7,
    operatingMargin: 0.2,
    breakEvenMonths: 15,
  },
};

const locationMultipliers = {
  tier1: { revenue: 1.3, costs: 1.4 },
  tier2: { revenue: 1.0, costs: 1.0 },
  tier3: { revenue: 0.7, costs: 0.8 },
};

export function ROICalculator({
  initialInvestment = 2500000,
  franchiseFee = 800000,
  royaltyPercentage = 6,
  marketingFeePercentage = 2,
  industryType = "food-beverage",
  locationTier = "tier2",
  onROIChange,
  className,
}: ROICalculatorProps) {
  const [investment, setInvestment] = useState(initialInvestment);
  const [franchise, setFranchise] = useState(franchiseFee);
  const [royalty, setRoyalty] = useState(royaltyPercentage);
  const [marketing, setMarketing] = useState(marketingFeePercentage);
  const [industry, setIndustry] = useState(industryType);
  const [location, setLocation] = useState(locationTier);
  const [scenarios, setScenarios] = useState<ROIScenario[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<string>("optimistic");

  // AI-generated assumptions
  const [aiAssumptions, setAiAssumptions] = useState<string[]>([
    "Market growth rate of 8-12% annually",
    "Customer acquisition cost decreasing over time",
    "Operational efficiency improving by 5% yearly",
    "Local competition remains stable",
  ]);

  useEffect(() => {
    calculateROI();
  }, [investment, franchise, royalty, marketing, industry, location]);

  const calculateROI = async () => {
    setIsCalculating(true);

    // Simulate AI calculation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const benchmark =
      industryBenchmarks[industry as keyof typeof industryBenchmarks];
    const multiplier = locationMultipliers[location];

    const baseRevenue = benchmark.averageRevenue * multiplier.revenue;
    const baseCosts =
      baseRevenue * (1 - benchmark.grossMargin) * multiplier.costs;

    // Generate three scenarios
    const newScenarios: ROIScenario[] = [
      {
        name: "Conservative",
        probability: 30,
        projections: generateProjections(baseRevenue * 0.8, baseCosts * 1.1, 5),
        assumptions: [
          "Lower than average market performance",
          "Higher operational costs initially",
          "Slower customer acquisition",
          "Conservative growth trajectory",
        ],
      },
      {
        name: "Realistic",
        probability: 50,
        projections: generateProjections(baseRevenue, baseCosts, 5),
        assumptions: [
          "Industry average performance",
          "Standard operational efficiency",
          "Moderate market growth",
          "Typical franchise success rate",
        ],
      },
      {
        name: "Optimistic",
        probability: 20,
        projections: generateProjections(baseRevenue * 1.2, baseCosts * 0.9, 5),
        assumptions: [
          "Above average market performance",
          "Excellent operational efficiency",
          "Strong local market demand",
          "Exceptional franchise execution",
        ],
      },
    ];

    setScenarios(newScenarios);
    setIsCalculating(false);
    onROIChange?.(newScenarios);
  };

  const generateProjections = (
    baseRevenue: number,
    baseCosts: number,
    years: number
  ): ROIProjection[] => {
    const projections: ROIProjection[] = [];
    let cumulativeInvestment = investment;
    let cumulativeReturns = 0;

    for (let year = 1; year <= years; year++) {
      const growthRate = Math.pow(1.08, year - 1); // 8% annual growth
      const revenue = baseRevenue * growthRate;
      const royaltyFee = revenue * (royalty / 100);
      const marketingFee = revenue * (marketing / 100);
      const operatingCosts = baseCosts * growthRate;
      const totalExpenses = operatingCosts + royaltyFee + marketingFee;
      const netIncome = revenue - totalExpenses;

      cumulativeReturns += netIncome;
      const cumulativeROI =
        ((cumulativeReturns - cumulativeInvestment) / cumulativeInvestment) *
        100;

      projections.push({
        year,
        revenue,
        expenses: totalExpenses,
        netIncome,
        cumulativeROI,
        breakEvenMonth:
          cumulativeROI > 0 && !projections.find((p) => p.cumulativeROI > 0)
            ? year * 12 - 6
            : undefined,
      });
    }

    return projections;
  };

  const getScenarioColor = (scenarioName: string) => {
    switch (scenarioName.toLowerCase()) {
      case "conservative":
        return "text-red-600 bg-red-50";
      case "realistic":
        return "text-blue-600 bg-blue-50";
      case "optimistic":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const selectedScenarioData = scenarios.find(
    (s) => s.name.toLowerCase() === selectedScenario
  );
  const finalROI =
    selectedScenarioData?.projections[
      selectedScenarioData.projections.length - 1
    ]?.cumulativeROI || 0;
  const breakEvenYear = selectedScenarioData?.projections.find(
    (p) => p.cumulativeROI > 0
  )?.year;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total-investment">Total Investment (₹)</Label>
              <Input
                id="total-investment"
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                placeholder="2500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="franchise-fee">Franchise Fee (₹)</Label>
              <Input
                id="franchise-fee"
                type="number"
                value={franchise}
                onChange={(e) => setFranchise(Number(e.target.value))}
                placeholder="800000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="royalty-percentage">Royalty (%)</Label>
              <Input
                id="royalty-percentage"
                type="number"
                step="0.1"
                value={royalty}
                onChange={(e) => setRoyalty(Number(e.target.value))}
                placeholder="6.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketing-percentage">Marketing Fee (%)</Label>
              <Input
                id="marketing-percentage"
                type="number"
                step="0.1"
                value={marketing}
                onChange={(e) => setMarketing(Number(e.target.value))}
                placeholder="2.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry Type</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location Tier</Label>
              <Select
                value={location}
                onValueChange={(value: "tier1" | "tier2" | "tier3") =>
                  setLocation(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1">Tier 1 (Metro Cities)</SelectItem>
                  <SelectItem value="tier2">Tier 2 (Major Cities)</SelectItem>
                  <SelectItem value="tier3">Tier 3 (Smaller Cities)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculateROI}
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {isCalculating ? "Calculating ROI..." : "Recalculate ROI"}
          </Button>
        </CardContent>
      </Card>

      {/* ROI Results */}
      {scenarios.length > 0 && (
        <>
          {/* Scenario Selection */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.name}
                    onClick={() =>
                      setSelectedScenario(scenario.name.toLowerCase())
                    }
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedScenario === scenario.name.toLowerCase()
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getScenarioColor(scenario.name)}>
                        {scenario.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {scenario.probability}% probability
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {scenario.projections[
                        scenario.projections.length - 1
                      ]?.cumulativeROI.toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      5-year ROI
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Scenario Details */}
          {selectedScenarioData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedScenarioData.name} Scenario</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {finalROI.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      5-Year ROI
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {breakEvenYear ? `${breakEvenYear} years` : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Break-even
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      ₹
                      {(
                        selectedScenarioData.projections[0]?.revenue / 100000
                      ).toFixed(1)}
                      L
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year 1 Revenue
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      ₹
                      {(
                        selectedScenarioData.projections[0]?.netIncome / 100000
                      ).toFixed(1)}
                      L
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year 1 Profit
                    </div>
                  </div>
                </div>

                {/* Year-by-Year Projections */}
                <div className="space-y-3">
                  <h4 className="font-semibold">
                    5-Year Financial Projections
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Revenue</th>
                          <th className="text-right p-2">Expenses</th>
                          <th className="text-right p-2">Net Income</th>
                          <th className="text-right p-2">Cumulative ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedScenarioData.projections.map((projection) => (
                          <tr key={projection.year} className="border-b">
                            <td className="p-2 font-medium">
                              Year {projection.year}
                            </td>
                            <td className="text-right p-2">
                              ₹{(projection.revenue / 100000).toFixed(1)}L
                            </td>
                            <td className="text-right p-2">
                              ₹{(projection.expenses / 100000).toFixed(1)}L
                            </td>
                            <td className="text-right p-2">
                              <span
                                className={
                                  projection.netIncome >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                ₹{(projection.netIncome / 100000).toFixed(1)}L
                              </span>
                            </td>
                            <td className="text-right p-2">
                              <span
                                className={
                                  projection.cumulativeROI >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {projection.cumulativeROI.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assumptions */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Assumptions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedScenarioData.assumptions.map(
                      (assumption, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />

                          <span>{assumption}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />

                    <h4 className="font-semibold text-blue-800">AI Insights</h4>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>
                      Based on industry benchmarks and location analysis, this
                      franchise shows
                      <strong>
                        {" "}
                        {finalROI > 20
                          ? "strong"
                          : finalROI > 10
                            ? "moderate"
                            : "limited"}{" "}
                        ROI potential
                      </strong>
                      .
                    </p>
                    <p>
                      The break-even period of {breakEvenYear} years is
                      <strong>
                        {" "}
                        {breakEvenYear && breakEvenYear <= 2
                          ? "excellent"
                          : breakEvenYear && breakEvenYear <= 3
                            ? "good"
                            : "average"}
                      </strong>
                      for this industry segment.
                    </p>
                    <p>
                      Consider factors like local competition, market
                      saturation, and your operational experience when
                      evaluating this opportunity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {isCalculating && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />

              <div>
                <h3 className="font-semibold">Calculating ROI Projections</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing market data and industry benchmarks...
                </p>
              </div>
              <Progress value={75} className="w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
