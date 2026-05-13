# Farmer Crop Advisory - Modular ML Application

This project has been cleaned and reorganized into a proper application structure with separate modules:
- crop recommendation
- fertilization suggestion
- cost estimation
- diseases detection

## Project Paths

**Project Root:** `C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory`

- **API app:** `app/application/main.py`
- **Web UI:** `http://localhost:8000/` (served by FastAPI)
- **Web static files:** `app/web/static/` (index.html, app.js, styles.css)
- **Crop module:** `app/crop_recommendation/`
- **Fertilizer module:** `app/fertilizers/`
- **Cost estimation module:** `app/price_estimation/`
- **Diseases detection module:** `app/diseases_detection/`
- **Shared paths/config:** `app/shared/paths.py`
- **Saved ML models:** `app/artifacts/`
- **Auth and report storage:** `app/storage/`
- **Flutter app:** `flutter_app/` with `pubspec.yaml`
- **Flutter guide:** `FLUTTER_IMPLEMENTATION_GUIDE.md`
- **PowerShell commands:** `POWERSHELL_COMMANDS.md`

## Datasets Used

- Crop: `models/crop_recommendation/crop_recommendation.csv`
- Crop reference: `models/crop_recommendation/crop_recommendation_reference.csv`
- Fertilizer: `models/fertilizers/fertilizer_recommendation.csv`
- Fertilizer reference: `models/fertilizers/fertilizer_reference_raw.csv`
- Cost estimation seed data: `models/cost_estimation/cost_estimation_seed.csv`
- Disease image manifest: `models/diseases_detection/disease_image_manifest.csv`

## Folder Structure

```text
farmer crop advisory/
├── app/
│   ├── application/
│   ├── crop_recommendation/
│   ├── fertilizers/
│   ├── price_estimation/
│   ├── diseases_detection/
│   └── shared/
├── extras/
│   └── flutter_client/
└── models/
    ├── crop_recommendation/
    ├── fertilizers/
    ├── cost_estimation/
    └── diseases_detection/
```

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FARMER CROP ADVISORY                         │
│                       System Architecture                           │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │   API Gateway / Server   │
                    │    (FastAPI on Port      │
                    │     8000 @ 127.0.0.1)   │
                    └────────────┬─────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
        ┌────────▼──────┐  ┌─────▼──────┐  ┌───▼──────────┐
        │    Web UI     │  │  Flutter   │  │  Mobile App  │
        │  (HTML/JS)    │  │  Desktop   │  │  (Android/   │
        │ localhost:    │  │  Client    │  │   iOS)       │
        │ 8000          │  │            │  │              │
        └────────┬──────┘  └─────┬──────┘  └───┬──────────┘
                 │               │               │
                 └───────────────┼───────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  FastAPI Backend Core   │
                    │  ┌────────────────────┐ │
                    │  │ Authentication     │ │
                    │  │ (JWT + Sessions)   │ │
                    │  └────────────────────┘ │
                    │  ┌────────────────────┐ │
                    │  │ Workspace Service  │ │
                    │  │ (Advisory/Disease) │ │
                    │  └────────────────────┘ │
                    │  ┌────────────────────┐ │
                    │  │ Report Generator   │ │
                    │  │ (PDF Export)       │ │
                    │  └────────────────────┘ │
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────┼──────────────────────┐
        │                        │                      │
        │         ┌──────────────▼─────────────┐        │
        │         │   ML Prediction Pipeline   │        │
        │         │                            │        │
        │         ├─ Crop Recommendation       │        │
        │         │  (RandomForest)            │        │
        │         ├─ Fertilizer Advisory       │        │
        │         │  (ExtraTrees)              │        │
        │         ├─ Cost Estimation           │        │
        │         │  (RandomForest Regressor)  │        │
        │         └─ Disease Detection         │        │
        │            (ResNet50 Transfer Learn) │        │
        │                                      │        │
        │         └─────────────┬──────────────┘        │
        │                       │                       │
        │     ┌─────────────────▼──────────────┐        │
        │     │  Local File Storage            │        │
        │     │  ├─ app/artifacts/             │        │
        │     │  │  ├─crop_pipeline.joblib    │        │
        │     │  │  ├─fertilizer_pipeline.    │        │
        │     │  │  │  joblib                 │        │
        │     │  │  └─cost_pipeline.joblib    │        │
        │     │  ├─ app/storage/               │        │
        │     │  │  ├─ users.json              │        │
        │     │  │  ├─ sessions.json           │        │
        │     │  │  └─ reports/                │        │
        │     │  └─ app/web/static/            │        │
        │     │     ├─ index.html              │        │
        │     │     ├─ app.js                  │        │
        │     │     └─ styles.css              │        │
        │     └────────────────────────────────┘        │
        │                                               │
        └───────────────────────────────────────────────┘
