"""
Multimodal-ready house price model training with geospatial embeddings.

Uses tabular features + sin/cos lat-lng encoding + distance-to-center
instead of categorical location labels.
"""

import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from geo_utils import (
    DEFAULT_GEO_CONFIG,
    build_geo_features,
    save_geo_config,
)

FURNISHING_TYPES = ["Furnished", "Semi-Furnished", "Unfurnished"]

# Chennai-area clusters with real coordinates for geospatial training
AREA_CLUSTERS = [
    {"name": "Anna Nagar", "lat": 13.0850, "lng": 80.2101, "multiplier": 1.55},
    {"name": "OMR / Sholinganallur", "lat": 12.9010, "lng": 80.2279, "multiplier": 1.75},
    {"name": "T Nagar", "lat": 13.0418, "lng": 80.2341, "multiplier": 1.65},
    {"name": "Velachery", "lat": 12.9750, "lng": 80.2206, "multiplier": 1.45},
    {"name": "Porur", "lat": 13.0358, "lng": 80.1562, "multiplier": 1.25},
    {"name": "Ambattur", "lat": 13.1143, "lng": 80.1548, "multiplier": 1.15},
]

FURNISHING_MULTIPLIER = {
    "Furnished": 1.2,
    "Semi-Furnished": 1.1,
    "Unfurnished": 1.0,
}

GEO_FEATURE_NAMES = [
    "sin_lat",
    "cos_lat",
    "sin_lng",
    "cos_lng",
    "dist_to_center_km",
]

TABULAR_FEATURE_NAMES = [
    "sq_ft",
    "age",
    "furnishing_encoded",
    "amenities_count",
    "bedrooms",
    "bathrooms",
]


def generate_sample_data(n_samples=2000, geo_config=None):
    """Generate synthetic property data with latitude/longitude coordinates."""
    geo_config = geo_config or DEFAULT_GEO_CONFIG
    np.random.seed(42)

    cluster_indices = np.random.randint(0, len(AREA_CLUSTERS), n_samples)
    furnishing = np.random.choice(FURNISHING_TYPES, n_samples)
    sq_ft = np.random.randint(500, 5000, n_samples)
    age = np.random.randint(0, 50, n_samples)
    amenities_count = np.random.randint(0, 10, n_samples)
    bedrooms = np.random.randint(1, 5, n_samples)
    bathrooms = np.random.randint(1, 4, n_samples)

    rows = []
    for i in range(n_samples):
        cluster = AREA_CLUSTERS[cluster_indices[i]]
        latitude = cluster["lat"] + np.random.normal(0, 0.012)
        longitude = cluster["lng"] + np.random.normal(0, 0.012)
        furnishing_value = furnishing[i]

        geo = build_geo_features(
            latitude,
            longitude,
            geo_config["center_lat"],
            geo_config["center_lng"],
        )

        base_price = 4_500_000
        price = (
            base_price
            * cluster["multiplier"]
            * (sq_ft[i] / 1000)
            * (1 - age[i] * 0.008)
            * FURNISHING_MULTIPLIER[furnishing_value]
            * (1 + amenities_count[i] * 0.04)
            * (1 + bedrooms[i] * 0.08)
            * (1 + bathrooms[i] * 0.06)
            * (1 + max(0, 12 - geo["dist_to_center_km"]) * 0.03)
            + np.random.normal(0, 250_000)
        )

        rows.append(
            {
                "location_name": cluster["name"],
                "latitude": round(latitude, 6),
                "longitude": round(longitude, 6),
                "sq_ft": int(sq_ft[i]),
                "age": int(age[i]),
                "furnishing": furnishing_value,
                "amenities_count": int(amenities_count[i]),
                "bedrooms": int(bedrooms[i]),
                "bathrooms": int(bathrooms[i]),
                **geo,
                "price": max(price, 1_500_000),
            }
        )

    return pd.DataFrame(rows)


def train_model():
    print("🏠 Multimodal House Price Model Training (Geospatial Embeddings)")
    print("=" * 60)

    geo_config = DEFAULT_GEO_CONFIG.copy()
    geo_config["areas"] = [
        {"name": area["name"], "lat": area["lat"], "lng": area["lng"]}
        for area in AREA_CLUSTERS
    ]

    print("\n📊 Generating geospatial sample data...")
    df = generate_sample_data(n_samples=2000, geo_config=geo_config)
    print(f"Generated {len(df)} property records across {len(AREA_CLUSTERS)} areas")

    print("\n🔧 Preprocessing data...")
    le_furnishing = LabelEncoder()
    df["furnishing_encoded"] = le_furnishing.fit_transform(df["furnishing"])

    feature_names = GEO_FEATURE_NAMES + TABULAR_FEATURE_NAMES
    X = df[feature_names]
    y = df["price"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    print(f"Geospatial features: {', '.join(GEO_FEATURE_NAMES)}")

    print("\n🤖 Training Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=18,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    print("\n📈 Evaluating model...")
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n✅ Model Performance:")
    print(f"   Mean Absolute Error: ₹{mae:,.2f}")
    print(f"   Root Mean Squared Error: ₹{rmse:,.2f}")
    print(f"   R² Score: {r2:.4f}")

    print("\n💾 Saving model...")
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/property_price_model.pkl")
    joblib.dump(le_furnishing, "models/furnishing_encoder.pkl")
    save_geo_config(geo_config)

    with open("models/feature_names.json", "w", encoding="utf-8") as file:
        json.dump(feature_names, file)

    with open("models/feature_labels.json", "w", encoding="utf-8") as file:
        json.dump(
            {
                "sin_lat": "Latitude (sin embedding)",
                "cos_lat": "Latitude (cos embedding)",
                "sin_lng": "Longitude (sin embedding)",
                "cos_lng": "Longitude (cos embedding)",
                "dist_to_center_km": "Distance to city center",
                "sq_ft": "Square footage",
                "age": "Property age",
                "furnishing_encoded": "Furnishing",
                "amenities_count": "Amenities",
                "bedrooms": "Bedrooms",
                "bathrooms": "Bathrooms",
            },
            file,
            indent=2,
        )

    print("✅ Model saved successfully!")
    print(f"📁 Model files saved in: {os.path.abspath('models')}")
    return model, le_furnishing, geo_config


if __name__ == "__main__":
    train_model()
