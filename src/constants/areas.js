// Default Chennai areas — used when ML service geo_config is missing or outdated
export const DEFAULT_AREAS = [
  { name: 'Anna Nagar', lat: 13.085, lng: 80.2101 },
  { name: 'OMR / Sholinganallur', lat: 12.901, lng: 80.2279 },
  { name: 'T Nagar', lat: 13.0418, lng: 80.2341 },
  { name: 'Velachery', lat: 12.975, lng: 80.2206 },
  { name: 'Porur', lat: 13.0358, lng: 80.1562 },
  { name: 'Ambattur', lat: 13.1143, lng: 80.1548 },
];

export const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

export const DEFAULT_FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

export function normalizeAreas(data) {
  if (Array.isArray(data?.areas) && data.areas.length > 0) {
    return data.areas;
  }

  if (Array.isArray(data?.locations) && data.locations.length > 0) {
    return data.locations.map((name, index) => {
      const fallback = DEFAULT_AREAS[index] || DEFAULT_AREAS[0];
      return { name, lat: fallback.lat, lng: fallback.lng };
    });
  }

  return DEFAULT_AREAS;
}
