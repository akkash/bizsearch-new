import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  MapPinIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
} from "lucide-react";

export interface Territory {
  id: string;
  name: string;
  type: "state" | "city" | "zip" | "custom";
  coordinates?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  polygon?: Array<{ lat: number; lng: number }>;
  status: "available" | "reserved" | "sold" | "under_negotiation";
  population?: number;
  avgIncome?: number;
  marketPenetration?: number;
  competitorCount?: number;
  estimatedROI?: number;
  reservedUntil?: string;
  franchiseeId?: string;
  franchiseeName?: string;
  performanceMetrics?: {
    revenue?: number;
    growth?: number;
    satisfaction?: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TerritoryAvailabilityProps {
  territories?: Territory[];
  onTerritoryUpdate?: (territory: Territory) => void;
  onTerritoryAdd?: (
    territory: Omit<Territory, "id" | "createdAt" | "updatedAt">
  ) => void;
  onTerritoryDelete?: (territoryId: string) => void;
  canManage?: boolean;
  className?: string;
}

const mockTerritories: Territory[] = [
  {
    id: "t1",
    name: "Mumbai Central",
    type: "city",
    coordinates: { lat: 19.076, lng: 72.8777, radius: 10 },
    status: "sold",
    population: 2000000,
    avgIncome: 85000,
    marketPenetration: 15,
    competitorCount: 8,
    estimatedROI: 22,
    franchiseeId: "f1",
    franchiseeName: "Rajesh Kumar",
    performanceMetrics: {
      revenue: 2500000,
      growth: 18,
      satisfaction: 4.2,
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "t2",
    name: "Bangalore Tech Hub",
    type: "custom",
    polygon: [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.9716, lng: 77.7946 },
      { lat: 12.7716, lng: 77.7946 },
      { lat: 12.7716, lng: 77.5946 },
    ],

    status: "available",
    population: 1500000,
    avgIncome: 95000,
    marketPenetration: 8,
    competitorCount: 5,
    estimatedROI: 28,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: "t3",
    name: "Delhi NCR",
    type: "state",
    status: "reserved",
    population: 3200000,
    avgIncome: 78000,
    marketPenetration: 12,
    competitorCount: 12,
    estimatedROI: 19,
    reservedUntil: "2024-02-15",
    franchiseeName: "Priya Sharma",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-18",
  },
  {
    id: "t4",
    name: "Chennai IT Corridor",
    type: "custom",
    status: "under_negotiation",
    population: 1800000,
    avgIncome: 82000,
    marketPenetration: 10,
    competitorCount: 7,
    estimatedROI: 25,
    franchiseeName: "Arun Krishnan",
    notes: "Final negotiations in progress. Expected closure by month end.",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-22",
  },
];

const statusConfig = {
  available: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircleIcon,
    label: "Available",
  },
  reserved: {
    color: "bg-yellow-100 text-yellow-800",
    icon: CalendarIcon,
    label: "Reserved",
  },
  sold: {
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircleIcon,
    label: "Sold",
  },
  under_negotiation: {
    color: "bg-orange-100 text-orange-800",
    icon: AlertTriangleIcon,
    label: "Under Negotiation",
  },
};

export function TerritoryAvailability({
  territories = mockTerritories,
  onTerritoryUpdate,
  onTerritoryAdd,
  onTerritoryDelete,
  canManage = true,
  className = "",
}: TerritoryAvailabilityProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(
    null
  );

  const filteredTerritories = territories
    .filter((territory) => {
      const matchesSearch = territory.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || territory.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "roi":
          return (b.estimatedROI || 0) - (a.estimatedROI || 0);
        case "population":
          return (b.population || 0) - (a.population || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusConfig = (status: Territory["status"]) => {
    return statusConfig[status];
  };

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

  const handleStatusUpdate = (
    territoryId: string,
    newStatus: Territory["status"]
  ) => {
    const territory = territories.find((t) => t.id === territoryId);
    if (territory && onTerritoryUpdate) {
      onTerritoryUpdate({
        ...territory,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Territory Management</h2>
          <p className="text-muted-foreground">
            Manage franchise territory availability and performance
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAddForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Territory
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Territories</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="under_negotiation">Under Negotiation</option>
              </select>
            </div>
            <div>
              <Label htmlFor="sort">Sort by</Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="name">Name</option>
                <option value="roi">ROI</option>
                <option value="population">Population</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <FilterIcon className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Territory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />

              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {territories.filter((t) => t.status === "available").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-yellow-500" />

              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-2xl font-bold">
                  {territories.filter((t) => t.status === "reserved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-500" />

              <div>
                <p className="text-sm text-muted-foreground">Sold</p>
                <p className="text-2xl font-bold">
                  {territories.filter((t) => t.status === "sold").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-green-500" />

              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    territories.reduce(
                      (acc, t) => acc + (t.estimatedROI || 0),
                      0
                    ) / territories.length
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Territory List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTerritories.map((territory) => {
          const config = getStatusConfig(territory.status);
          const StatusIcon = config.icon;

          return (
            <Card
              key={territory.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground" />

                    <div>
                      <CardTitle className="text-lg">
                        {territory.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {territory.type}
                        </Badge>
                        <Badge className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />

                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTerritory(territory)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTerritoryDelete?.(territory.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Population
                      </span>
                    </div>
                    <p className="font-semibold">
                      {territory.population
                        ? formatNumber(territory.population)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Avg Income
                      </span>
                    </div>
                    <p className="font-semibold">
                      {territory.avgIncome
                        ? formatCurrency(territory.avgIncome)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Est. ROI
                      </span>
                    </div>
                    <p className="font-semibold text-green-600">
                      {territory.estimatedROI}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Competitors
                      </span>
                    </div>
                    <p className="font-semibold">{territory.competitorCount}</p>
                  </div>
                </div>

                {/* Franchisee Info */}
                {territory.franchiseeName && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {territory.status === "sold"
                        ? "Franchisee"
                        : "Reserved by"}
                    </p>
                    <p className="font-medium">{territory.franchiseeName}</p>
                    {territory.reservedUntil && (
                      <p className="text-xs text-muted-foreground">
                        Reserved until{" "}
                        {new Date(territory.reservedUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Performance Metrics */}
                {territory.performanceMetrics && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-semibold">
                          {formatCurrency(
                            territory.performanceMetrics.revenue || 0
                          )}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-muted-foreground">Growth</p>
                        <p className="font-semibold">
                          {territory.performanceMetrics.growth}%
                        </p>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <p className="text-xs text-muted-foreground">
                          Satisfaction
                        </p>
                        <p className="font-semibold">
                          {territory.performanceMetrics.satisfaction}/5
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {territory.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">{territory.notes}</p>
                  </div>
                )}

                {/* Quick Actions */}
                {canManage && territory.status === "available" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStatusUpdate(territory.id, "reserved")
                      }
                    >
                      Reserve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(territory.id, "sold")}
                    >
                      Mark as Sold
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTerritories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPinIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

            <h3 className="text-lg font-semibold mb-2">No territories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first territory to get started"}
            </p>
            {canManage && (
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Territory
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
