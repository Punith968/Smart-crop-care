# 🌾 Farmer Crop Advisory - Quick Reference Guide

## What This Project Does

A complete agricultural advisory system that helps farmers by:
1. 🌱 Recommending best crops to grow
2. 🧪 Suggesting optimal fertilizers
3. 💰 Estimating costs and profits
4. 🦠 Detecting diseases from leaf photos
5. 📊 Generating detailed advisory reports

---

## Quick Start

### Run Backend (Python)
```bash
cd "farmer crop advisory"
python -m uvicorn app.application.main:app --reload --port 8000
```

### Run Mobile App (Flutter)
```bash
cd flutter_app
flutter pub get
flutter run
```

### Access Web App
```
Browser: http://localhost:8000
Login: farmer / farmer123
```

---

## 4 Main Models Explained Simply

### 1️⃣ Crop Recommendation
**What it does**: Tells you which crop to grow
**Inputs**: Soil nutrients (N,P,K), temperature, humidity, rainfall, pH
**Output**: Rice, Wheat, Corn, etc. with confidence
**How it works**: 
- Takes your farm data
- Compares with 2,300+ historical samples
- Uses 450 decision trees (RandomForest)
- Returns top 4 crops ranked by fit

### 2️⃣ Fertilizer Recommendation  
**What it does**: Recommends best fertilizer for crop
**Inputs**: Temperature, humidity, moisture, soil type, crop type, NPK levels
**Output**: Urea, DAP, NPK 10-26-26, etc.
**How it works**:
- Analyzes soil-crop combination
- Uses 500 expert trees (ExtraTrees)
- Considers nutrient ratios & balances
- Recommends specific fertilizer product

### 3️⃣ Cost & Profit Estimation
**What it does**: Calculates financial projections
**Inputs**: Crop name, soil type, land size (acres)
**Output**: 
- Total investment cost
- Expected revenue  
- Profit projection
- Profit margin %
**How it works**:
- Loads cost profile for crop
- Calculates all expenses (seed, fertilizer, labor, water)
- Estimates yield & market revenue
- Shows complete financial picture

### 4️⃣ Disease Detection
**What it does**: Identifies crop diseases from photos
**Inputs**: Leaf image + crop name
**Output**: Disease name, risk score, treatment steps
**How it works**:
- Analyzes leaf image (224×224 pixels)
- Uses deep learning (ResNet50 CNN)
- Detects 10 diseases
- Provides treatment recommendations

---

## File Locations

```
📁 Project Root
├── 📁 app/                          # Backend code
│   ├── crop_recommendation/         # Model 1
│   ├── fertilizers/                 # Model 2
│   ├── price_estimation/            # Model 3
│   ├── diseases_detection/          # Model 4
│   ├── application/main.py          # API server
│   └── web/static/                  # Web UI files
├── 📁 flutter_app/                  # Mobile app
├── 📁 models/                       # Trained AI models
└── PROJECT_COMPLETE_FLOW.md        # Complete documentation
```

---

## API Endpoints (Simplified)

### Login
```
POST /auth/login
Input: username, password
Output: access_token
```

### Get Single Crop Prediction
```
POST /predict/crop
Input: N, P, K, temperature, humidity, ph, rainfall
Output: recommended_crop
```

### Get Top 4 Crops
```
POST /predict/crop/top
Input: N, P, K, temperature, humidity, ph, rainfall
Output: [{crop: "rice", confidence: "87%"}, ...]
```

### Get Fertilizer
```
POST /predict/fertilizer
Input: temperature, humidity, moisture, soil_type, crop_type, N, P, K
Output: recommended_fertilizer
```

### Get Cost & Profit
```
POST /estimate/price
Input: crop_name, acres, soil_type
Output: {total_cost, revenue, profit, margin}
```

### Detect Disease
```
POST /detect/disease
Input: crop_name, image_path
Output: {disease, risk_score, treatment, confidence}
```

### Run Complete Advisory (All Models Together)
```
POST /workspace/advisory
Input: All parameters (crop, fertilizer, price, and more)
Output: {crop, fertilizer, price, summary}
```

---

## System Architecture (Simple View)

```
USERS (Web + Mobile)
        ↓
    FastAPI Server (Port 8000)
        ↓
    4 AI Models
        ├─→ Crop Model (RandomForest)
        ├─→ Fertilizer Model (ExtraTrees)
        ├─→ Cost Model (RandomForest)
        └─→ Disease Model (Deep Learning)
        ↓
    Databases & Files
        ├─→ CSV Data
        ├─→ Trained Models
        ├─→ Disease Images
        └─→ Reports
```

---

## Data Each Model Uses

### Model 1: Crop Recommendation
**Training Data**: 2,300+ crop samples
**Features Used**: 7 (N, P, K, temp, humidity, ph, rainfall)
**Engineered Features**: 7 more (ratios, interactions)
**Total Training Time**: ~2 minutes

