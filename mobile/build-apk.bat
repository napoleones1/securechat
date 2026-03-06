@echo off
echo ========================================
echo   SecureChat Mobile - Build APK
echo ========================================
echo.

echo [1/7] Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js installed

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java JDK not installed!
    echo Please install Java JDK 11 or higher
    pause
    exit /b 1
)
echo ✓ Java JDK installed

REM Check Android SDK
if not exist "android\gradlew.bat" (
    echo ERROR: Android project not found!
    echo Make sure you're in the mobile directory
    pause
    exit /b 1
)
echo ✓ Android project found

echo.
echo [2/7] Checking configuration...
echo.

REM Check API config
if exist "src\config\api.js" (
    echo Current API configuration:
    findstr "API_URL" src\config\api.js
    findstr "SOCKET_URL" src\config\api.js
    echo.
    echo WARNING: Make sure backend URL is correct!
    echo For production, use your server IP or domain.
    echo.
    set /p continue="Continue with this configuration? (Y/N): "
    if /i not "%continue%"=="Y" (
        echo.
        echo Please edit src/config/api.js first
        echo Then run this script again
        pause
        exit /b 1
    )
) else (
    echo ERROR: API config not found!
    pause
    exit /b 1
)

echo.
echo [3/7] Installing dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [4/7] Cleaning previous builds...
cd android
call gradlew.bat clean
if errorlevel 1 (
    echo WARNING: Clean failed, continuing anyway...
)
cd ..

echo.
echo [5/7] Building Debug APK...
echo This may take 5-10 minutes on first build...
echo.
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Android SDK not found
    echo    → Set ANDROID_HOME environment variable
    echo.
    echo 2. Java version mismatch
    echo    → Install Java JDK 11 or higher
    echo.
    echo 3. Gradle daemon issues
    echo    → Run: gradlew --stop
    echo.
    echo 4. Out of memory
    echo    → Edit android/gradle.properties
    echo    → Add: org.gradle.jvmargs=-Xmx4096m
    echo.
    echo For detailed error, check the output above.
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [6/7] Locating APK...
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
if exist "%APK_PATH%" (
    echo ✓ APK built successfully!
    echo.
    echo Location: %APK_PATH%
) else (
    echo ERROR: APK not found at expected location!
    echo Check android\app\build\outputs\apk\ directory
    pause
    exit /b 1
)

echo.
echo [7/7] Copying APK to root directory...
copy "%APK_PATH%" "SecureChat-debug.apk" >nul
if exist "SecureChat-debug.apk" (
    echo ✓ APK copied to: SecureChat-debug.apk
) else (
    echo WARNING: Could not copy APK to root
)

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location:
echo   %APK_PATH%
echo.
echo Copied to:
echo   SecureChat-debug.apk
echo.
echo APK Size:
for %%A in ("%APK_PATH%") do echo   %%~zA bytes
echo.
echo ========================================
echo   Installation Instructions
echo ========================================
echo.
echo Option 1: Install via USB
echo   adb install SecureChat-debug.apk
echo.
echo Option 2: Transfer to phone
echo   1. Copy APK to phone
echo   2. Open file manager
echo   3. Tap APK file
echo   4. Allow "Install from unknown sources"
echo   5. Tap "Install"
echo.
echo Option 3: Share via cloud
echo   Upload to Google Drive, Dropbox, etc.
echo.
echo ========================================
echo   Important Notes
echo ========================================
echo.
echo 1. This is a DEBUG APK (not optimized)
echo 2. For production, build RELEASE APK
echo 3. Backend URL: Check src/config/api.js
echo 4. Make sure backend is accessible from phone
echo.
echo To build Release APK:
echo   See BUILD_APK.md for instructions
echo.

pause
