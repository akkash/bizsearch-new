import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUpIcon,
  DollarSignIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  DownloadIcon,
  RefreshCwIcon,
} from "lucide-react";

export interface FranchiseMetrics {
  franchiseId: string;
  franchiseName: string;
  territory: string;
  franchisee: string;
  launchDate: string;
  status: "active" | "underperforming" | "excellent" | "new";

  // Financial Metrics
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  profitMargin: number;
  royaltyPaid: number;

  // Operational Metrics
  customerCount: number;
  customerGrowth: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  employeeCount: number;

  // Performance Metrics
  marketShare: number;
  brandCompliance: number;
  trainingCompletion: number;

  // Historical Data
  revenueHistory: Array<{
    month: string;
    revenue: number;
    target: number;
  }>;

  customerHistory: Array<{
    month: string;
    customers: number;
    satisfaction: number;
  }>;
}

export interface FranchiseMetricsProps {
  metrics?: FranchiseMetrics[];
  onExportData?: () => void;
  onRefreshData?: () => void;
  className?: string;
}

const mockMetrics: FranchiseMetrics[] = [
  {
    franchiseId: "f1",
    franchiseName: "TechCafe Mumbai Central",
    territory: "Mumbai Central",
    franchisee: "Rajesh Kumar",
    launchDate: "2023-06-15",
    status: "excellent",
    monthlyRevenue: 450000,
    yearlyRevenue: 4800000,
    revenueGrowth: 18,
    profitMargin: 22,
    royaltyPaid: 48000,
    customerCount: 2500,
    customerGrowth: 15,
    averageOrderValue: 180,
    customerSatisfaction: 4.2,
    employeeCount: 12,
    marketShare: 15,
    brandCompliance: 95,
    trainingCompletion: 100,
    revenueHistory: [
      { month: "Jan", revenue: 380000, target: 400000 },
      { month: "Feb", revenue: 420000, target: 400000 },
      { month: "Mar", revenue: 450000, target: 420000 },
      { month: "Apr", revenue: 480000, target: 450000 },
      { month: "May", revenue: 510000, target: 480000 },
      { month: "Jun", revenue: 450000, target: 500000 },
    ],

    customerHistory: [
      { month: "Jan", customers: 2200, satisfaction: 4.0 },
      { month: "Feb", customers: 2300, satisfaction: 4.1 },
      { month: "Mar", customers: 2400, satisfaction: 4.2 },
      { month: "Apr", customers: 2450, satisfaction: 4.1 },
      { month: "May", customers: 2500, satisfaction: 4.2 },
      { month: "Jun", customers: 2500, satisfaction: 4.2 },
    ],
  },
  {
    franchiseId: "f2",
    franchiseName: "TechCafe Bangalore",
    territory: "Bangalore Tech Hub",
    franchisee: "Priya Sharma",
    launchDate: "2023-09-20",
    status: "active",
    monthlyRevenue: 320000,
    yearlyRevenue: 2880000,
    revenueGrowth: 12,
    profitMargin: 18,
    royaltyPaid: 28800,
    customerCount: 1800,
    customerGrowth: 8,
    averageOrderValue: 178,
    customerSatisfaction: 3.9,
    employeeCount: 9,
    marketShare: 12,
    brandCompliance: 88,
    trainingCompletion: 85,
    revenueHistory: [
      { month: "Jan", revenue: 280000, target: 300000 },
      { month: "Feb", revenue: 300000, target: 310000 },
      { month: "Mar", revenue: 320000, target: 320000 },
      { month: "Apr", revenue: 310000, target: 330000 },
      { month: "May", revenue: 340000, target: 340000 },
      { month: "Jun", revenue: 320000, target: 350000 },
    ],

    customerHistory: [
      { month: "Jan", customers: 1650, satisfaction: 3.8 },
      { month: "Feb", customers: 1700, satisfaction: 3.9 },
      { month: "Mar", customers: 1750, satisfaction: 3.9 },
      { month: "Apr", customers: 1780, satisfaction: 3.8 },
      { month: "May", customers: 1800, satisfaction: 3.9 },
      { month: "Jun", customers: 1800, satisfaction: 3.9 },
    ],
  },
  {
    franchiseId: "f3",
    franchiseName: "TechCafe Chennai",
    territory: "Chennai IT Corridor",
    franchisee: "Arun Krishnan",
    launchDate: "2024-01-10",
    status: "new",
    monthlyRevenue: 180000,
    yearlyRevenue: 900000,
    revenueGrowth: 25,
    profitMargin: 15,
    royaltyPaid: 9000,
    customerCount: 1200,
    customerGrowth: 20,
    averageOrderValue: 150,
    customerSatisfaction: 4.0,
    employeeCount: 6,
    marketShare: 8,
    brandCompliance: 92,
    trainingCompletion: 90,
    revenueHistory: [
      { month: "Jan", revenue: 120000, target: 150000 },
      { month: "Feb", revenue: 140000, target: 160000 },
      { month: "Mar", revenue: 160000, target: 170000 },
      { month: "Apr", revenue: 170000, target: 180000 },
      { month: "May", revenue: 180000, target: 190000 },
      { month: "Jun", revenue: 180000, target: 200000 },
    ],

    customerHistory: [
      { month: "Jan", customers: 800, satisfaction: 3.8 },
      { month: "Feb", customers: 950, satisfaction: 3.9 },
      { month: "Mar", customers: 1100, satisfaction: 4.0 },
      { month: "Apr", customers: 1150, satisfaction: 4.0 },
      { month: "May", customers: 1200, satisfaction: 4.0 },
      { month: "Jun", customers: 1200, satisfaction: 4.0 },
    ],
  },
];

