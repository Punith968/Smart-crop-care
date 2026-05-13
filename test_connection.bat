@echo off
REM Flutter & Backend Connection Test Script for Windows

echo.
echo ============================================
echo  Flutter App Debugging - Connection Test
echo ============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python or activate venv first.
    exit /b 1
)

echo [1/3] Testing Backend Health...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Backend is running at http://localhost:8000
    for /f %%a in ('curl -s http://localhost:8000/health') do echo     Response: %%a
) else (
    echo [✗] Backend is NOT running or not accessible at http://localhost:8000
    echo.
    echo     FIX: Start the backend with:
    echo     $ cd app
    echo     $ python -m uvicorn application.main:app --reload --host 0.0.0.0 --port 8000
    goto :end_error
)

echo.
echo [2/3] Testing Authentication...
for /f "tokens=*" %%a in ('curl -s -X POST http://localhost:8000/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"username\":\"farmer\",\"password\":\"farmer123\"}" ^
    ^| findstr /R "access_token"') do (
    echo [✓] Authentication working
    echo     Response includes: %%a
)

if %errorlevel% neq 0 (
    echo [✗] Authentication failed
    echo     Check credentials: farmer / farmer123
)

echo.
echo [3/3] Flutter App Configuration...
echo [INFO] API URL Configuration (based on platform):
echo     - Android Emulator: http://10.0.2.2:8000
echo     - iOS Simulator: http://localhost:8000
echo     - Physical Device: http://^<YOUR_MACHINE_IP^>:8000
echo.
echo [INFO] To run Flutter app:
echo     $ cd flutter_app
echo     $ flutter run
echo.
echo [INFO] For physical device with custom API URL:
echo     $ flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8000
echo.

goto :end_success

:end_error
echo.
echo [✗] Connection test FAILED
echo Check DEBUG_GUIDE.md for detailed troubleshooting steps
pause
exit /b 1

:end_success
echo [✓] All checks passed! Ready to run Flutter app.
echo.
pause
