# Flutter App Debug Guide - Dashboard Navigation Issue

## Issues Found & Fixed ✅

### 1. **Logout Navigation (FIXED)**
- **Problem**: Logout was using Flutter's `Navigator` instead of `GoRouter`, breaking navigation state
- **File**: `flutter_app/lib/screens/home/dashboard_screen.dart:51`
- **Fix**: Changed from `Navigator.of(context).popUntil(...)` to `GoRouter.of(context).go('/login')`

### 2. **Router Debugging (FIXED)**
- **File**: `flutter_app/lib/config/router/app_router.dart`
- **Fix**: Added enhanced debug logging to track redirect decisions

---

## Troubleshooting Steps

### **Step 1: Verify Backend is Running**

Run the backend API on port 8000:

```bash
cd "c:/Users/HP/OneDrive/Documents/mini project/farmer crop advisory"

# If using Windows, activate venv:
.venv\Scripts\activate

# Start the API server
python -m uvicorn app.application.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### **Step 2: Test API Connection**

Open another terminal and test the health endpoint:

```bash
# Windows PowerShell
curl http://localhost:8000/health

# Expected response:
# {"status":"ok"}
```

Test login endpoint:

```bash
curl -X POST http://localhost:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"farmer","password":"farmer123"}'
```

**Expected response:**
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "username": "farmer",
    "full_name": "Farmer Demo",
    "created_at": "2024-..."
  }
}
```

### **Step 3: Check Flutter App Configuration**

The Flutter app will use these URLs based on the platform:

- **Android Emulator**: `http://10.0.2.2:8000` (special alias to host machine)
- **iOS Simulator / macOS**: `http://localhost:8000`
- **Physical Device**: You must set `API_BASE_URL` environment variable

**Run Flutter app with custom API URL:**

```bash
cd flutter_app

# For Android Emulator (already default)
flutter run

# For physical device (change IP to your machine's IP)
flutter run --dart-define=API_BASE_URL=http://192.168.X.X:8000
```

### **Step 4: Monitor Debug Output**

When running the Flutter app, watch for these debug messages:

**Expected successful login flow:**
```
[API] POST /auth/login to http://10.0.2.2:8000
[API] Response: 200
[LoginForm] ✓ Login API call completed
[Auth #1] state updated: isLoading=false, isAuthenticated=true, hasUser=true
[Router] location=/login, isAuth=true, isLoading=false, user=farmer
[Router] Authenticated user, redirecting from auth screen /login to /
[LoginForm] ✓ User authenticated, navigating to /
```

**Problem: Login fails or token not saved**
```
[API] Error on POST /auth/login: SocketException: Connection refused
[LoginForm] ✗ Login error: Connection refused
```

**Problem: Auth state not updating**
```
[Auth #1] state updated: isLoading=false, isAuthenticated=false
[Router] location=/login, isAuth=false, isLoading=false, user=null
[Router] Not authenticated, redirecting to /login
```

---

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Backend not running | Start backend with `python -m uvicorn app.application.main:app --reload` |
| Wrong API URL | Device type mismatch | Set `API_BASE_URL` for physical devices |
| Token lost after login | SharedPreferences not saving | Check device storage permissions |
| Redirect loop (login → dashboard → login) | Auth state not persisting | Clear app data and reinstall |
| "Session expired" on dashboard | Token not sent with requests | Check `Authorization: Bearer <token>` header in logs |

---

## Quick Test Credentials

```
Username: farmer
Password: farmer123

Username: admin
Password: admin123
```

---

## If Still Having Issues

1. **Clear Flutter app cache:**
   ```bash
   cd flutter_app
   flutter clean
   flutter pub get
   flutter run
   ```

2. **Check logs for "Timeout":**
   - Increase timeout if backend is slow
   - File: `flutter_app/lib/services/api_service.dart` line 38 & 58

3. **Enable verbose logging:**
   ```bash
   flutter run -v 2>&1 | grep -E "\[Router\]|\[Auth\]|\[API\]|\[LoginForm\]"
   ```

4. **Test with physical device:**
   - Change API URL to your machine's IP: `http://192.168.1.100:8000`
   - Ensure backend is bound to `0.0.0.0` port `8000`
