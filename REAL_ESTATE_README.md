# 🏠 Real Estate Price Prediction Project

AI-powered real estate price prediction system using Machine Learning. Predict property prices based on location, square footage, age, furnishing, amenities, and more.

## 🎯 Features

- **ML-Powered Predictions**: Uses Random Forest Regressor for accurate price predictions
- **Real-time API**: Fast prediction API with Flask backend
- **Modern UI**: Beautiful React frontend with intuitive form
- **Feature Importance**: Visual representation of which features matter most
- **Data Storage**: MongoDB integration to save predictions
- **Sample Data Generator**: Generate training data automatically

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- CSS3

### Backend
- Node.js + Express
- MongoDB + Mongoose

### Machine Learning
- Python 3.8+
- Flask (API)
- scikit-learn (Random Forest)
- pandas, numpy
- joblib (model persistence)

## 📋 Prerequisites

- Node.js (v16+)
- Python 3.8+
- MongoDB (Atlas or local)
- npm or yarn

## 🚀 Setup Instructions

### 1. Install Python Dependencies

```bash
cd ML_Service
pip3 install -r requirements.txt
```

**Note:** On macOS, use `pip3` instead of `pip`

Or create a virtual environment (recommended):

```bash
cd ML_Service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Train the ML Model

```bash
cd ML_Service
python3 train_model.py
```

**Note:** On macOS, use `python3` instead of `python`

This will:
- Generate sample training data (2000 properties)
- Train a Random Forest model
- Save the model to `models/` directory
- Display model performance metrics

**Expected Output:**
```
🏠 Real Estate Price Prediction Model Training
==================================================
📊 Generating sample data...
Generated 2000 property records
🔧 Preprocessing data...
Training set: 1600 samples
Test set: 400 samples
🤖 Training Random Forest model...
📈 Evaluating model...
✅ Model Performance:
   Mean Absolute Error: $XX,XXX.XX
   Root Mean Squared Error: $XX,XXX.XX
   R² Score: 0.XXXX
💾 Saving model...
✅ Model saved successfully!
```

### 3. Start the ML Service API

```bash
cd ML_Service
python3 prediction_api.py
```

**Note:** On macOS, use `python3` instead of `python`

The ML service will run on `http://localhost:5001`

**Endpoints:**
- `GET /health` - Check service status
- `POST /predict` - Get price prediction
- `GET /locations` - Get available locations
- `GET /furnishing-types` - Get furnishing types

### 4. Install Node.js Dependencies

```bash
npm install
```

### 5. Start the Backend Server

```bash
node Backend/server.cjs
```

The backend will run on `http://localhost:3000`

**Endpoints:**
- `POST /predict-price` - Predict price (calls ML service)
- `GET /properties` - Get saved predictions
- `GET /ml-service/health` - Check ML service status

### 6. Start the Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar Vite port)

## 📊 How It Works

### 1. Model Training
- Generates synthetic property data with realistic price relationships
- Features: location, sq_ft, age, furnishing, amenities, bedrooms, bathrooms
- Uses Random Forest Regressor (100 trees, max depth 15)
- Saves trained model and encoders for production use

### 2. Prediction Flow
```
User Input (Frontend)
    ↓
Backend API (Express)
    ↓
ML Service API (Flask)
    ↓
Trained Model (Random Forest)
    ↓
Prediction + Feature Importance
    ↓
Save to MongoDB
    ↓
Display Results (Frontend)
```

### 3. Features Used for Prediction

| Feature | Type | Description |
|---------|------|-------------|
| Location | Categorical | Property location (Downtown, Suburbs, Beachfront, etc.) |
| Square Footage | Numerical | Size of property in sq ft |
| Age | Numerical | Age of property in years |
| Furnishing | Categorical | Furnished, Semi-Furnished, Unfurnished |
| Amenities Count | Numerical | Number of amenities (0-20) |
| Bedrooms | Numerical | Number of bedrooms |
| Bathrooms | Numerical | Number of bathrooms |

## 🎨 Usage

1. **Open the frontend** in your browser
2. **Fill in the property details**:
   - Select location
   - Enter square footage
   - Enter property age
   - Select furnishing type
   - Enter number of bedrooms, bathrooms, and amenities
3. **Click "Predict Price"**
4. **View results**:
   - Predicted price in formatted currency
   - Feature importance visualization
   - Input summary

## 📁 Project Structure

```
selflearning/
├── Backend/
│   └── server.cjs              # Express backend with property endpoints
├── ML_Service/
│   ├── train_model.py          # Model training script
│   ├── prediction_api.py       # Flask ML API
│   ├── requirements.txt        # Python dependencies
│   └── models/                 # Saved models (generated)
│       ├── property_price_model.pkl
│       ├── location_encoder.pkl
│       ├── furnishing_encoder.pkl
│       └── feature_names.json
├── src/
│   ├── App.jsx                 # Main app component
│   ├── RealEstatePredictor.jsx # Prediction UI component
│   └── RealEstatePredictor.css # Styling
└── REAL_ESTATE_README.md       # This file
```

## 🔧 Customization

### Add Real Data

Replace the sample data generator in `train_model.py` with your actual property data:

```python
# Load from CSV
df = pd.read_csv('your_property_data.csv')

# Or load from MongoDB
# Connect to MongoDB and fetch property data
```

### Improve Model

- Add more features (parking, nearby schools, etc.)
- Try different algorithms (XGBoost, Neural Networks)
- Tune hyperparameters
- Use more training data

### Add More Locations

Modify the `generate_sample_data()` function in `train_model.py`:

```python
locations = ['Downtown', 'Suburbs', 'Beachfront', 'Your Location', ...]
```

## 🐛 Troubleshooting

### ML Service Not Starting
- Check if port 5001 is available (port 5000 is often used by AirPlay on macOS)
- Ensure all Python dependencies are installed
- Verify model files exist in `ML_Service/models/`

### Backend Can't Connect to ML Service
- Ensure ML service is running on port 5001
- Check CORS settings
- Verify network connectivity

### Predictions Not Working
- Train the model first (`python train_model.py`)
- Check that model files are in `models/` directory
- Verify input data format matches expected schema

## 📈 Model Performance

The model uses Random Forest which typically achieves:
- **R² Score**: > 0.85 (85% variance explained)
- **Mean Absolute Error**: ~$15,000-25,000
- **Training Time**: < 30 seconds for 2000 samples

## 🚀 Next Steps

1. **Collect Real Data**: Replace synthetic data with actual property listings
2. **Feature Engineering**: Add more relevant features
3. **Model Optimization**: Tune hyperparameters, try ensemble methods
4. **Deployment**: Deploy to cloud (AWS, Heroku, etc.)
5. **Real-time Updates**: Add data collection pipeline
6. **Visualizations**: Add charts and graphs for better insights

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

---

**Happy Predicting! 🏠💰**