```

### Component Architecture

#### 1. **Client Layer**

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| **Web UI** | HTML/CSS/JavaScript | `app/web/static/` | Browser-based dashboard |
| **Flutter Web** | Flutter Web | `flutter_app/` | Web version of mobile app |
| **Flutter Mobile** | Flutter Native | `flutter_app/` | Android/iOS mobile app |
| **Flutter Desktop** | Flutter Desktop | `flutter_app/` | Windows/macOS/Linux app |

#### 2. **API Layer (FastAPI Backend)**

| Module | Endpoint | Purpose |
|--------|----------|---------|
| **Authentication** | `/auth/*` | Login, register, session management |
| **Crop Advisory** | `/predict/crop` | Crop recommendation |
| **Fertilizer Advisory** | `/predict/fertilizer` | Fertilizer recommendations |
| **Price Estimation** | `/estimate/price` | Cost & revenue prediction |
| **Disease Detection** | `/detect/disease` | Disease identification from images |
| **Workspace** | `/workspace/*` | Integrated advisory workflows |
| **Reports** | `/reports/*` | Save & download analysis reports |
| **Health** | `/health` | API status check |

**File Location:** `app/application/main.py`  
**Runs On:** `http://127.0.0.1:8000` (Desktop) or `http://0.0.0.0:8000` (Network)

#### 3. **ML Pipeline Layer**

```
Input Features (NPK, Climate, Soil, Moisture)
        │
        ├─→ [Preprocessing] → Normalization & Encoding
        │
        ├─→ [Feature Engineering] → Interaction Features
        │
        ├─→ [Model Prediction]
        │   ├─ Crop: RandomForestClassifier (trained model)
        │   ├─ Fertilizer: ExtraTreesClassifier (trained model)
        │   ├─ Cost: RandomForestRegressor (trained model)
        │   └─ Disease: ResNet50 (transfer learning)
        │
        └─→ [Output] → Predictions + Confidence Scores
```

**Models Stored In:** `app/artifacts/`
- `crop_pipeline.joblib` (3MB+)
- `fertilizer_pipeline.joblib` (3MB+)
- `cost_pipeline.joblib` (2MB+)
- `disease_resnet50.keras` (optional, 100MB+)

#### 4. **Data Storage Layer**

| Storage Type | Location | Purpose |
|--------------|----------|---------|
| **User Credentials** | `app/storage/users.json` | Hashed passwords + user profiles |
| **Sessions** | `app/storage/sessions.json` | Active session tokens |
| **Reports** | `app/storage/reports/` | Generated analysis PDFs |
| **ML Models** | `app/artifacts/` | Trained pipeline pickles |
| **Datasets** | `models/*/` | Raw training data (CSVs) |

#### 5. **Authentication Flow**

```
1. User Login (Web/Mobile)
   └─→ POST /auth/login
       ├─ Username & Password
       └─→ Backend validates against users.json

2. Session Created
   └─→ Generate JWT Token (32-char URL-safe string)
       ├─ Store in sessions.json
       └─→ Return to client

3. Authenticated Requests
   └─→ Include: Authorization: Bearer <token>
       ├─ Backend validates token
       └─→ Allow/deny based on session

4. Logout
   └─→ POST /auth/logout
       ├─ Remove token from sessions.json
       └─→ Clear client storage
