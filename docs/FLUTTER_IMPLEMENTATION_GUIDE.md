# Flutter App - Implementation Guide

This guide provides detailed instructions for implementing each screen in the Flutter app.

## Quick Setup

### 1. Install Flutter
```bash
# Check Flutter version
flutter --version
# Should be 3.0+

# Get dependencies
cd flutter_app
flutter pub get

# Generate code
flutter pub run build_runner build
```

### 2. Configure Backend URL
Edit `lib/config/router/app_router.dart` line 4:
```dart
const baseUrl = 'http://10.0.2.2:8000'; // Emulator
// OR
const baseUrl = 'http://192.168.1.X:8000'; // Physical device
```

### 3. Run the App
```bash
flutter run
```

---

## Screen Implementation Checklist

### ✅ **Phase 1: Authentication Screens** (Priority: HIGH)

#### **Login Screen** (`lib/screens/auth/login_screen.dart`)
**Purpose**: User login with email/password

**Components**:
- App logo/header
- Username/Email text field
- Password text field (obscured)
- "Remember me" checkbox
- "Login" button
- "Register" link
- Error message display
- Loading indicator

**Providers to Use**:
- `authNotifierProvider` - for login action
- Display errors from `authState.errorMessage`

**Implementation Steps**:
1. Create form with username & password fields
2. Add form validation (email format, password length)
3. Hook login button to `ref.read(authNotifierProvider.notifier).login(username, password)`
4. Show loading spinner during API call
5. Display error messages if login fails
6. Navigate to `/` on success

**API Endpoint**: `POST /auth/login`

---

#### **Register Screen** (`lib/screens/auth/register_screen.dart`)
**Purpose**: New user registration

**Components**:
- App logo
- Username text field
- Email text field
- Password text field
- Confirm password field
- Terms & conditions checkbox
- "Register" button
- "Already have account?" link

**Providers to Use**:
- `authNotifierProvider` - for registration

**Implementation Steps**:
1. Create form with validation
2. Validate password matching
3. Verify email format
4. Call `ref.read(authNotifierProvider.notifier).register(...)`
5. Show loading & error states
6. Navigate to `/` on success

**API Endpoint**: `POST /auth/register`

---

### 📊 **Phase 2: Home/Dashboard Screen** (Priority: HIGH)

#### **Dashboard Screen** (`lib/screens/home/dashboard_screen.dart`)
**Purpose**: Main hub with all advisory options

**Components**:
- Welcome message (personalized with user name)
- 4 main option cards:
  - Crop Recommendation
  - Fertilizer Advisory
  - Price Estimation
  - Disease Detection
- Quick reports card
- User greeting banner
- Bottom navigation bar

**Providers to Use**:
- `userProfileProvider` - show username
- `isAuthenticatedProvider` - check auth

**Implementation Steps**:
1. Display "Welcome, [Username]!" at top
2. Create 4 card buttons for each advisory type
3. Each card shows:
   - Icon
   - Title
   - Brief description
4. On card tap, navigate to respective screen
5. Add Reports quick access card
6. Add bottom navigation (Dashboard, Reports, Profile)
7. Add logout option in app bar

**Routes to Navigate**:
- Crop: `context.go('/crop-advisory')`
- Fertilizer: `context.go('/fertilizer-advisory')`
- Price: `context.go('/price-estimation')`
- Disease: `context.go('/disease-detection')`
- Reports: `context.go('/reports')`

---

### 🌾 **Phase 3: Advisory Screens** (Priority: HIGH)

#### **Crop Advisory Screen** (`lib/screens/home/crop_advisory_screen.dart`)
**Purpose**: Get crop recommendation based on soil & climate

**Input Form Fields**:
- Nitrogen (N) - double, slider (0-100)
- Phosphorus (P) - double, slider (0-100)
- Potassium (K) - double, slider (0-100)
- Temperature (°C) - double, slider (15-40)
- Humidity (%) - double, slider (20-100)
- pH - double, slider (4-9)
- Rainfall (mm) - double, slider (0-300)

