# Complete Login Flow Testing Guide

## What Should Happen

When you click "Open dashboard" with credentials `farmer` / `farmer123`:

### Expected Console Output (in order):

```
[API:Login] Attempting login for username=farmer
[API] POST /auth/login to http://10.0.2.2:8000
[API] Response: 200
[API:Login] Login successful, token length=XX, user=farmer
[Auth #1] state updated: isLoading=true, isAuthenticated=false, hasUser=false
[Auth #1] state updated: isLoading=false, isAuthenticated=true, hasUser=true
[RouterRefresh] Auth state changed: isAuth=true, user=farmer
[AppRouter] Building router with auth state: isAuth=true, isLoading=false, user=farmer
[Router:Redirect] location=/login, isAuth=true, isLoading=false
[Router:Redirect] Authenticated, leaving auth page → redirecting to /
[GoRoute] Building / (dashboard) screen, isAuth=true
[LoginForm] ✓ Login API call succeeded
[LoginForm] Auth state after login: isAuth=true, user=farmer
[LoginForm] ✓ Login confirmed: user is authenticated
```

## If Something Goes Wrong

### Problem 1: "Connection refused" or "Connection timeout"

**Console shows:**
```
[API:Login] Attempting login for username=farmer
[API] POST /auth/login to http://10.0.2.2:8000
[API:Login] Login failed: SocketException: Connection refused
[LoginForm] ✗ Login error: SocketException
```

**Solution:**
1. Verify backend is running
2. Check you started it with: `python -m uvicorn app.application.main:app --reload`
3. Test: `curl http://localhost:8000/health`

---

### Problem 2: "Invalid username or password"

**Console shows:**
```
[API:Login] Attempting login for username=farmer
[API] POST /auth/login to http://10.0.2.2:8000
[API] Response: 401
[API:Login] Login failed: Invalid username or password
```

**Solution:**
1. Verify credentials are correct: `farmer` / `farmer123`
2. Check backend database was initialized (first login creates users)
3. Try registering a new account

---

### Problem 3: Login succeeds but returns to login page

**Console shows:**
```
[API:Login] Attempting login for username=farmer
[API] Response: 200
[API:Login] Login successful, token length=32, user=farmer
[Auth #1] state updated: isLoading=false, isAuthenticated=true, hasUser=true
[RouterRefresh] Auth state changed: isAuth=true, user=farmer
[AppRouter] Building router with auth state: isAuth=true, isLoading=false, user=farmer
[Router:Redirect] location=/login, isAuth=true, isLoading=false
[Router:Redirect] Authenticated, leaving auth page → redirecting to /
[GoRoute] Building / (dashboard) screen, isAuth=true

... BUT THEN ...

[Router:Redirect] location=/, isAuth=false, isLoading=false
[Router:Redirect] Not authenticated → redirecting from / to /login
```

**This means:** Auth state is being reset after login.

**Likely causes:**
1. Bootstrap running and clearing token (check `[Auth] _bootstrap:` logs)
2. getMe() call failing and clearing token
3. Token not being saved to SharedPreferences

**Check these logs:**
- Look for `[Auth] _bootstrap:` messages - if you see "getMe failed", token validation is failing
- Look for `[API:GetMe]` messages - should show token is present
- Look for `[Auth] state updated` to see when auth state changes

---

### Problem 4: Token seems to work but keeps asking to login

**Console shows:**
```
[Auth #1] _bootstrap: starting
[Auth #1] _bootstrap: no token found, setting isLoading=false
[Router:Redirect] Not authenticated → redirecting to /login
```

**Solution:**
1. App is not saving token properly
2. Try: `flutter clean && flutter pub get && flutter run`
3. Check SharedPreferences has proper permissions on device

---

## Complete Test Steps

### Step 1: Clean start
```bash
cd flutter_app
flutter clean
flutter pub get
```

### Step 2: Start backend
```bash
cd app
python -m uvicorn application.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Run with verbose logs
```bash
cd flutter_app
flutter run -v 2>&1 | tee login_test.log
```

### Step 4: Perform login
1. Wait for app to load
2. Enter: `farmer` / `farmer123`
3. Click "Open dashboard"
4. Watch logs

### Step 5: Analyze logs
Look for:
- ✅ `[API:Login] Login successful`
- ✅ `[Auth #1] state updated: ... isAuthenticated=true`
- ✅ `[Router:Redirect] Authenticated, leaving auth page → redirecting to /`
- ✅ `[GoRoute] Building / (dashboard) screen`
- ❌ NO redirects back to `/login` after that

---

## Export Logs for Analysis

If still failing, save logs:
```bash
flutter run -v 2>&1 | tee flutter_debug.log
# Then share flutter_debug.log
```

Look specifically for these sections:
- Everything starting with `[API:Login]`
- Everything starting with `[Auth #`
- Everything starting with `[Router`
- Everything starting with `[GoRoute]`