const statusConfig = {
  excellent: { color: "bg-green-100 text-green-800", label: "Excellent" },
  active: { color: "bg-blue-100 text-blue-800", label: "Active" },
  underperforming: {
    color: "bg-red-100 text-red-800",
    label: "Underperforming",
  },
  new: { color: "bg-purple-100 text-purple-800", label: "New" },
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function FranchiseMetrics({
  metrics = mockMetrics,
  onExportData,
  onRefreshData,
  className = "",
}: FranchiseMetricsProps) {
  const [selectedFranchise, setSelectedFranchise] = useState<string>(
    metrics[0]?.franchiseId || ""
  );

  const selectedMetrics =
    metrics.find((m) => m.franchiseId === selectedFranchise) || metrics[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // Aggregate metrics for overview
  const totalRevenue = metrics.reduce((sum, m) => sum + m.yearlyRevenue, 0);
  const totalCustomers = metrics.reduce((sum, m) => sum + m.customerCount, 0);
  const avgSatisfaction =
    metrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) /
    metrics.length;
  const avgGrowth =
    metrics.reduce((sum, m) => sum + m.revenueGrowth, 0) / metrics.length;

  // Performance distribution data
  const performanceData = [
    {
      name: "Excellent",
      value: metrics.filter((m) => m.status === "excellent").length,
    },
    {
      name: "Active",
      value: metrics.filter((m) => m.status === "active").length,
    },
    { name: "New", value: metrics.filter((m) => m.status === "new").length },
    {
      name: "Underperforming",
      value: metrics.filter((m) => m.status === "underperforming").length,
    },
  ].filter((d) => d.value > 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Franchise Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor and analyze franchise performance across all territories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefreshData}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onExportData}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-green-500" />

              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUpIcon className="h-3 w-3" />
                  {avgGrowth.toFixed(1)}% growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-blue-500" />

              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">
                  {formatNumber(totalCustomers)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Across {metrics.length} locations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Satisfaction
                </p>
                <p className="text-2xl font-bold">
                  {avgSatisfaction.toFixed(1)}/5
                </p>
                <p className="text-xs text-muted-foreground">Customer rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-purple-500" />

              <div>
                <p className="text-sm text-muted-foreground">
                  Active Locations
                </p>
                <p className="text-2xl font-bold">{metrics.length}</p>
                <p className="text-xs text-muted-foreground">
                  Franchise outlets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="aspect-[none] h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedMetrics?.revenueHistory || []}>
                  <ChartTooltip />

                  <XAxis dataKey="month" />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Actual Revenue"
                  />

                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="aspect-[none] h-[300px]" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {performanceData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Franchise Selection and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Franchise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.map((metric) => (
                <button
                  key={metric.franchiseId}
                  onClick={() => setSelectedFranchise(metric.franchiseId)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedFranchise === metric.franchiseId
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {metric.franchiseName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.territory}
                      </p>
                    </div>
                    <Badge className={statusConfig[metric.status].color}>
                      {statusConfig[metric.status].label}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMetrics.franchiseName}</CardTitle>
                <p className="text-muted-foreground">
                  {selectedMetrics.territory} • Franchisee:{" "}
                  {selectedMetrics.franchisee}
                </p>
              </div>
              <Badge className={statusConfig[selectedMetrics.status].color}>
                {statusConfig[selectedMetrics.status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-xl font-bold">
                  {formatCurrency(selectedMetrics.monthlyRevenue)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUpIcon className="h-3 w-3" />
                  {selectedMetrics.revenueGrowth}% growth
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-xl font-bold">
                  {formatNumber(selectedMetrics.customerCount)}
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <TrendingUpIcon className="h-3 w-3" />
                  {selectedMetrics.customerGrowth}% growth
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-xl font-bold">
                  {selectedMetrics.customerSatisfaction}/5
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-3 w-3 ${star <= selectedMetrics.customerSatisfaction
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-bold">
                  {selectedMetrics.profitMargin}%
                </p>
                <p className="text-xs text-muted-foreground">
                  AOV: {formatCurrency(selectedMetrics.averageOrderValue)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Market Share</p>
                <p className="text-lg font-semibold">
                  {selectedMetrics.marketShare}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Brand Compliance
                </p>
                <p className="text-lg font-semibold">
                  {selectedMetrics.brandCompliance}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Training Completion
                </p>
                <p className="text-lg font-semibold">
                  {selectedMetrics.trainingCompletion}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Growth & Satisfaction Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="aspect-[none] h-[300px]" config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedMetrics?.customerHistory || []}>
                <ChartTooltip />

                <XAxis dataKey="month" />

                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Customer Count"
                />

                <Line
                  type="monotone"
                  dataKey="satisfaction"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Satisfaction Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
