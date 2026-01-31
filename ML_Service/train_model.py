"""
Real Estate Price Prediction Model Training
Trains a machine learning model to predict property prices based on:
- Location (encoded)
- Square footage
- Age of property
- Furnishing status
- Number of amenities
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

def generate_sample_data(n_samples=1000):
    """Generate sample real estate data for training"""
    np.random.seed(42)
    
    locations = ['Downtown', 'Suburbs', 'Beachfront', 'City Center', 'Residential', 'Commercial']
    furnishing_types = ['Furnished', 'Semi-Furnished', 'Unfurnished']
    
    data = {
        'location': np.random.choice(locations, n_samples),
        'sq_ft': np.random.randint(500, 5000, n_samples),
        'age': np.random.randint(0, 50, n_samples),
        'furnishing': np.random.choice(furnishing_types, n_samples),
        'amenities_count': np.random.randint(0, 10, n_samples),
        'bedrooms': np.random.randint(1, 5, n_samples),
        'bathrooms': np.random.randint(1, 4, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Create realistic price based on features
    base_price = 100000
    location_multiplier = {
        'Downtown': 1.5,
        'Suburbs': 1.0,
        'Beachfront': 2.0,
        'City Center': 1.8,
        'Residential': 1.2,
        'Commercial': 1.3
    }
    
    furnishing_multiplier = {
        'Furnished': 1.2,
        'Semi-Furnished': 1.1,
        'Unfurnished': 1.0
    }
    
    df['price'] = (
        base_price * 
        df['location'].map(location_multiplier) *
        (df['sq_ft'] / 1000) *
        (1 - df['age'] * 0.01) *
        df['furnishing'].map(furnishing_multiplier) *
        (1 + df['amenities_count'] * 0.05) *
        (1 + df['bedrooms'] * 0.1) *
        (1 + df['bathrooms'] * 0.08) +
        np.random.normal(0, 20000, n_samples)  # Add noise
    )
    
    df['price'] = df['price'].clip(lower=50000)  # Minimum price
    
    return df

def train_model():
    """Train the ML model"""
    print("🏠 Real Estate Price Prediction Model Training")
    print("=" * 50)
    
    # Generate or load data
    print("\n📊 Generating sample data...")
    df = generate_sample_data(n_samples=2000)
    print(f"Generated {len(df)} property records")
    
    # Encode categorical variables
    print("\n🔧 Preprocessing data...")
    le_location = LabelEncoder()
    le_furnishing = LabelEncoder()
    
    df['location_encoded'] = le_location.fit_transform(df['location'])
    df['furnishing_encoded'] = le_furnishing.fit_transform(df['furnishing'])
    
    # Select features
    features = ['location_encoded', 'sq_ft', 'age', 'furnishing_encoded', 
                'amenities_count', 'bedrooms', 'bathrooms']
    X = df[features]
    y = df['price']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train model
    print("\n🤖 Training Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    print("\n📈 Evaluating model...")
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n✅ Model Performance:")
    print(f"   Mean Absolute Error: ${mae:,.2f}")
    print(f"   Root Mean Squared Error: ${rmse:,.2f}")
    print(f"   R² Score: {r2:.4f}")
    
    # Save model and encoders
    print("\n💾 Saving model...")
    os.makedirs('models', exist_ok=True)
    
    joblib.dump(model, 'models/property_price_model.pkl')
    joblib.dump(le_location, 'models/location_encoder.pkl')
    joblib.dump(le_furnishing, 'models/furnishing_encoder.pkl')
    
    # Save feature names
    import json
    with open('models/feature_names.json', 'w') as f:
        json.dump(features, f)
    
    print("✅ Model saved successfully!")
    print(f"\n📁 Model files saved in: {os.path.abspath('models')}")
    
    return model, le_location, le_furnishing

if __name__ == '__main__':
    train_model()




