import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import lookouts from '../data/lookouts.json';
import { resolveShots } from '../lib/geo';

// Custom lookout icon — uses /lookout-icon.png from public folder
const lookoutIcon = new L.Icon({
  iconUrl: '/lookout-icon.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Default center: roughly center of the nine lookouts
const DEFAULT_CENTER = [35.0, -111.6];
const DEFAULT_ZOOM = 9;

/**
 * Component that listens for right-clicks on the map and copies
 * the clicked lat/lng to the clipboard. Less obtrusive than alert().
 */
function RightClickToCopy() {
  const map = useMap();

  useEffect(() => {
    const handler = async (e) => {
      const { lat, lng } = e.latlng;
      const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      try {
        await navigator.clipboard.writeText(text);
        // Light feedback via a temporary tooltip
        L.popup({ closeButton: false, autoClose: true, className: 'copied-popup' })
          .setLatLng(e.latlng)
          .setContent(`Copied: ${text}`)
          .openOn(map);
        setTimeout(() => map.closePopup(), 1500);
      } catch {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(text)
          .openOn(map);
      }
    };
    map.on('contextmenu', handler);
    return () => map.off('contextmenu', handler);
  }, [map]);

  return null;
}

export default function Map({ shots }) {
  const { rays, intersections } = useMemo(() => resolveShots(shots), [shots]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RightClickToCopy />

      {/* Lookout markers */}
      {lookouts.map((lo) => (
        <Marker key={lo.id} position={[lo.lat, lo.lng]} icon={lookoutIcon}>
          <Popup>
            <strong>{lo.name}</strong>
            <br />
            {lo.elevation_ft.toLocaleString()} ft &middot; {lo.forest} NF
            <br />
            {lo.lat.toFixed(5)}, {lo.lng.toFixed(5)}
          </Popup>
        </Marker>
      ))}

      {/* Azimuth rays */}
      {rays.map((ray, i) => (
        <Polyline
          key={`ray-${i}`}
          positions={[
            [ray.shot.lookout.lat, ray.shot.lookout.lng],
            [ray.end.lat, ray.end.lng],
          ]}
          pathOptions={{
            color: ray.shot.color || '#d62828',
            weight: 2,
            opacity: 0.85,
            dashArray: '6 4',
          }}
        />
      ))}

      {/* Intersections — likely smoke locations */}
      {intersections.map((pt, i) => (
        <CircleMarker
          key={`xsec-${i}`}
          center={[pt.lat, pt.lng]}
          radius={7}
          pathOptions={{
            color: '#1d4ed8',
            fillColor: '#3b82f6',
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <strong>Smoke</strong>
            <br />
            {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
            <br />
            {pt.shotA.lookout.name}: {pt.distanceFromA.toFixed(1)} mi
            <br />
            {pt.shotB.lookout.name}: {pt.distanceFromB.toFixed(1)} mi
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}