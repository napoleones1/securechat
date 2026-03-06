@echo off
echo ========================================
echo   Fix Compatibility dan Preview
echo ========================================
echo.

echo [1/3] Menghapus node_modules lama...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo OK: node_modules dihapus
) else (
    echo OK: node_modules tidak ada
)

echo.
echo [2/3] Menghapus package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
    echo OK: package-lock.json dihapus
)

echo.
echo [3/3] Install dependencies yang kompatibel...
echo Ini akan memakan waktu 2-5 menit...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Install gagal!
    echo Coba jalankan manual: npm install
    pause
    exit /b 1
)

echo.
echo ========================================
echo   INSTALL BERHASIL!
echo ========================================
echo.
echo Sekarang jalankan preview:
echo   npx expo start
echo.
echo Atau double-click: preview-sekarang.bat
echo.
pause
