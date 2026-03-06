@echo off
echo ========================================
echo   SecureChat Mobile - Quick Preview
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js installed

echo.
echo [2/5] Checking Android SDK...
adb version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Android SDK not found!
    echo Please install Android Studio and setup environment variables
    echo See: mobile/QUICK_START_PREVIEW.md
    pause
    exit /b 1
)
echo ✓ Android SDK found

echo.
echo [3/5] Checking if emulator or device is connected...
adb devices | findstr "device" >nul 2>&1
if errorlevel 1 (
    echo WARNING: No device/emulator detected!
    echo.
    echo Please:
    echo 1. Start Android Emulator from Android Studio, OR
    echo 2. Connect your Android phone via USB with USB Debugging enabled
    echo.
    pause
)

echo.
echo [4/5] Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [5/5] Starting mobile app...
echo.
echo ========================================
echo   IMPORTANT NOTES:
echo ========================================
echo 1. Make sure BACKEND is running on port 5000
echo 2. For emulator: API_URL should be http://10.0.2.2:5000/api
echo 3. For physical device: API_URL should be http://YOUR_IP:5000/api
echo 4. Check mobile/src/config/api.js for configuration
echo.
echo Starting in 3 seconds...
timeout /t 3 >nul

echo.
echo Running: npm run android
echo.
call npm run android

pause
