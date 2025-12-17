import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FranchiseLocation } from '@/lib/franchise-locations-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FranchiseMapProps {
  locations: FranchiseLocation[];
  onLocationClick?: (location: FranchiseLocation) => void;
}

export function FranchiseMap({ locations, onLocationClick }: FranchiseMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<FranchiseLocation | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Tamil Nadu, India
    map.current = L.map(mapContainer.current).setView([10.8155, 78.7047], 6);

    // Add OpenStreetMap tile layer (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter locations with valid coordinates
    const validLocations = locations.filter(
      (loc) => loc.latitude && loc.longitude
    );

    if (validLocations.length === 0) return;

    // Create clean teardrop-style pins (no icons inside)
    const createPinIcon = (isOperating: boolean) => {
      const bgColor = isOperating ? '#DC2626' : '#FFFFFF';
      const borderColor = isOperating ? '#991B1B' : '#6B7280';
      const innerColor = isOperating ? '#EF4444' : '#F9FAFB';

      // Clean SVG teardrop pin 
      const svgIcon = `
        <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow${isOperating ? 'Op' : 'Av'}" x="-30%" y="-20%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
            </filter>
            <linearGradient id="pinGrad${isOperating ? 'Op' : 'Av'}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${innerColor}"/>
              <stop offset="100%" style="stop-color:${bgColor}"/>
            </linearGradient>
          </defs>
          
          <!-- Teardrop shape -->
          <path 
            d="M16 0C7.16 0 0 7.16 0 16c0 10.67 16 26 16 26s16-15.33 16-26C32 7.16 24.84 0 16 0z" 
            fill="url(#pinGrad${isOperating ? 'Op' : 'Av'})" 
            stroke="${borderColor}" 
            stroke-width="2"
            filter="url(#shadow${isOperating ? 'Op' : 'Av'})"
          />
          
          <!-- Inner dot -->
          <circle cx="16" cy="14" r="6" fill="${isOperating ? '#FFFFFF' : '#6B7280'}" opacity="${isOperating ? '0.9' : '0.4'}"/>
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

    const operatingIcon = createPinIcon(true);
    const availableIcon = createPinIcon(false);

    // Add markers for each location
    validLocations.forEach((location) => {
      const icon = location.status === 'operating' ? operatingIcon : availableIcon;

      const marker = L.marker([location.latitude!, location.longitude!], { icon })
        .addTo(map.current!);

      // Add popup
      const popupContent = `
        <div style="min-width: 200px;">
          <strong>${location.location_name || `${location.city} Location`}</strong><br/>
          <small>${location.city}, ${location.state}</small><br/>
          <span style="
            display: inline-block;
            margin-top: 4px;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            ${location.status === 'operating'
          ? 'background: #EF4444; color: white;'
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
  }, [locations, onLocationClick]);

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" style={{ minHeight: '600px' }} />

      {/* Location Popup */}
      {selectedLocation && (
        <Card className="absolute top-4 left-4 w-80 shadow-lg z-[1000]">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {selectedLocation.location_name || `${selectedLocation.city} Location`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {selectedLocation.city}, {selectedLocation.state}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLocation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Badge
              className={
                selectedLocation.status === 'operating'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-300'
              }
            >
              {selectedLocation.status === 'operating' ? 'Operating' : 'Looking for Franchise'}
            </Badge>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-muted-foreground">{selectedLocation.address_line1}</p>
              {selectedLocation.address_line2 && (
                <p className="text-muted-foreground">{selectedLocation.address_line2}</p>
              )}
              <p className="text-muted-foreground">
                {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip_code}
              </p>
              {selectedLocation.opening_date && (
                <p className="pt-2 border-t">
                  <span className="text-muted-foreground">Opened:</span>{' '}
                  <span className="font-medium">{formatDate(selectedLocation.opening_date)}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 shadow-lg z-[1000]">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg width="18" height="22" viewBox="0 0 36 44" className="shrink-0">
                <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26s18-14 18-26C36 8.06 27.94 0 18 0z" fill="#DC2626" stroke="#B91C1C" strokeWidth="2" />
              </svg>
              <span>Operating</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="18" height="22" viewBox="0 0 36 44" className="shrink-0">
                <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26s18-14 18-26C36 8.06 27.94 0 18 0z" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="2" />
              </svg>
              <span>Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