**Output Display**:
- Recommended crop name (prominent)
- Confidence percentage (if available)
- Save as report option

**Implementation Steps**:
1. Create form with sliders for each input
2. Initialize with default values
3. Show real-time feedback as sliders move
4. "Get Recommendation" button calls API
5. Show loading spinner
6. Display result in card with large font
7. "Save Report" button saves recommendation
8. "Clear" button resets form

**State Provider**:
```dart
final cropAdvisoryProvider = FutureProvider((ref) async {
  // Call API
});
```

**API Endpoint**: `POST /predict/crop`

---

#### **Fertilizer Advisory Screen** (`lib/screens/home/fertilizer_advisory_screen.dart`)
**Purpose**: Get fertilizer recommendation

**Input Form Fields**:
- Temperature (°C) - slider
- Humidity (%) - slider
- Moisture (%) - slider
- Soil Type - dropdown (Sandy, Loam, Clay)
- Crop Type - dropdown (Rice, Wheat, Maize, etc.)
- Nitrogen (N) - slider
- Phosphorous (P) - slider
- Potassium (K) - slider

**Output Display**:
- Recommended fertilizer type
- Application instructions (if available)
- Confidence percentage

**Implementation Steps**:
Similar to Crop Advisory but with dropdown selectors for soil/crop types

**API Endpoint**: `POST /predict/fertilizer`

---

#### **Price Estimation Screen** (`lib/screens/home/price_estimation_screen.dart`)
**Purpose**: Estimate crop price based on quantity

**Input Form Fields**:
- Crop Name - dropdown (autocomplete from previous crops)
- Acres - text field or stepper

**Output Display**:
- Estimated total price
- Price per acre
- Currency indicator
- Market trend info (if available)

**Implementation Steps**:
1. Show crop dropdown (suggest previously selected crops)
2. Acres input with +/- buttons
3. Call API on input change or button press
4. Display result with currency formatting
5. Show breakdown (price × acres = total)

**API Endpoint**: `POST /estimate/price`

---

#### **Disease Detection Screen** (`lib/screens/home/disease_detection_screen.dart`)
**Purpose**: Detect crop disease from symptoms

**Input Form Fields**:
- Crop Type - dropdown
- Symptoms - text field (multi-line)
- Image - optional image picker (camera/gallery)

**Output Display**:
- Detected disease name
- Confidence percentage
- Treatment recommendations
- Prevention tips
- Severity indicator (if available)

**Implementation Steps**:
1. Crop type dropdown at top
2. Large text area for symptom description
3. Image picker button (optional)
4. Show selected image preview
5. "Diagnose" button sends request
6. Display disease info in expandable cards
7. Treatment & prevention in separate sections

**API Endpoint**: `POST /detect/disease`

---

### 📋 **Phase 4: Reports Screen** (Priority: MEDIUM)

#### **Reports Screen** (`lib/screens/home/reports_screen.dart`)
**Purpose**: View and manage saved reports

**Components**:
- Report list with pagination
- Each report shows:
  - Title
  - Type (advisory/disease)
  - Date created
  - Preview of recommendation
  - Download button
  - Delete button

**Implementation Steps**:
1. Load reports on screen load
2. Display as list tiles or cards
3. Each card has:
   - Report title (tap to view)
   - Type badge
   - Timestamp
   - Download icon
4. Download creates PDF/HTML
5. Swipe to delete (with confirmation)
6. Pull to refresh
7. Empty state when no reports

**Providers Needed**:
```dart
final reportsProvider = FutureProvider((ref) async {
  // Fetch user's reports
});
```

**API Endpoints**: 
- `GET /reports` - list reports
- `GET /reports/{id}/download` - download

---

### 👤 **Phase 5: Profile Screen** (Priority: MEDIUM)

#### **Profile Screen** (`lib/screens/home/profile_screen.dart`)
**Purpose**: View profile and app settings