```

### Data Flow Example: Crop Recommendation

```
User Input (Web/Mobile)
├─ Nitrogen (N): 50
├─ Phosphorus (P): 40
├─ Potassium (K): 30
├─ Temperature: 25°C
├─ Humidity: 60%
├─ pH: 6.5
├─ Rainfall: 200mm
└─ Moisture: 70%
        │
        ▼
POST /predict/crop
        │
        ▼
FastAPI Receives Request
├─ Validates input data
└─ Calls CropRecommendationService
        │
        ▼
ML Pipeline (crop_pipeline.joblib)
├─ Load trained RandomForestClassifier
├─ Engineer features (NPK balance, climate indices)
├─ Make prediction
└─ Calculate confidence score
        │
        ▼
Return Response
├─ Recommended Crop: "Rice"
├─ Confidence: 0.94 (94%)
└─ Alternative Crops: ["Wheat", "Corn"]
        │
        ▼
Display on UI (Web/Mobile)
```

### Integration Architecture

```
                    ┌─────────────────────┐
                    │   End User (Web)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Browser/Flutter    │
                    │   Client Library    │
                    │  (HTTP + JSON)      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   FastAPI Server    │
                    │   (Port 8000)       │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
    │ Auth Svc  │      │ Predict Svc │     │ Report Svc  │
    │ (JWT)     │      │ (ML)        │     │ (PDF Gen)   │
    └─────┬─────┘      └──────┬──────┘     └──────┬──────┘
          │                    │                    │
    ┌─────▼──────────┐  ┌─────▼──────────┐  ┌─────▼──────────┐
    │ users.json     │  │ ML Models      │  │ ReportLab Lib  │
    │ sessions.json  │  │ joblib files   │  │ PDF Output     │
    └────────────────┘  └────────────────┘  └────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | FastAPI + Python 3.8+ | REST API server |
| **ML/Data** | scikit-learn, joblib | Model training & inference |
| **Image Processing** | TensorFlow/Keras | Disease detection (ResNet50) |
| **Web Frontend** | HTML5, JavaScript, CSS3 | Dashboard UI |
| **Mobile** | Flutter/Dart | Cross-platform mobile app |
| **State Management** | Riverpod | Flutter state management |
| **Routing** | GoRouter | Flutter navigation |
| **HTTP Client** | http package | API communication |
| **Storage** | JSON files + local FS | User data & models |
| **Report Gen** | ReportLab | PDF export |
| **Server** | Uvicorn | ASGI server |

### Deployment Architecture

```
Development:
  User Machine
  ├─ Backend (Uvicorn on 127.0.0.1:8000)
  ├─ Web UI (served by FastAPI)
  └─ Flutter App (local device/emulator)

Production Ready:
  Cloud Server (AWS/GCP/Azure)
  ├─ FastAPI on 0.0.0.0:8000
  ├─ SSL/TLS Certificate
  ├─ Database (optional PostgreSQL)
  ├─ Nginx Reverse Proxy
  ├─ Docker Container
  └─ Load Balancer (for scale)
```

### Request/Response Flow

```
Frontend          │  Network       │  Backend
                  │                │
1. User Action    │                │
   (click button) │                │
   ↓              │                │
2. Form Data      │                │
   Gathered       │                │
   ↓              │                │
3. HTTP Request   │────────────────→│ Parse Request
   + Auth Header  │                │ Validate Token
   ↓              │                │ ↓
4. Wait...        │                │ Load ML Model
                  │                │ Make Prediction
                  │                │ Format Response
                  │                │ ↓
5. HTTP Response  │←────────────────│ JSON Payload
   200 OK         │                │
   ↓              │                │
6. Parse JSON     │                │
   ↓              │                │
7. Update UI      │                │
   Display Result │                │
```



> ⚠️ **IMPORTANT**: All commands below work **ONLY in PowerShell** on Windows. Do NOT use WSL or Git Bash.
>
> **Project Location:** `C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory`

### Prerequisites

