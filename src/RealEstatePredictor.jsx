import { useState, useEffect } from 'react';
import './RealEstatePredictor.css';

function RealEstatePredictor() {
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

  // Fetch available locations and furnishing types
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

    // Check ML service status
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
    <div className="real-estate-predictor">
      <div className="predictor-header">
        <h1>🏠 Real Estate Price Predictor</h1>
        <p>AI-Powered Property Price Prediction</p>
        {mlServiceStatus && (
          <div className={`ml-status ${mlServiceStatus.model_loaded ? 'online' : 'offline'}`}>
            ML Service: {mlServiceStatus.model_loaded ? '✅ Online' : '❌ Offline'}
          </div>
        )}
      </div>

      <div className="predictor-container">
        <form className="prediction-form" onSubmit={handlePredict}>
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sq_ft">Square Footage (sq ft) *</label>
            <input
              type="number"
              id="sq_ft"
              name="sq_ft"
              value={formData.sq_ft}
              onChange={handleChange}
              min="100"
              max="10000"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Property Age (years)</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="furnishing">Furnishing *</label>
              <select
                id="furnishing"
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
                required
              >
                {furnishingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amenities_count">Amenities Count</label>
              <input
                type="number"
                id="amenities_count"
                name="amenities_count"
                value={formData.amenities_count}
                onChange={handleChange}
                min="0"
                max="20"
              />
            </div>
          </div>

          <button type="submit" className="predict-button" disabled={loading}>
            {loading ? 'Predicting...' : '🔮 Predict Price'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {prediction && (
          <div className="prediction-result">
            <h2>💰 Predicted Price</h2>
            <div className="price-display">
              <span className="price-amount">{prediction.formatted_price}</span>
            </div>
            
            {prediction.feature_importance && (
              <div className="feature-importance">
                <h3>Feature Importance</h3>
                <div className="importance-bars">
                  {Object.entries(prediction.feature_importance).map(([feature, importance]) => (
                    <div key={feature} className="importance-item">
                      <span className="feature-name">{feature.replace('_', ' ')}</span>
                      <div className="importance-bar-container">
                        <div 
                          className="importance-bar" 
                          style={{ width: `${importance * 100}%` }}
                        ></div>
                      </div>
                      <span className="importance-value">{(importance * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="input-summary">
              <h3>Input Summary</h3>
              <div className="summary-grid">
                <div><strong>Location:</strong> {prediction.input_features.location}</div>
                <div><strong>Square Footage:</strong> {prediction.input_features.sq_ft} sq ft</div>
                <div><strong>Age:</strong> {prediction.input_features.age} years</div>
                <div><strong>Furnishing:</strong> {prediction.input_features.furnishing}</div>
                <div><strong>Bedrooms:</strong> {prediction.input_features.bedrooms}</div>
                <div><strong>Bathrooms:</strong> {prediction.input_features.bathrooms}</div>
                <div><strong>Amenities:</strong> {prediction.input_features.amenities_count}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RealEstatePredictor;

