"""Geospatial embedding utilities for house price prediction."""

import json
import os

import numpy as np
import pandas as pd

EARTH_RADIUS_KM = 6371.0
GEO_CONFIG_PATH = os.path.join("models", "geo_config.json")

# Chennai metro center (default study area)
DEFAULT_GEO_CONFIG = {
    "city": "Chennai",
    "center_lat": 13.0827,
    "center_lng": 80.2707,
}


def haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in kilometers."""
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return float(2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a)))


def build_geo_features(latitude, longitude, center_lat, center_lng):
    """
    Cyclical coordinate encoding + distance to city center.
  These act as lightweight geospatial embeddings for tabular ML models.
    """
    lat_rad = np.radians(float(latitude))
    lng_rad = np.radians(float(longitude))

    return {
        "sin_lat": float(np.sin(lat_rad)),
        "cos_lat": float(np.cos(lat_rad)),
        "sin_lng": float(np.sin(lng_rad)),
        "cos_lng": float(np.cos(lng_rad)),
        "dist_to_center_km": haversine_km(
            latitude, longitude, center_lat, center_lng
        ),
    }


def add_geo_features_to_dataframe(df, center_lat, center_lng):
    """Add geospatial embedding columns to a dataframe with latitude/longitude."""
    geo = df.apply(
        lambda row: build_geo_features(
            row["latitude"], row["longitude"], center_lat, center_lng
        ),
        axis=1,
        result_type="expand",
    )
    return pd.concat([df, geo], axis=1)


def save_geo_config(config, path=GEO_CONFIG_PATH):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(config, file, indent=2)


def load_geo_config(path=GEO_CONFIG_PATH):
    if not os.path.exists(path):
        return DEFAULT_GEO_CONFIG.copy()
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)
