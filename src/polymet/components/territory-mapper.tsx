import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Trash2,
  Globe,
  Building,
  Users,
  AlertCircle,
  CheckCircle,
  Search,
} from "lucide-react";

interface Territory {
  id: string;
  type: "state" | "city" | "district" | "custom";
  name: string;
  population?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  isAvailable: boolean;
  isProtected: boolean;
  exclusivityRadius?: number; // in km
}

interface TerritoryMapperProps {
  selectedTerritories?: Territory[];
  onTerritoriesChange?: (territories: Territory[]) => void;
  protectedTerritoryEnabled?: boolean;
  onProtectedTerritoryChange?: (enabled: boolean) => void;
  className?: string;
}

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Puducherry",
];

const majorCities = [
  { name: "Mumbai", state: "Maharashtra", population: 12442373 },
  { name: "Delhi", state: "Delhi", population: 11007835 },
  { name: "Bangalore", state: "Karnataka", population: 8443675 },
  { name: "Hyderabad", state: "Telangana", population: 6809970 },
  { name: "Ahmedabad", state: "Gujarat", population: 5570585 },
  { name: "Chennai", state: "Tamil Nadu", population: 4681087 },
  { name: "Kolkata", state: "West Bengal", population: 4496694 },
  { name: "Surat", state: "Gujarat", population: 4467797 },
  { name: "Pune", state: "Maharashtra", population: 3124458 },
  { name: "Jaipur", state: "Rajasthan", population: 3046163 },
];

export function TerritoryMapper({
  selectedTerritories = [],
  onTerritoriesChange,
  protectedTerritoryEnabled = false,
  onProtectedTerritoryChange,
  className,
}: TerritoryMapperProps) {
  const [territories, setTerritories] =
    useState<Territory[]>(selectedTerritories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<Territory["type"]>("state");
  const [customTerritoryName, setCustomTerritoryName] = useState("");
  const [exclusivityRadius, setExclusivityRadius] = useState(10);
  const [protectedTerritory, setProtectedTerritory] = useState(
    protectedTerritoryEnabled
  );

  useEffect(() => {
    onTerritoriesChange?.(territories);
  }, [territories, onTerritoriesChange]);

  useEffect(() => {
    onProtectedTerritoryChange?.(protectedTerritory);
  }, [protectedTerritory, onProtectedTerritoryChange]);

  const addTerritory = (
    name: string,
    type: Territory["type"],
    additionalData?: Partial<Territory>
  ) => {
    const newTerritory: Territory = {
      id: `${type}-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      type,
      name,
      isAvailable: true,
      isProtected: protectedTerritory,
      exclusivityRadius: protectedTerritory ? exclusivityRadius : undefined,
      ...additionalData,
    };

    setTerritories((prev) => [...prev, newTerritory]);
  };

  const removeTerritory = (id: string) => {
    setTerritories((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTerritoryAvailability = (id: string) => {
    setTerritories((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isAvailable: !t.isAvailable } : t))
    );
  };

  const handleAddState = (stateName: string) => {
    if (!territories.find((t) => t.name === stateName && t.type === "state")) {
      addTerritory(stateName, "state");
    }
  };

  const handleAddCity = (city: (typeof majorCities)[0]) => {
    if (!territories.find((t) => t.name === city.name && t.type === "city")) {
      addTerritory(city.name, "city", {
        population: city.population,
        coordinates: { lat: 0, lng: 0 }, // In real implementation, would have actual coordinates
      });
    }
  };

  const handleAddCustomTerritory = () => {
    if (customTerritoryName.trim()) {
      addTerritory(customTerritoryName.trim(), "custom");
      setCustomTerritoryName("");
    }
  };

  const filteredStates = indianStates.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = majorCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTerritoryIcon = (type: Territory["type"]) => {
    switch (type) {
      case "state":
        return <Globe className="h-4 w-4" />;

      case "city":
        return <Building className="h-4 w-4" />;

      case "district":
        return <MapPin className="h-4 w-4" />;

      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTotalPopulation = () => {
    return territories.reduce((total, territory) => {
      return total + (territory.population || 0);
    }, 0);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Territory Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Territory Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Protected Territory Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="protected-territory"
                checked={protectedTerritory}
                onCheckedChange={setProtectedTerritory}
              />

              <Label htmlFor="protected-territory" className="font-medium">
                Enable Protected Territory Rights
              </Label>
            </div>

            {protectedTerritory && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exclusivity-radius">
                      Exclusivity Radius (km)
                    </Label>
                    <Input
                      id="exclusivity-radius"
                      type="number"
                      value={exclusivityRadius}
                      onChange={(e) =>
                        setExclusivityRadius(Number(e.target.value))
                      }
                      className="w-32"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Franchisees will have exclusive rights within{" "}
                  {exclusivityRadius}km radius of their location.
                </p>
              </div>
            )}
          </div>

          {/* Territory Type Selection */}
          <div className="space-y-4">
            <Label>Territory Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value: Territory["type"]) =>
                setSelectedType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="state">State/Province</SelectItem>
                <SelectItem value="city">City/Metro</SelectItem>
                <SelectItem value="district">District/Region</SelectItem>
                <SelectItem value="custom">Custom Territory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="territory-search">Search Territories</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                id="territory-search"
                placeholder="Search states, cities, or regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Territory Options */}
          <div className="space-y-4">
            {selectedType === "state" && (
              <div className="space-y-3">
                <Label>Available States</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {filteredStates.map((state) => (
                    <Button
                      key={state}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddState(state)}
                      disabled={territories.some(
                        (t) => t.name === state && t.type === "state"
                      )}
                      className="justify-start"
                    >
                      <Plus className="h-3 w-3 mr-2" />

                      {state}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === "city" && (
              <div className="space-y-3">
                <Label>Major Cities</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <div
                      key={city.name}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {city.state} • Population:{" "}
                          {city.population.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCity(city)}
                        disabled={territories.some(
                          (t) => t.name === city.name && t.type === "city"
                        )}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedType === "custom" && (
              <div className="space-y-3">
                <Label htmlFor="custom-territory">Custom Territory Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-territory"
                    placeholder="Enter custom territory name..."
                    value={customTerritoryName}
                    onChange={(e) => setCustomTerritoryName(e.target.value)}
                  />

                  <Button
                    onClick={handleAddCustomTerritory}
                    disabled={!customTerritoryName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Territories */}
      {territories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Territories ({territories.length})</span>
              <div className="text-sm font-normal text-muted-foreground">
                Total Population: {getTotalPopulation().toLocaleString()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {territories.map((territory) => (
                <div
                  key={territory.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getTerritoryIcon(territory.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{territory.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {territory.type}
                        </Badge>
                        {territory.isProtected && (
                          <Badge variant="secondary" className="text-xs">
                            Protected ({territory.exclusivityRadius}km)
                          </Badge>
                        )}
                      </div>
                      {territory.population && (
                        <div className="text-sm text-muted-foreground">
                          Population: {territory.population.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTerritoryAvailability(territory.id)}
                      className={
                        territory.isAvailable
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {territory.isAvailable ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      {territory.isAvailable ? "Available" : "Unavailable"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTerritory(territory.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Territory Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />

              <p className="text-muted-foreground">
                Interactive map integration
              </p>
              <p className="text-sm text-muted-foreground">
                Map will show selected territories with boundaries and
                exclusivity zones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Territory Summary */}
      {territories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Territory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{territories.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Territories
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {territories.filter((t) => t.isAvailable).length}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {territories.filter((t) => t.isProtected).length}
                </div>
                <div className="text-sm text-muted-foreground">Protected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
