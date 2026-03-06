@echo off
echo ========================================
echo   SecureChat - Initialize Project
echo ========================================
echo.

echo This script will:
echo 1. Create new React Native project
echo 2. Copy your source code
echo 3. Install dependencies
echo 4. Setup Android project
echo 5. Ready to build APK
echo.
echo This will take 10-15 minutes.
echo.

set /p continue="Continue? (Y/N): "
if /i not "%continue%"=="Y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo [1/6] Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    pause
    exit /b 1
)
echo ✓ Node.js installed

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not installed!
    pause
    exit /b 1
)
echo ✓ npm installed

echo.
echo [2/6] Creating new React Native project...
echo This will take 5-10 minutes...
echo.

REM Go to parent directory
cd ..

REM Create new project
call npx react-native@0.73.2 init SecureChatTemp
if errorlevel 1 (
    echo ERROR: Failed to create React Native project!
    pause
    exit /b 1
)

echo.
echo [3/6] Copying source code...
echo.

REM Copy src folder
xcopy mobile\src SecureChatTemp\src\ /E /I /Y

REM Copy other files
copy mobile\App.js SecureChatTemp\App.js /Y
copy mobile\index.js SecureChatTemp\index.js /Y
copy mobile\package.json SecureChatTemp\package.json.backup /Y

echo ✓ Source code copied

echo.
echo [4/6] Merging package.json...
echo.

REM Note: Manual merge needed for package.json
echo WARNING: You need to manually merge dependencies from:
echo   mobile\package.json
echo Into:
echo   SecureChatTemp\package.json
echo.
echo Press any key to open both files...
pause

notepad mobile\package.json
notepad SecureChatTemp\package.json

echo.
echo After merging, save and close both files.
pause

echo.
echo [5/6] Installing dependencies...
echo.

cd SecureChatTemp
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    cd ..
    pause
    exit /b 1
)

echo.
echo [6/6] Finalizing...
echo.

echo ✓ Project initialized successfully!
echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. Project location: SecureChatTemp\
echo.
echo 2. To build APK:
echo    cd SecureChatTemp\android
echo    gradlew assembleDebug
echo.
echo 3. APK will be at:
echo    SecureChatTemp\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 4. To run on emulator:
echo    cd SecureChatTemp
echo    npm run android
echo.

cd ..
pause
