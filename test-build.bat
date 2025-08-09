@echo off
echo ========================================
echo   Testing Build Before Deploy
echo ========================================
echo.

echo Testing Frontend Build...
cd react-frontend

echo.
echo 1. Installing dependencies...
call npm install

echo.
echo 2. Running build test...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD SUCCESS!
    echo Frontend build completed successfully.
    echo Ready for deployment to Vercel.
    echo.
    echo Build output is in: react-frontend/build/
) else (
    echo.
    echo ❌ BUILD FAILED!
    echo Please fix the errors above before deploying.
    echo.
)

echo.
echo ========================================
echo   Build test completed
echo ========================================
echo.
pause
