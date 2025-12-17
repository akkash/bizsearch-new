import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FranchiseLocation } from '@/lib/franchise-locations-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

// Set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.YOUR_MAPBOX_TOKEN_HERE';

interface FranchiseMapProps {
  locations: FranchiseLocation[];
  onLocationClick?: (location: FranchiseLocation) => void;
}

export function FranchiseMap({ locations, onLocationClick }: FranchiseMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<FranchiseLocation | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      map.current?.remove();
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

    // Add markers for each location
    validLocations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      // Red for operating, white for looking_for_franchise
      if (location.status === 'operating') {
        el.style.backgroundColor = '#EF4444'; // Red
      } else {
        el.style.backgroundColor = '#FFFFFF'; // White
        el.style.border = '3px solid #9CA3AF'; // Gray border for white pins
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude!, location.latitude!])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedLocation(location);
        if (onLocationClick) {
          onLocationClick(location);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (validLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validLocations.forEach((loc) => {
        bounds.extend([loc.longitude!, loc.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [locations, onLocationClick]);

  // Enable clustering for dense areas
  useEffect(() => {
    if (!map.current) return;

    map.current.on('load', () => {
      // Add clustering source
      map.current!.addSource('locations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: locations
            .filter((loc) => loc.latitude && loc.longitude)
            .map((loc) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [loc.longitude!, loc.latitude!],
              },
              properties: {
                id: loc.id,
                name: loc.location_name || loc.city,
                status: loc.status,
              },
            })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster circles
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', 20,
            '#f1f075', 50,
            '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 20,
            30, 50,
            40,
          ],
        },
      });

      // Add cluster count labels
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'locations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Click on cluster to zoom in
      map.current!.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties.cluster_id;
        (map.current!.getSource('locations') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current!.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom,
            });
          }
        );
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });
  }, [locations]);

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
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Location Popup */}
      {selectedLocation && (
        <Card className="absolute top-4 left-4 w-80 shadow-lg z-10">
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
      <Card className="absolute bottom-4 left-4 shadow-lg z-10">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
              <span>Operating</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-400"></div>
              <span>Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
