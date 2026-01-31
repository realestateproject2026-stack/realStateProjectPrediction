# 🚀 Quick Start Guide

## Step-by-Step Setup

### 1. Install Python Dependencies
```bash
cd ML_Service
pip3 install -r requirements.txt
```
**Note:** On macOS, use `pip3` instead of `pip`

### 2. Train the Model (First Time Only)
```bash
cd ML_Service
python3 train_model.py
```

### 3. Start All Services

**Terminal 1 - ML Service:**
```bash
cd ML_Service
python3 prediction_api.py
```
✅ Should see: "🚀 Starting Real Estate Prediction API..."

**Terminal 2 - Backend:**
```bash
node Backend/server.cjs
```
✅ Should see: "Server is running on port 3000"

**Terminal 3 - Frontend:**
```bash
npm run dev
```
✅ Should see: "Local: http://localhost:5173"

### 4. Open Browser
Navigate to the frontend URL (usually http://localhost:5173)

### 5. Test Prediction
1. Fill in property details
2. Click "Predict Price"
3. View the predicted price!

## ⚠️ Important Notes

- **Node.js Version**: Ensure you're using Node.js 18+ (for native `fetch` support)
- **Python Version**: Python 3.8+ required
- **Ports**: 
  - ML Service: 5001
  - Backend: 3000
  - Frontend: 5173 (or similar)

## 🐛 Troubleshooting

**ML Service won't start?**
- Check if port 5001 is in use
- Make sure you trained the model first

**Backend can't connect to ML?**
- Ensure ML service is running on port 5001
- Check the ML service health: http://localhost:5001/health

**Frontend shows errors?**
- Check browser console
- Ensure both backend and ML service are running