**Components**:
- User avatar
- Username display
- Email display
- Member since date
- App version
- Theme toggle (light/dark)
- About section
- Logout button

**Implementation Steps**:
1. Display user info from `userProfileProvider`
2. Show avatar placeholder
3. Theme toggle switch
4. Settings options
5. Logout button with confirmation
6. Link to privacy policy (if available)

---

## Provider Architecture

### Create these additional providers:

```dart
// lib/providers/crop_advisor_provider.dart
final cropAdvisoryProvider = FutureProvider.family<
  CropResponse,
  CropRequest
>((ref, request) async {
  final api = ref.watch(apiServiceProvider);
  return api.predictCrop(request);
});

// lib/providers/fertilizer_advisor_provider.dart
final fertilizerAdvisoryProvider = FutureProvider.family<
  FertilizerResponse,
  FertilizerRequest
>((ref, request) async {
  final api = ref.watch(apiServiceProvider);
  return api.predictFertilizer(request);
});

// lib/providers/price_estimation_provider.dart
final priceEstimationProvider = FutureProvider.family<
  PriceResponse,
  PriceRequest
>((ref, request) async {
  final api = ref.watch(apiServiceProvider);
  return api.estimatePrice(request);
});

// lib/providers/disease_detection_provider.dart
final diseaseDetectionProvider = FutureProvider.family<
  DiseaseResponse,
  DiseaseRequest
>((ref, request) async {
  final api = ref.watch(apiServiceProvider);
  return api.detectDisease(request);
});

// lib/providers/reports_provider.dart
final reportsProvider = FutureProvider<ReportSummary>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final token = ref.watch(authTokenProvider);
  if (token == null) throw Exception('Not authenticated');
  return api.listReports(token);
});
```

---

## UI Components to Create

### Custom Widgets

**1. Slider Card Widget**
```dart
class SliderInputCard extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;
  // ...
}
```

**2. Result Card Widget**
```dart
class ResultCard extends StatelessWidget {
  final String title;
  final String value;
  final double? confidence;
  // ...
}
```

**3. Loading Overlay**
```dart
class LoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  // ...
}
```

**4. Error Alert**
```dart
class ErrorAlert extends StatelessWidget {
  final String message;
  final VoidCallback onDismiss;
  // ...
}
```

---

## Testing Checklist

- [ ] Test login/register with demo credentials
- [ ] Test each advisory screen with sample inputs
- [ ] Test image picker (crop detection)
- [ ] Test report saving and listing
- [ ] Test logout functionality
- [ ] Test error handling (invalid inputs)
- [ ] Test theme switching
- [ ] Test on physical device (IP configuration)
- [ ] Test offline mode (if implemented)
- [ ] Test loading states
- [ ] Test form validation

---

## Common Issues & Solutions

### Issue: "Connection refused"
**Solution**: Check backend is running and correct IP is set
```bash
# Terminal 1: Backend
cd app
uvicorn app.application.main:app --reload

# Terminal 2: Flutter
cd flutter_app
flutter run
```

### Issue: Image picker crashes
**Solution**: Add permissions to platform-specific files
- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/Runner/Info.plist`

### Issue: Form validation not working
**Solution**: Ensure TextField onChange updates state properly

### Issue: Reports not loading
**Solution**: Check token is being sent in Authorization header

---

## Next Steps After Implementation

1. **Unit Tests**: Create tests for each provider
2. **Widget Tests**: Test UI components
3. **Integration Tests**: Test full user flows
4. **Performance**: Profile app for memory/CPU usage
5. **Security**: Audit token storage and API calls
6. **Accessibility**: Test with screen readers
7. **Localization**: Add multi-language support

---

## Resources

- Flutter Docs: https://flutter.dev/docs
- Riverpod Docs: https://riverpod.dev
- Go Router: https://pub.dev/packages/go_router
- Material Design 3: https://m3.material.io
- Dio HTTP: https://pub.dev/packages/dio

