import { useState, useEffect } from 'react';

function PredictPricePage() {
  const [formData, setFormData] = useState({
    location: '',
    sq_ft: '',
    age: '',
    furnishing: '',
    amenities_count: '',
    bedrooms: '1',
    bathrooms: '1'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [furnishingTypes, setFurnishingTypes] = useState([]);
  const [mlServiceStatus, setMlServiceStatus] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [locationsRes, furnishingRes] = await Promise.all([
          fetch('http://localhost:5001/locations'),
          fetch('http://localhost:5001/furnishing-types')
        ]);

        if (locationsRes.ok) {
          const locData = await locationsRes.json();
          setLocations(locData.locations || []);
          if (locData.locations && locData.locations.length > 0) {
            setFormData(prev => ({ ...prev, location: locData.locations[0] }));
          }
        }

        if (furnishingRes.ok) {
          const furnData = await furnishingRes.json();
          setFurnishingTypes(furnData.furnishing_types || []);
          if (furnData.furnishing_types && furnData.furnishing_types.length > 0) {
            setFormData(prev => ({ ...prev, furnishing: furnData.furnishing_types[0] }));
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
      } catch (err) {
        setMlServiceStatus({ status: 'error', model_loaded: false });
      }
    };

    checkMLService();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        setPrediction(data);
      } else {
        setError(data.error || 'Failed to get prediction');
      }
    } catch (err) {
      setError('Error connecting to server. Make sure both backend and ML service are running.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            🔮 AI Price Predictor
          </h1>
          <p className="text-purple-600 text-lg">Get instant property price predictions powered by Machine Learning</p>
          {mlServiceStatus && (
            <div className={`mt-4 inline-block px-4 py-2 rounded-full font-semibold ${
              mlServiceStatus.model_loaded 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              ML Service: {mlServiceStatus.model_loaded ? '✅ Online' : '❌ Offline'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">Property Details</h2>
            <form onSubmit={handlePredict} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Location *</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Square Footage (sq ft) *</label>
                <input
                  type="number"
                  name="sq_ft"
                  value={formData.sq_ft}
                  onChange={handleChange}
                  min="100"
                  max="10000"
                  required
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Property Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Furnishing *</label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {furnishingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Amenities</label>
                  <input
                    type="number"
                    name="amenities_count"
                    value={formData.amenities_count}
                    onChange={handleChange}
                    min="0"
                    max="20"
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Predicting...' : '🔮 Predict Price'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            {prediction && (
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-2xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-6">💰 Predicted Price</h2>
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold mb-2">{prediction.formatted_price}</div>
                  <p className="text-purple-200">AI-Powered Prediction</p>
                </div>

                {prediction.feature_importance && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
                    <div className="space-y-3">
                      {Object.entries(prediction.feature_importance).map(([feature, importance]) => (
                        <div key={feature} className="flex items-center space-x-3">
                          <span className="text-sm w-32 capitalize">{feature.replace('_', ' ')}</span>
                          <div className="flex-1 bg-white bg-opacity-30 rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-white h-full rounded-full transition-all"
                              style={{ width: `${importance * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-12 text-right">{(importance * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white bg-opacity-20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Input Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="opacity-75">Location:</span> <span className="font-semibold">{prediction.input_features.location}</span></div>
                    <div><span className="opacity-75">Area:</span> <span className="font-semibold">{prediction.input_features.sq_ft} sq ft</span></div>
                    <div><span className="opacity-75">Age:</span> <span className="font-semibold">{prediction.input_features.age} years</span></div>
                    <div><span className="opacity-75">Furnishing:</span> <span className="font-semibold">{prediction.input_features.furnishing}</span></div>
                    <div><span className="opacity-75">Bedrooms:</span> <span className="font-semibold">{prediction.input_features.bedrooms}</span></div>
                    <div><span className="opacity-75">Bathrooms:</span> <span className="font-semibold">{prediction.input_features.bathrooms}</span></div>
                    <div className="col-span-2"><span className="opacity-75">Amenities:</span> <span className="font-semibold">{prediction.input_features.amenities_count}</span></div>
                  </div>
                </div>
              </div>
            )}

            {!prediction && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-semibold text-purple-900 mb-2">Ready to Predict</h3>
                <p className="text-purple-600">Fill in the form and click "Predict Price" to get an AI-powered estimate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictPricePage;

