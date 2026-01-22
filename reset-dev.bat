@echo off
echo ========================================
echo COMPREHENSIVE DEV SERVER RESET
echo ========================================
echo.

echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Stopped Node.js processes
) else (
    echo    ℹ No Node.js processes running
)
echo.

echo [2/4] Deleting .next build cache...
if exist .next (
    rmdir /S /Q .next >nul 2>&1
    echo    ✓ Deleted .next folder
) else (
    echo    ℹ .next folder not found
)
echo.

echo [3/4] Cleaning npm cache...
npm cache clean --force >nul 2>&1
echo    ✓ Cleaned npm cache
echo.

echo [4/4] Starting fresh dev server...
echo    ▶ Running: npm run dev
echo    ▶ Server will start on http://localhost:3000
echo.
echo ========================================
echo.
npm run dev