### Model 2: Fertilizer
**Training Data**: 1,200+ fertilizer samples
**Features Used**: 8 (temp, humidity, moisture, soil, crop, N, P, K)
**Engineered Features**: 6 more (ratios, interactions)
**Total Training Time**: ~3 minutes

### Model 3: Cost Estimation
**Training Data**: 50 crop profiles + 2,000 synthetic variations
**Features Used**: 9 (crop, soil, acres, all costs, yield, price)
**Engineered Features**: 5 more (ratios, interactions)
**Total Training Time**: ~2 minutes

### Model 4: Disease Detection
**Training Data**: 10,000+ leaf images
**Features Used**: Image pixels (224×224 = 50,176 pixels)
**Classes**: 10 diseases + healthy
**Total Training Time**: ~15 minutes

---

## How Models Are Combined

When you click "Initiate Recommendation":

```
1. User fills form with farm data
         ↓
2. Backend receives POST /workspace/advisory
         ↓
3. Model 1 runs: Gets top crop (e.g., Rice)
         ↓
4. Model 2 runs: Gets fertilizer for Rice
         ↓
5. Model 3 runs: Gets cost/profit for Rice
         ↓
6. System generates summary:
   "Rice is best crop, use Urea fertilizer,
    expect profit of ₹6,874"
         ↓
7. Display results on screen
```

---

## Model Accuracy

| Model | Accuracy | Time to Predict |
|-------|----------|-----------------|
| Crop | 92% | <100ms |
| Fertilizer | 88% | <100ms |
| Cost | R²=0.89 | <100ms |
| Disease | 94% | <500ms |

---

## Input Examples

### Example 1: Rice Farmer
```
Nitrogen: 90 kg/acre
Phosphorus: 42 kg/acre
Potassium: 43 kg/acre
Temperature: 25°C
Humidity: 80%
pH: 6.5
Rainfall: 200mm
Soil Type: Loamy
Land: 2.5 acres
```
**Output**: 
- Crop: Rice (87% confident)
- Fertilizer: Urea
- Cost: ₹5,625
- Profit: ₹6,874
- Margin: 54.9%

### Example 2: Corn Farmer
```
Nitrogen: 100 kg/acre
Phosphorus: 50 kg/acre
Potassium: 50 kg/acre
Temperature: 28°C
Humidity: 70%
pH: 7.0
Rainfall: 150mm
Soil Type: Sandy
Land: 3 acres
```
**Output**:
- Crop: Corn (76% confident)
- Fertilizer: NPK 10-26-26
- Cost: ₹7,500
- Profit: ₹8,900
- Margin: 54.3%

---

## Common Issues & Fixes

### Issue: Backend won't start
**Fix**: Make sure port 8000 is free
```bash
# Check if port is in use
netstat -ano | findstr :8000
# If in use, kill process or change port
```

### Issue: Flutter app shows "Unknown" disease
**Fix**: Upload a leaf image - model needs image for prediction

### Issue: Login fails
**Fix**: Check credentials
- Default: farmer / farmer123
- Or register new account

### Issue: Models not found
**Fix**: Train models first
```bash
python -m app.train_all
```

---

## Feature Comparison: Static vs Dynamic

✅ **Fully Dynamic (Different output for different inputs)**:
- Crop Recommendation Model
- Fertilizer Recommendation Model

⚠️ **Needs Careful Use**:
- Disease Detection: Always says "Unknown" without image
- Cost Estimation: Unknown crops default to Rice

---

## Project Status

✅ **Working Features**:
- Crop recommendation
- Fertilizer suggestion
- Cost estimation
- Disease detection
- User authentication
- Report generation
- Web & mobile UI
- Dark mode

🔄 **In Development**:
- Real-time weather integration
- Mobile offline mode
- Advanced analytics

---

## Tech Stack Summary

```
Backend:      Python + FastAPI
Database:     CSV files
ML Models:    scikit-learn + TensorFlow
Web UI:       Vanilla JavaScript + CSS
Mobile:       Flutter + Riverpod
Deployment:   Uvicorn (Python)
```

---

## Next Steps

1. **Train Models** (one-time):
   ```bash
   python -m app.train_all
   ```

2. **Start Backend**:
   ```bash
   python -m uvicorn app.application.main:app --reload --port 8000
   ```

3. **Start Flutter App**:
   ```bash
   flutter run
   ```

4. **Login**:
   - Username: `farmer`
   - Password: `farmer123`

5. **Test Advisory**:
   - Enter farm parameters
   - Click "Initiate Recommendation"
   - See results instantly

---

## Key Numbers

- 📊 **4 AI Models**
- 🌾 **10+ Crops Supported**
- 🦠 **10 Diseases Detected**
- 📱 **2 Platforms** (Web + Mobile)
- ⚡ **<500ms** Average Prediction Time
- 🎯 **88-94%** Model Accuracy

---

## Complete Documentation

For detailed information, see: `PROJECT_COMPLETE_FLOW.md`
- Complete system architecture with Mermaid diagrams
- Detailed model architectures
- All API endpoints
- Deployment instructions
- Performance metrics
- Troubleshooting guide

---

**Version**: 2.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2024-05-04
