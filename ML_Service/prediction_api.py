"""
Flask API for Real Estate Price Prediction
Provides endpoint to predict property prices using trained ML model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# Load model and encoders
MODEL_PATH = 'models/property_price_model.pkl'
LOCATION_ENCODER_PATH = 'models/location_encoder.pkl'
FURNISHING_ENCODER_PATH = 'models/furnishing_encoder.pkl'
FEATURE_NAMES_PATH = 'models/feature_names.json'

model = None
le_location = None
le_furnishing = None
feature_names = None

def load_model():
    """Load the trained model and encoders"""
    global model, le_location, le_furnishing, feature_names
    
    try:
        if not os.path.exists(MODEL_PATH):
            return False, "Model not found. Please train the model first."
        
        model = joblib.load(MODEL_PATH)
        le_location = joblib.load(LOCATION_ENCODER_PATH)
        le_furnishing = joblib.load(FURNISHING_ENCODER_PATH)
        
        with open(FEATURE_NAMES_PATH, 'r') as f:
            feature_names = json.load(f)
        
        return True, "Model loaded successfully"
    except Exception as e:
        return False, f"Error loading model: {str(e)}"

# Load model on startup
success, message = load_model()
if success:
    print(f"✅ {message}")
else:
    print(f"❌ {message}")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict property price based on input features"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        data = request.json
        
        # Extract features
        location = data.get('location')
        sq_ft = float(data.get('sq_ft', 0))
        age = int(data.get('age', 0))
        furnishing = data.get('furnishing')
        amenities_count = int(data.get('amenities_count', 0))
        bedrooms = int(data.get('bedrooms', 1))
        bathrooms = int(data.get('bathrooms', 1))
        
        # Validate inputs
        if not location or sq_ft <= 0:
            return jsonify({
                'error': 'Invalid input: location and sq_ft are required'
            }), 400
        
        # Encode categorical features
        try:
            location_encoded = le_location.transform([location])[0]
        except ValueError:
            return jsonify({
                'error': f'Unknown location: {location}. Available locations: {list(le_location.classes_)}'
            }), 400
        
        try:
            furnishing_encoded = le_furnishing.transform([furnishing])[0]
        except ValueError:
            return jsonify({
                'error': f'Unknown furnishing type: {furnishing}. Available: {list(le_furnishing.classes_)}'
            }), 400
        
        # Prepare feature array
        features = np.array([[
            location_encoded,
            sq_ft,
            age,
            furnishing_encoded,
            amenities_count,
            bedrooms,
            bathrooms
        ]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Get feature importance (if available)
        feature_importance = None
        if hasattr(model, 'feature_importances_'):
            feature_importance = {
                'location': float(model.feature_importances_[0]),
                'sq_ft': float(model.feature_importances_[1]),
                'age': float(model.feature_importances_[2]),
                'furnishing': float(model.feature_importances_[3]),
                'amenities_count': float(model.feature_importances_[4]),
                'bedrooms': float(model.feature_importances_[5]),
                'bathrooms': float(model.feature_importances_[6]),
            }
        
        return jsonify({
            'predicted_price': round(float(prediction), 2),
            'formatted_price': f"${prediction:,.2f}",
            'input_features': {
                'location': location,
                'sq_ft': sq_ft,
                'age': age,
                'furnishing': furnishing,
                'amenities_count': amenities_count,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms
            },
            'feature_importance': feature_importance
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Prediction error: {str(e)}'
        }), 500

@app.route('/locations', methods=['GET'])
def get_locations():
    """Get available locations"""
    if le_location is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'locations': list(le_location.classes_)
    })

@app.route('/furnishing-types', methods=['GET'])
def get_furnishing_types():
    """Get available furnishing types"""
    if le_furnishing is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'furnishing_types': list(le_furnishing.classes_)
    })

if __name__ == '__main__':
    print("🚀 Starting Real Estate Prediction API...")
    print("📡 API running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)

