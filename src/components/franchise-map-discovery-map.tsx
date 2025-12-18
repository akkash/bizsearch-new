import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationWithFranchise } from '@/lib/franchise-map-discovery-service';
import { FranchiseMapDiscoveryService } from '@/lib/franchise-map-discovery-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FranchiseMapDiscoveryMapProps {
    locations: LocationWithFranchise[];
    onLocationClick?: (location: LocationWithFranchise) => void;
}

export function FranchiseMapDiscoveryMap({ locations, onLocationClick }: FranchiseMapDiscoveryMapProps) {
    const navigate = useNavigate();
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationWithFranchise | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Generate brand colors based on unique franchise IDs
    const brandColors = FranchiseMapDiscoveryService.getBrandColors(
        [...new Set(locations.map(l => l.franchise_id))]
    );

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Initialize map centered on India
        map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map.current);

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Filter locations with valid coordinates
        const validLocations = locations.filter(
            (loc) => loc.latitude && loc.longitude
        );

        if (validLocations.length === 0) return;

        // Create pin icon based on status and brand color
        const createPinIcon = (isOperating: boolean, brandColor: string) => {
            const bgColor = isOperating ? brandColor : '#FFFFFF';
            const borderColor = isOperating ? brandColor : '#6B7280';
            const innerColor = isOperating ? '#FFFFFF' : brandColor;

            const svgIcon = `
        <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow${brandColor.replace('#', '')}" x="-30%" y="-20%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
            </filter>
          </defs>
          
          <!-- Teardrop shape -->
          <path 
            d="M16 0C7.16 0 0 7.16 0 16c0 10.67 16 26 16 26s16-15.33 16-26C32 7.16 24.84 0 16 0z" 
            fill="${bgColor}" 
            stroke="${borderColor}" 
            stroke-width="2"
            filter="url(#shadow${brandColor.replace('#', '')})"
          />
          
          <!-- Inner dot -->
          <circle cx="16" cy="14" r="6" fill="${innerColor}" opacity="0.9"/>
        </svg>
      `;

            return L.divIcon({
                className: 'custom-pin-icon',
                html: svgIcon,
                iconSize: [32, 42],
                iconAnchor: [16, 42],
                popupAnchor: [0, -42],
            });
        };

        // Add markers for each location
        validLocations.forEach((location) => {
            const brandColor = brandColors[location.franchise_id] || '#3B82F6';
            const icon = createPinIcon(location.status === 'operating', brandColor);

            const marker = L.marker([location.latitude!, location.longitude!], { icon })
                .addTo(map.current!);

            // Add popup with brand info
            const popupContent = `
        <div style="min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${location.franchise.logo_url
                    ? `<img src="${location.franchise.logo_url}" alt="${location.franchise.brand_name}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px;" />`
                    : `<div style="width: 32px; height: 32px; background: ${brandColor}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${location.franchise.brand_name.charAt(0)}</div>`
                }
            <div>
              <strong>${location.franchise.brand_name}</strong><br/>
              <small style="color: #6B7280;">${location.franchise.industry}</small>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>${location.location_name || `${location.city} Location`}</strong><br/>
            <small>${location.city}, ${location.state}</small>
          </div>
          <span style="
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            ${location.status === 'operating'
                    ? `background: ${brandColor}; color: white;`
                    : 'background: white; color: #374151; border: 1px solid #9CA3AF;'}
          ">
            ${location.status === 'operating' ? 'Operating' : 'Available'}
          </span>
        </div>
      `;
            marker.bindPopup(popupContent);

            // Add click handler
            marker.on('click', () => {
                setSelectedLocation(location);
                if (onLocationClick) {
                    onLocationClick(location);
                }
            });

            markersRef.current.push(marker);
        });

        // Fit map to show all markers
        if (validLocations.length > 0) {
            const bounds = L.latLngBounds(
                validLocations.map((loc) => [loc.latitude!, loc.longitude!] as L.LatLngTuple)
            );
            map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    }, [locations, brandColors, onLocationClick]);

    const formatCurrency = (amount: number | null) => {
        if (!amount) return 'N/A';
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        }
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(0)}L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Get unique franchises for legend
    const uniqueFranchises = [...new Map(
        locations.map(l => [l.franchise_id, { id: l.franchise_id, name: l.franchise.brand_name }])
    ).values()];

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full rounded-lg" style={{ minHeight: '600px' }} />

            {/* Selected Location Card */}
            {selectedLocation && (
                <Card className="absolute top-4 left-4 w-80 shadow-lg z-[1000]">
                    <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {selectedLocation.franchise.logo_url ? (
                                    <img
                                        src={selectedLocation.franchise.logo_url}
                                        alt={selectedLocation.franchise.brand_name}
                                        className="w-12 h-12 object-contain rounded"
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-xl"
                                        style={{ backgroundColor: brandColors[selectedLocation.franchise_id] }}
                                    >
                                        {selectedLocation.franchise.brand_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold">{selectedLocation.franchise.brand_name}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedLocation.franchise.industry}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLocation(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mb-3">
                            <p className="font-medium">
                                {selectedLocation.location_name || `${selectedLocation.city} Location`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <MapPin className="inline h-3 w-3 mr-1" />
                                {selectedLocation.city}, {selectedLocation.state}
                            </p>
                        </div>

                        <Badge
                            className={
                                selectedLocation.status === 'operating'
                                    ? 'text-white'
                                    : 'bg-white text-gray-800 border border-gray-300'
                            }
                            style={{
                                backgroundColor: selectedLocation.status === 'operating'
                                    ? brandColors[selectedLocation.franchise_id]
                                    : undefined
                            }}
                        >
                            {selectedLocation.status === 'operating' ? 'Operating' : 'Looking for Franchise'}
                        </Badge>

                        <div className="mt-4 pt-3 border-t space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Franchise Fee</span>
                                <span className="font-medium">{formatCurrency(selectedLocation.franchise.franchise_fee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Investment</span>
                                <span className="font-medium">
                                    {formatCurrency(selectedLocation.franchise.total_investment_min)} - {formatCurrency(selectedLocation.franchise.total_investment_max)}
                                </span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-4"
                            onClick={() => navigate(`/franchise/${selectedLocation.franchise.slug}`)}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Franchise Details
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Legend */}
            <Card className="absolute bottom-4 left-4 shadow-lg z-[1000] max-w-xs">
                <CardContent className="py-3 px-4">
                    <div className="text-xs font-medium mb-2">Brands</div>
                    <div className="flex flex-wrap gap-2">
                        {uniqueFranchises.slice(0, 5).map(franchise => (
                            <div key={franchise.id} className="flex items-center gap-1 text-xs">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: brandColors[franchise.id] }}
                                />
                                <span className="truncate max-w-[80px]">{franchise.name}</span>
                            </div>
                        ))}
                        {uniqueFranchises.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{uniqueFranchises.length - 5} more</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Operating</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-400" />
                            <span>Available</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