1. **Python 3.8+** installed and in PATH
2. **Flutter SDK** installed and in PATH (optional, if using Flutter app)
3. **Node.js** (optional, if needed for frontend development)
4. Virtual environment activated

### 1) Setup - First Time

#### Navigate to Project
```powershell
cd "C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory"
```

#### Activate Virtual Environment (PowerShell)
```powershell
.\.venv\Scripts\Activate.ps1
```

#### Install dependencies
```powershell
pip install -r requirements.txt
```

#### Deactivate Virtual Environment (when done)
```powershell
deactivate
```

### 2) Train ML pipelines

```powershell
python -m app.train_all
```

This produces model artifacts in:
- `app/artifacts/crop_pipeline.joblib`
- `app/artifacts/fertilizer_pipeline.joblib`
- `app/artifacts/cost_pipeline.joblib`
- `app/artifacts/disease_resnet50.keras` once a disease image dataset and TensorFlow are available

### 3) Run the Backend (FastAPI Server) - PowerShell

**File Location:** `app/application/main.py`

**Full Path:** `C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory\app\application\main.py`

**Runs on:** `http://localhost:8000`

#### Option A: Direct Command
```powershell
# Make sure virtual environment is activated
python -m uvicorn app.application.main:app --reload --host 0.0.0.0 --port 8000
```

#### Option B: One-Liner
```powershell
.\.venv\Scripts\Activate.ps1; python -m uvicorn app.application.main:app --reload --host 0.0.0.0 --port 8000
```

**Access:**
- Web UI: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- API Schema: `http://localhost:8000/openapi.json`

### 4) Run the Web Frontend

**The web frontend is automatically served by the FastAPI backend** at `http://localhost:8000`

Once the backend is running, simply open:
```
http://localhost:8000
```

**Static Files Location:** `app/web/static/` (index.html, app.js, styles.css)

No separate web server needed!

### 5) Run the Flutter App - PowerShell

**Location:** `flutter_app/` 

**Full Path:** `C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory\flutter_app\`

**Config File:** `pubspec.yaml`

#### Mobile Device or Emulator
```powershell
cd flutter_app
flutter run
```

#### Web (Chrome)
```powershell
cd flutter_app
flutter run -d chrome
```

#### Build APK (Android)
```powershell
cd flutter_app
flutter build apk --release
```

#### Build iOS (Mac only)
```powershell
cd flutter_app
flutter build ios --release
```

### 6) Run Everything Together

**File Locations:**
- **Backend Main:** `app/application/main.py`
- **Flutter App:** `flutter_app/pubspec.yaml`
- **Web Frontend:** `app/web/static/`

Open separate PowerShell windows:

**Window 1 - Backend:**
```powershell
cd "C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory"
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.application.main:app --reload --host 0.0.0.0 --port 8000
```

**Window 2 - Flutter (optional):**
```powershell
cd "C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory\flutter_app"
flutter run
```

Then open browser to: `http://localhost:8000`

> 📌 Both web and Flutter app depend on the backend API at `http://localhost:8000/` unless you change the host or port.

### 7) Useful PowerShell Commands

#### Check FastAPI Server Status
```powershell
# While backend is running
$response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing
$response.StatusCode  # Should return 200
```

#### Kill Process on Port 8000 (if stuck)
```powershell
# Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### List Connected Flutter Devices
```powershell
flutter devices
flutter emulators  # List available emulators
flutter emulators --launch <emulator_name>  # Start emulator
```

#### Clean and Rebuild Flutter
```powershell
cd flutter_app
flutter clean
flutter pub get
flutter run
```

#### Kill All Python/FastAPI Servers
```powershell
taskkill /IM python.exe /F
taskkill /IM uvicorn.exe /F
```

#### Kill All Flutter/Dart Servers
```powershell
taskkill /IM dart.exe /F
taskkill /IM flutter.exe /F
```

## Endpoint Summary

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /predict/crop`
- `POST /predict/fertilizer`
- `POST /estimate/price`
- `POST /detect/disease`
- `POST /workspace/advisory`
- `POST /workspace/disease`
- `POST /reports/save`
- `GET /reports`
- `GET /reports/{report_id}/download`
- `GET /health`

