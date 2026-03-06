@echo off
echo ========================================
echo   SecureChat Mobile - Setup Checker
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check Node.js
echo [1/6] Node.js:
node --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ NOT INSTALLED
    echo   → Install from: https://nodejs.org
) else (
    node --version
    echo   ✓ INSTALLED
)
echo.

REM Check npm
echo [2/6] npm:
npm --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ NOT INSTALLED
) else (
    npm --version
    echo   ✓ INSTALLED
)
echo.

REM Check Android SDK
echo [3/6] Android SDK (adb):
adb version >nul 2>&1
if errorlevel 1 (
    echo   ✗ NOT FOUND
    echo   → Install Android Studio
    echo   → Setup ANDROID_HOME environment variable
) else (
    adb version | findstr "Android"
    echo   ✓ INSTALLED
)
echo.

REM Check Java
echo [4/6] Java JDK:
java -version >nul 2>&1
if errorlevel 1 (
    echo   ✗ NOT INSTALLED
    echo   → Install JDK 11 or higher
) else (
    java -version 2>&1 | findstr "version"
    echo   ✓ INSTALLED
)
echo.

REM Check connected devices
echo [5/6] Connected Devices:
adb devices
echo.

REM Check backend
echo [6/6] Backend Server:
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo   ✗ NOT RUNNING
    echo   → Start backend: cd backend ^&^& npm start
) else (
    echo   ✓ RUNNING on http://localhost:5000
)
echo.

echo ========================================
echo   Configuration Check
echo ========================================
echo.

REM Check if node_modules exists
if exist "node_modules" (
    echo Dependencies: ✓ INSTALLED
) else (
    echo Dependencies: ✗ NOT INSTALLED
    echo → Run: npm install
)
echo.

REM Check API config
if exist "src\config\api.js" (
    echo API Config: ✓ EXISTS
    echo.
    echo Current configuration:
    findstr "API_URL" src\config\api.js
    findstr "SOCKET_URL" src\config\api.js
) else (
    echo API Config: ✗ NOT FOUND
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.
echo If all checks pass (✓), you can run:
echo   npm run android
echo.
echo If any check fails (✗), follow the instructions above.
echo.
echo For detailed setup guide, see:
echo   mobile/QUICK_START_PREVIEW.md
echo.

pause
