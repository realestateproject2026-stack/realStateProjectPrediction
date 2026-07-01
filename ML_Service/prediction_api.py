"""
Flask API for geospatial house price prediction.
"""

import json
import os

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from geo_utils import build_geo_features, load_geo_config

app = Flask(__name__)
CORS(app)

MODEL_PATH = "models/property_price_model.pkl"
FURNISHING_ENCODER_PATH = "models/furnishing_encoder.pkl"
FEATURE_NAMES_PATH = "models/feature_names.json"
FEATURE_LABELS_PATH = "models/feature_labels.json"

model = None
le_furnishing = None
feature_names = None
feature_labels = None
geo_config = None


def load_model():
    global model, le_furnishing, feature_names, feature_labels, geo_config

    try:
        if not os.path.exists(MODEL_PATH):
            return False, "Model not found. Please train the model first."

        model = joblib.load(MODEL_PATH)
        le_furnishing = joblib.load(FURNISHING_ENCODER_PATH)
        geo_config = load_geo_config()

        with open(FEATURE_NAMES_PATH, "r", encoding="utf-8") as file:
            feature_names = json.load(file)

        if "location_encoded" in feature_names:
            return (
                False,
                "Outdated model detected (location_encoded). Run: python3 train_model.py",
            )

        if not os.path.exists(os.path.join("models", "geo_config.json")):
            return (
                False,
                "Missing geo_config.json. Run: python3 train_model.py",
            )

        required_geo = {"sin_lat", "cos_lat", "sin_lng", "cos_lng", "dist_to_center_km"}
        if not required_geo.issubset(set(feature_names)):
            return (
                False,
                "Model missing geospatial features. Run: python3 train_model.py",
            )

        if os.path.exists(FEATURE_LABELS_PATH):
            with open(FEATURE_LABELS_PATH, "r", encoding="utf-8") as file:
                feature_labels = json.load(file)
        else:
            feature_labels = {name: name for name in feature_names}

        return True, "Model loaded successfully"
    except Exception as error:
        return False, f"Error loading model: {error}"


success, message = load_model()
if success:
    print(f"✅ {message}")
else:
    print(f"❌ {message}")


def build_feature_vector(data):
    latitude = float(data.get("latitude"))
    longitude = float(data.get("longitude"))
    sq_ft = float(data.get("sq_ft", 0))
    age = int(data.get("age", 0))
    furnishing = data.get("furnishing")
    amenities_count = int(data.get("amenities_count", 0))
    bedrooms = int(data.get("bedrooms", 1))
    bathrooms = int(data.get("bathrooms", 1))

    if sq_ft <= 0:
        raise ValueError("sq_ft must be greater than 0")

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise ValueError("latitude/longitude are out of range")

    geo_features = build_geo_features(
        latitude,
        longitude,
        geo_config["center_lat"],
        geo_config["center_lng"],
    )

    try:
        furnishing_encoded = le_furnishing.transform([furnishing])[0]
    except ValueError as error:
        raise ValueError(
            f"Unknown furnishing type: {furnishing}. Available: {list(le_furnishing.classes_)}"
        ) from error

    values = {
        **geo_features,
        "sq_ft": sq_ft,
        "age": age,
        "furnishing_encoded": furnishing_encoded,
        "amenities_count": amenities_count,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
    }

    vector = np.array([[values[name] for name in feature_names]])
    return vector, values, geo_features, furnishing_encoded


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "healthy",
            "model_loaded": model is not None,
            "model_type": "geospatial_multimodal_phase1",
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Please train the model first."}), 500

    try:
        data = request.json
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        if latitude is None or longitude is None:
            return jsonify(
                {"error": "latitude and longitude are required for geospatial prediction"}
            ), 400

        features, raw_values, geo_features, furnishing_encoded = build_feature_vector(data)
        prediction = model.predict(features)[0]

        feature_importance = None
        if hasattr(model, "feature_importances_"):
            feature_importance = {
                feature_labels.get(name, name): float(score)
                for name, score in zip(feature_names, model.feature_importances_)
            }

        location_name = data.get("location_name") or data.get("location") or "Selected on map"

        return jsonify(
            {
                "predicted_price": round(float(prediction), 2),
                "formatted_price": f"₹{prediction:,.2f}",
                "input_features": {
                    "location_name": location_name,
                    "latitude": float(latitude),
                    "longitude": float(longitude),
                    "sq_ft": raw_values["sq_ft"],
                    "age": raw_values["age"],
                    "furnishing": data.get("furnishing"),
                    "amenities_count": raw_values["amenities_count"],
                    "bedrooms": raw_values["bedrooms"],
                    "bathrooms": raw_values["bathrooms"],
                },
                "geo_embedding": geo_features,
                "feature_importance": feature_importance,
            }
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": f"Prediction error: {error}"}), 500


@app.route("/geo-config", methods=["GET"])
def get_geo_config():
    if geo_config is None:
        return jsonify({"error": "Model not loaded"}), 500

    return jsonify(geo_config)


@app.route("/furnishing-types", methods=["GET"])
def get_furnishing_types():
    if le_furnishing is None:
        return jsonify({"error": "Model not loaded"}), 500

    return jsonify({"furnishing_types": list(le_furnishing.classes_)})


# Backward-compatible alias
@app.route("/locations", methods=["GET"])
def get_locations():
    if geo_config is None:
        return jsonify({"error": "Model not loaded"}), 500

    areas = geo_config.get("areas", [])
    return jsonify(
        {
            "locations": [area["name"] for area in areas],
            "areas": areas,
            "center": {
                "lat": geo_config["center_lat"],
                "lng": geo_config["center_lng"],
            },
            "city": geo_config.get("city", "Chennai"),
        }
    )


if __name__ == "__main__":
    print("🚀 Starting Geospatial House Price Prediction API...")
    print("📡 API running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
