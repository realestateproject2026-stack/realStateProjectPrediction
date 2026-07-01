import { useState, useEffect } from 'react';
import PropertyMap from '../components/PropertyMap';
import PageShell from '../components/PageShell';

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors';

function PredictPricePage() {
  const [formData, setFormData] = useState({
    location_name: '',
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
    sq_ft: '',
    age: '',
    furnishing: '',
    amenities_count: '',
    bedrooms: '1',
    bathrooms: '1',
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [areas, setAreas] = useState([]);
  const [furnishingTypes, setFurnishingTypes] = useState([]);
  const [mlServiceStatus, setMlServiceStatus] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [locationsRes, furnishingRes] = await Promise.all([
          fetch('http://localhost:5001/locations'),
          fetch('http://localhost:5001/furnishing-types'),
        ]);

        if (locationsRes.ok) {
          const locData = await locationsRes.json();
          setAreas(locData.areas || []);
          if (locData.areas?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              location_name: locData.areas[0].name,
              latitude: locData.areas[0].lat,
              longitude: locData.areas[0].lng,
            }));
          }
        }

        if (furnishingRes.ok) {
          const furnData = await furnishingRes.json();
          setFurnishingTypes(furnData.furnishing_types || []);
          if (furnData.furnishing_types?.length > 0) {
            setFormData((prev) => ({ ...prev, furnishing: furnData.furnishing_types[0] }));
          }
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };

    fetchOptions();

    const checkMLService = async () => {
      try {
        const response = await fetch('http://localhost:3000/ml-service/health');
        const data = await response.json();
        setMlServiceStatus(data);
      } catch {
        setMlServiceStatus({ status: 'error', model_loaded: false });
      }
    };

    checkMLService();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaSelect = (e) => {
    const area = areas.find((item) => item.name === e.target.value);
    if (!area) return;
    setFormData((prev) => ({
      ...prev,
      location_name: area.name,
      latitude: area.lat,
      longitude: area.lng,
    }));
  };

  const handleLocationChange = (latitude, longitude) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:3000/predict-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        setPrediction(data);
      } else {
        setError(data.error || 'Failed to get prediction');
      }
    } catch {
      setError('Cannot reach server. Ensure backend and ML service are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="AI Price Predictor"
      subtitle="Multimodal machine learning with geospatial embeddings — pin a location and get an instant estimate."
    >
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">ML Service</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              mlServiceStatus?.model_loaded
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                mlServiceStatus?.model_loaded ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {mlServiceStatus?.model_loaded ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Property details</h2>
            <form onSubmit={handlePredict} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Area</label>
                <select
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleAreaSelect}
                  className={inputClass}
                >
                  {areas.map((area) => (
                    <option key={area.name} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Location on map
                </label>
                <PropertyMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={handleLocationChange}
                  areas={areas}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.000001"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.000001"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Square footage *
                </label>
                <input
                  type="number"
                  name="sq_ft"
                  value={formData.sq_ft}
                  onChange={handleChange}
                  min="100"
                  required
                  placeholder="e.g. 1500"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Furnishing</label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    {furnishingTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Beds</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="1" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Baths</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="1" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amenities</label>
                  <input type="number" name="amenities_count" value={formData.amenities_count} onChange={handleChange} min="0" className={inputClass} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-sm shadow-emerald-600/20 transition-colors"
              >
                {loading ? 'Computing estimate…' : 'Get price estimate'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {prediction ? (
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white sticky top-24">
              <p className="text-emerald-400 text-sm font-medium uppercase tracking-wide">
                Estimated value
              </p>
              <p className="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">
                {prediction.formatted_price}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {prediction.input_features?.location_name} · {prediction.input_features?.sq_ft} sq ft
              </p>

              {prediction.geo_embedding && (
                <div className="mt-8 pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                    Geospatial embedding
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                      <span className="text-slate-500">sin(lat)</span>
                      <p className="font-mono text-emerald-300">{prediction.geo_embedding.sin_lat.toFixed(4)}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                      <span className="text-slate-500">cos(lat)</span>
                      <p className="font-mono text-emerald-300">{prediction.geo_embedding.cos_lat.toFixed(4)}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                      <span className="text-slate-500">sin(lng)</span>
                      <p className="font-mono text-emerald-300">{prediction.geo_embedding.sin_lng.toFixed(4)}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                      <span className="text-slate-500">cos(lng)</span>
                      <p className="font-mono text-emerald-300">{prediction.geo_embedding.cos_lng.toFixed(4)}</p>
                    </div>
                    <div className="col-span-2 bg-slate-800/60 rounded-lg px-3 py-2">
                      <span className="text-slate-500">Distance to center</span>
                      <p className="font-mono text-emerald-300">
                        {prediction.geo_embedding.dist_to_center_km.toFixed(2)} km
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {prediction.feature_importance && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                    Feature importance
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(prediction.feature_importance)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([feature, importance]) => (
                        <div key={feature}>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{feature}</span>
                            <span>{(importance * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${importance * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center sticky top-24">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Awaiting input</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                Fill in property details and submit to see your AI-powered price estimate here.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default PredictPricePage;
