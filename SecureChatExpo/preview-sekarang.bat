@echo off
echo ========================================
echo   SecureChat - Preview App
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js tidak terinstall!
    echo Install dari: https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js terinstall

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo OK: Dependencies sudah terinstall
)

echo.
echo ========================================
echo   CARA PREVIEW:
echo ========================================
echo.
echo 1. Install "Expo Go" di HP Android
echo    (dari Google Play Store)
echo.
echo 2. Tunggu QR code muncul di terminal
echo.
echo 3. Buka Expo Go di HP
echo.
echo 4. Tap "Scan QR Code"
echo.
echo 5. Scan QR code dari terminal ini
echo.
echo 6. App akan langsung jalan!
echo.
echo ========================================
echo.

echo Starting Expo...
echo.
call npx expo start

pause