## Model Notes

- Crop recommendation uses a `RandomForestClassifier` with engineered NPK and climate interaction features.
- Fertilizer suggestion uses an `ExtraTreesClassifier` with nutrient-balance and soil-crop interaction features.
- Cost estimation uses a `RandomForestRegressor` trained from a structured seed CSV that is expanded into scenario samples.
- Disease detection is scaffolded as a transfer-learning pipeline using `ResNet50`; add real leaf images to the disease manifest before training.

## Web App Features

- A FastAPI-served dashboard UI inspired by the reference `web-application/webapplcation` layout.
- Local authentication with stored credentials and session tokens.
- Advisory workspace for crop, fertilizer, and cost prediction in one flow.
- Disease diagnostics workspace with optional image upload preview.
- Report vault for saving generated reports inside the app and downloading them as HTML files.

## Demo Credentials

- Username: `farmer`
- Password: `farmer123`

## Flutter Mobile App (NEW)

A complete Flutter/Dart mobile application has been created with full feature parity to the web interface.

### Flutter App Location
- Full app: `flutter_app/` directory
- Complete setup with 15+ files, 2000+ lines of code
- Production-ready architecture

### Flutter App Features
✅ Authentication (login/register)
✅ Crop Recommendation with sliders
✅ Fertilizer Advisory with dropdowns
✅ Price Estimation calculator
✅ Disease Detection with image picker
✅ Reports management
✅ User profile & settings
✅ Material Design 3 theme
✅ Light & dark mode
✅ State management (Riverpod)
✅ Navigation (GoRouter)

### Quick Start - Flutter App
```bash
# Navigate to Flutter app
cd flutter_app

# Install dependencies
flutter pub get

# Generate code (Hive, Retrofit, etc.)
flutter pub run build_runner build

# Configure backend URL in lib/config/router/app_router.dart
# Android emulator: http://10.0.2.2:8000
# Physical device: http://<YOUR_PC_IP>:8000

# Run the app
flutter run
```

### Flutter Documentation
- **Main Guide**: `FLUTTER_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation
- **App README**: `flutter_app/README.md` - Flutter app documentation
- **Phase Analysis**: `PROJECT_PHASES_ANALYSIS.md` - Complete phase breakdown
- **Conversion Summary**: `FLUTTER_CONVERSION_SUMMARY.md` - Full conversion details

## Troubleshooting - PowerShell Commands

### "Cannot find python" or "No module named uvicorn"
- Make sure virtual environment is activated: `.\.venv\Scripts\Activate.ps1`
- Ensure you're in the project root directory: `cd "C:\Users\HP\OneDrive\Documents\mini project\farmer crop advisory"`
- Run: `pip install -r requirements.txt`

### Port 8000 already in use

Find and kill process on port 8000:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID_from_above> /F
```

Check running servers on common ports:
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5000
netstat -ano | findstr :8080
```

### Flutter device not found
```powershell
flutter devices  # List connected devices
flutter emulators  # List available emulators
flutter emulators --launch <emulator_name>  # Start emulator
```

### ModuleNotFoundError when running backend
- Ensure you're in the project root directory
- Ensure virtual environment is activated: `.\.venv\Scripts\Activate.ps1`
- Run: `pip install -r requirements.txt`

### Virtual Environment Issues

If virtual environment activation fails:
```powershell
# Check if .venv exists
ls .\.venv

# If not, create it
python -m venv .venv

# Then activate
.\.venv\Scripts\Activate.ps1
```

### Check Running Processes

Check Python and Dart processes:
```powershell
tasklist | findstr python
tasklist | findstr uvicorn
tasklist | findstr dart
```

### Flask API Service (Legacy)
The legacy `extras/flutter_client/api_service.dart` is superseded by the complete implementation in `flutter_app/lib/services/api_service.dart` with:
- Full error handling
- Logging & debugging
- All 15+ endpoints
- Request/response models
