@echo off
echo ========================================
echo   SecureChat - Build APK (Final Steps)
echo ========================================
echo.

echo Status: 95%% Complete!
echo.
echo Yang sudah dilakukan:
echo   [x] Expo project created
echo   [x] Source code copied
echo   [x] Dependencies installed
echo   [x] You logged in to Expo (browser)
echo.
echo Tinggal 2 langkah terakhir!
echo.

echo ========================================
echo   Step 1: Login di Terminal
echo ========================================
echo.
echo Jalankan command ini:
echo   eas login
echo.
echo Masukkan email ^& password Expo Anda.
echo.

eas login

if errorlevel 1 (
    echo.
    echo ERROR: Login failed!
    echo Please try again.
    pause
    exit /b 1
)

echo.
echo ✓ Login successful!
echo.

echo ========================================
echo   Step 2: Configure Build
echo ========================================
echo.

eas build:configure

if errorlevel 1 (
    echo.
    echo ERROR: Configure failed!
    pause
    exit /b 1
)

echo.
echo ✓ Configuration complete!
echo.

echo ========================================
echo   Step 3: Build APK
echo ========================================
echo.
echo Building APK di cloud...
echo Ini akan memakan waktu 15-20 menit.
echo.
echo Jangan close terminal ini!
echo.

eas build --platform android --profile preview

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Expo akan memberikan link download APK.
echo Buka link tersebut dan download APK!
echo.
echo Kemudian:
echo   1. Transfer APK ke HP Android
echo   2. Install APK
echo   3. Test app!
echo.

pause
