@echo off
echo ========================================
echo   SecureChat Expo - Build APK
echo ========================================
echo.

echo Project sudah di-setup 90%!
echo.
echo Yang sudah dilakukan:
echo   ✓ Expo project created
echo   ✓ Source code copied
echo   ✓ Dependencies installed
echo   ✓ EAS CLI installed
echo.
echo Yang perlu Anda lakukan:
echo.

echo [Step 1] Login ke Expo
echo.
echo Jika belum punya account:
echo   1. Buka https://expo.dev
echo   2. Sign up (gratis)
echo   3. Verify email
echo.
echo Kemudian login:
echo   eas login
echo.
pause

echo.
echo [Step 2] Configure EAS Build
echo.
eas build:configure
echo.

echo.
echo [Step 3] Build APK
echo.
echo Building APK di cloud...
echo Ini akan memakan waktu 10-20 menit.
echo.
eas build --platform android --profile preview
echo.

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Expo akan memberikan link download APK.
echo Buka link tersebut dan download APK!
echo.
echo APK siap di-install ke HP Android.
echo.

pause
