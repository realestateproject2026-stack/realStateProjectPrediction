import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function PropertyMap({ latitude, longitude, onLocationChange, areas = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationChangeRef = useRef(onLocationChange);

  onLocationChangeRef.current = onLocationChange;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      onLocationChangeRef.current(lat, lng);
    });

    map.on('click', (event) => {
      marker.setLatLng(event.latlng);
      onLocationChangeRef.current(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    areas.forEach((area) => {
      L.circleMarker([area.lat, area.lng], {
        radius: 6,
        color: '#7c3aed',
        fillColor: '#34d399',
        fillOpacity: 0.8,
      })
        .addTo(mapRef.current)
        .bindPopup(area.name);
    });
  }, [areas]);

  useEffect(() => {
    if (!markerRef.current || !mapRef.current) {
      return;
    }

    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.panTo([latitude, longitude]);
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="h-72 w-full rounded-xl border border-slate-200 overflow-hidden z-0"
      />
      <p className="text-xs text-slate-500">
        Click the map or drag the pin to set the property location. Geospatial embeddings are computed from these coordinates.
      </p>
    </div>
  );
}

export default PropertyMap;
