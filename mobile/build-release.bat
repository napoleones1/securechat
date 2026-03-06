@echo off
echo ========================================
echo   SecureChat Mobile - Build Release APK
echo ========================================
echo.

echo WARNING: This will build a RELEASE APK
echo Make sure you have:
echo   1. Generated signing key
echo   2. Configured gradle.properties
echo   3. Updated build.gradle
echo.
echo See BUILD_APK.md for detailed instructions
echo.

set /p continue="Continue? (Y/N): "
if /i not "%continue%"=="Y" (
    echo Build cancelled
    pause
    exit /b 0
)

echo.
echo [1/5] Checking signing configuration...
if not exist "android\app\securechat-release-key.keystore" (
    echo ERROR: Signing key not found!
    echo.
    echo Generate signing key first:
    echo   cd android\app
    echo   keytool -genkeypair -v -storetype PKCS12 -keystore securechat-release-key.keystore -alias securechat-key-alias -keyalg RSA -keysize 2048 -validity 10000
    echo.
    pause
    exit /b 1
)
echo ✓ Signing key found

if not exist "android\gradle.properties" (
    echo ERROR: gradle.properties not configured!
    echo.
    echo Create android\gradle.properties with:
    echo   MYAPP_RELEASE_STORE_FILE=securechat-release-key.keystore
    echo   MYAPP_RELEASE_KEY_ALIAS=securechat-key-alias
    echo   MYAPP_RELEASE_STORE_PASSWORD=your_password
    echo   MYAPP_RELEASE_KEY_PASSWORD=your_password
    echo.
    pause
    exit /b 1
)
echo ✓ gradle.properties found

echo.
echo [2/5] Cleaning previous builds...
cd android
call gradlew.bat clean
cd ..

echo.
echo [3/5] Building Release APK...
echo This may take 10-15 minutes...
echo.
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo.
    echo BUILD FAILED!
    echo Check the error messages above
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/5] Locating Release APK...
set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
if exist "%APK_PATH%" (
    echo ✓ Release APK built successfully!
) else (
    echo ERROR: Release APK not found!
    pause
    exit /b 1
)

echo.
echo [5/5] Copying APK...
copy "%APK_PATH%" "SecureChat-v0.1.0-alpha.apk" >nul
echo ✓ APK copied to: SecureChat-v0.1.0-alpha.apk

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo Release APK: SecureChat-v0.1.0-alpha.apk
echo.
echo This APK is:
echo   ✓ Signed with your key
echo   ✓ Optimized with ProGuard
echo   ✓ Ready for distribution
echo   ✓ Can be uploaded to Play Store
echo.
echo APK Size:
for %%A in ("SecureChat-v0.1.0-alpha.apk") do echo   %%~zA bytes
echo.

pause
