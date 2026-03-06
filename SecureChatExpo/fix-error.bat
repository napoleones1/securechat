@echo off
echo ========================================
echo   Fix "Something went wrong" Error
echo ========================================
echo.

echo [1/5] Stopping Expo (if running)...
taskkill /F /IM node.exe >nul 2>&1
echo OK

echo.
echo [2/5] Clearing Expo cache...
if exist ".expo" (
    rmdir /s /q .expo
    echo OK: Cache cleared
)

echo.
echo [3/5] Removing old dependencies...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo OK: node_modules removed
)
if exist "package-lock.json" (
    del package-lock.json
    echo OK: package-lock removed
)

echo.
echo [4/5] Installing fresh dependencies...
echo This will take 2-5 minutes...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Install failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Starting Expo...
echo.
echo ========================================
echo   INSTRUCTIONS:
echo ========================================
echo 1. Wait for QR code to appear
echo 2. Open Expo Go on your phone
echo 3. Tap "Scan QR Code"
echo 4. Scan the QR code below
echo 5. App should load successfully!
echo.
echo If still error, press Ctrl+C and check terminal for error details
echo ========================================
echo.

call npx expo start --clear

pause
