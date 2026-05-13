# Farmer Crop Advisory - Flutter App

A comprehensive Flutter mobile application for the Farmer Crop Advisory system. Built with Flutter 3.0+ and Dart 3.0+.

## Project Structure

```
flutter_app/
├── lib/
│   ├── main.dart                           # App entry point
│   ├── models/
│   │   └── api_models.dart                 # All data models (request/response)
│   ├── services/
│   │   └── api_service.dart                # API client with full error handling
│   ├── providers/
│   │   └── auth_provider.dart              # Riverpod auth state management
│   ├── config/
│   │   ├── theme/
│   │   │   └── app_theme.dart              # Material theme & typography
│   │   └── router/
│   │       └── app_router.dart             # GoRouter navigation
│   └── screens/
│       ├── auth/
│       │   ├── login_screen.dart           # Login UI
│       │   └── register_screen.dart        # Registration UI
│       └── home/
│           ├── dashboard_screen.dart       # Main dashboard
│           ├── crop_advisory_screen.dart   # Crop prediction form
│           ├── fertilizer_advisory_screen.dart  # Fertilizer form
│           ├── price_estimation_screen.dart    # Price estimation form
│           ├── disease_detection_screen.dart   # Disease detection with image
│           ├── reports_screen.dart        # User reports & history
│           └── profile_screen.dart        # User profile & settings
├── pubspec.yaml                            # Dependencies & configuration
├── test/                                   # Unit & widget tests
└── README.md                               # This file
```

## Features

✅ **Authentication**
- User registration
- Login with JWT token storage
- Profile management
- Logout functionality

✅ **Advisory Modules**
- **Crop Recommendation**: NPK, temperature, humidity, pH, rainfall
- **Fertilizer Suggestion**: Soil type, crop type, nutrient levels
- **Price Estimation**: Crop name and acreage-based estimation
- **Disease Detection**: Symptoms + image-based detection

✅ **Workspace Integration**
- Combined advisory workspace (crop + fertilizer + price in one form)
- Disease detection workspace with image upload

✅ **Reports Management**
- Save prediction reports
- View report history
- Download reports as HTML/PDF

✅ **User Experience**
- Beautiful Material 3 UI
- Light & Dark theme support
- Loading states & error handling
- Image picker for disease detection
- Offline capability (cached responses)
- Smooth navigation with GoRouter

## Dependencies

### State Management & Architecture
- **riverpod** (2.5.1) - Modern state management
- **provider** (6.2.1) - Additional state management

### Networking
- **dio** (5.4.0) - Advanced HTTP client
- **http** (1.2.1) - Basic HTTP operations

### Persistence
- **shared_preferences** (2.2.2) - Key-value storage (auth tokens, user prefs)
- **hive** (2.2.3) - Fast, lightweight database for offline caching
- **sqflite** (2.3.0) - SQLite for complex data

### UI & Styling
- **google_fonts** (6.1.0) - Google Fonts integration
- **flutter_spinkit** (5.2.0) - Loading animations
- **lottie** (2.7.0) - Lottie animations
- **shimmer** (3.0.0) - Shimmer loading effects

### Media & Files
- **image_picker** (1.0.5) - Image selection from gallery/camera
- **permission_handler** (11.4.4) - Runtime permissions
- **cached_network_image** (3.3.1) - Image caching
- **pdf** (3.10.8) - PDF generation
- **printing** (5.11.0) - Print & share files

### Forms & Validation
- **formz** (0.7.0) - Form validation
- **flutter_form_builder** (9.1.1) - Advanced form handling

### Utilities
- **intl** (0.19.0) - Internationalization & date formatting
- **logger** (2.1.0) - Logging
- **go_router** (13.0.0) - Navigation & routing
- **connectivity_plus** (5.0.2) - Network connectivity detection

## Getting Started

### Prerequisites
- Flutter SDK 3.0+ installed
- Dart 3.0+ 
- Backend API running at `http://localhost:8000` (configurable)

### Installation

1. **Clone and navigate to Flutter app**
```bash
cd flutter_app
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Generate code (for Hive & Retrofit)**
```bash
flutter pub run build_runner build
```

4. **Configure API Base URL**
Create `.env` file in `flutter_app/`:
```env
API_BASE_URL=http://10.0.2.2:8000  # Android emulator
# Or for physical device
API_BASE_URL=http://192.168.1.100:8000
```

5. **Run the app**
```bash
flutter run
```

## API Configuration

### Android Emulator
```dart
const baseUrl = "http://10.0.2.2:8000";
```

### Physical Device
```dart
const baseUrl = "http://<YOUR_PC_IP>:8000";
```

## Authentication Flow

1. User taps "Register" or "Login"
2. Enters credentials
3. API returns JWT token
4. Token stored in SharedPreferences
5. Token added to all subsequent API requests (Authorization header)
6. On app startup, token auto-loads if exists

## State Management Architecture

### Riverpod Providers
```dart
// Auth
authNotifierProvider       // Main auth state
authTokenProvider          // Current auth token
userProfileProvider        // Current user profile
isAuthenticatedProvider    // Auth status

// API
apiServiceProvider        // API service instance
```

## Error Handling

All API calls use `ApiException` wrapper:

```dart
try {
  final result = await apiService.predictCrop(request);
} on ApiException catch (e) {
  showErrorSnackbar(context, e.message);
}
```

## Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests
```bash
flutter test integration_test/
```

### Test Coverage
```bash
flutter test --coverage
```

## Available Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |
| Dashboard | `/` | Main hub with all options |
| Crop Advisory | `/crop-advisory` | Crop recommendation |
| Fertilizer Advisory | `/fertilizer-advisory` | Fertilizer suggestion |
| Price Estimation | `/price-estimation` | Cost estimation |
| Disease Detection | `/disease-detection` | Disease diagnosis |
| Reports | `/reports` | Saved reports history |
| Profile | `/profile` | User settings & logout |

## Demo Credentials

```
Username: farmer
Password: farmer123
```

## Building for Release

### Android
```bash
flutter build apk --release
# Or AAB for Play Store
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Performance Optimization

- **Image Caching**: Automatic with CachedNetworkImage
- **Lazy Loading**: Reports paginated, images cached
- **State Persistence**: SharedPreferences for quick auth
- **Code Splitting**: Modular screen architecture

## Known Limitations & Future Enhancements

- [ ] Offline mode with full local database sync
- [ ] Real-time notifications for new reports
- [ ] Voice input for disease symptoms
- [ ] AR leaf detection for disease diagnosis
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Recommendation history graphs

## Troubleshooting

### "Connection refused" error
Ensure backend is running:
```bash
cd app
uvicorn app.application.main:app --reload
```

### Image picker not working
Check permissions in `AndroidManifest.xml` and `Info.plist`

### Hive database locked
Clear app data and rebuild:
```bash
flutter clean
flutter pub get
flutter run
```

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

## License

This project is part of the Farmer Crop Advisory system.

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation at `http://localhost:8000/docs`
3. Check Flutter logs: `flutter logs`
4. Enable verbose logging for API calls

---

**Last Updated**: 2024
**Flutter Version**: 3.0+
**Dart Version**: 3.0+
