'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default icon paths break under bundlers, so point them at the imported images
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

interface Coords {
  latitude: number;
  longitude: number;
}

export function MapComponentV1({ from, to }: {
  from: Coords;
  to?: Coords;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const fromMarker = useRef<L.Marker | null>(null);
  const toMarker = useRef<L.Marker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null);

  // Create the map once
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current).setView([from.latitude, from.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    fromMarker.current = L.marker([from.latitude, from.longitude]).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
      fromMarker.current = null;
      toMarker.current = null;
      routeLine.current = null;
    };
  }, []);

  // Update markers and line whenever the coordinates change
  const fromLat = from.latitude;
  const fromLng = from.longitude;
  const toLat = to?.latitude;
  const toLng = to?.longitude;

  useEffect(() => {
    if (!map.current) return;

    map.current.setView([fromLat, fromLng], 13);
    fromMarker.current?.setLatLng([fromLat, fromLng]);

    if (toLat === undefined || toLng === undefined) {
      toMarker.current?.remove();
      routeLine.current?.remove();
      toMarker.current = null;
      routeLine.current = null;
      return;
    }

    if (!toMarker.current) {
      toMarker.current = L.marker([toLat, toLng]).addTo(map.current);
    } else {
      toMarker.current.setLatLng([toLat, toLng]);
    }

    const points: L.LatLngExpression[] = [
      [fromLat, fromLng],
      [toLat, toLng],
    ];

    if (!routeLine.current) {
      routeLine.current = L.polyline(points, { color: '#f97316', weight: 4 }).addTo(map.current);
    } else {
      routeLine.current.setLatLngs(points);
    }

    map.current.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [fromLat, fromLng, toLat, toLng]);

  return (
    <div
      ref={mapContainer}
      className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20"
    />
  );
}
