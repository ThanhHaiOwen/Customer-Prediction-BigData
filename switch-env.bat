@echo off
echo ========================================
echo   Environment Switcher
echo ========================================
echo.
echo 1. Local Development (localhost)
echo 2. Production (deployed URLs)
echo.
set /p choice="Choose environment (1 or 2): "

cd react-frontend

if "%choice%"=="1" (
    echo.
    echo Switching to LOCAL environment...
    copy .env.local .env
    echo REACT_APP_API_URL=http://localhost:5000 > .env
    echo REACT_APP_ENV=development >> .env
    echo.
    echo ✅ Switched to LOCAL environment
    echo Frontend will connect to: http://localhost:5000
) else if "%choice%"=="2" (
    echo.
    echo Switching to PRODUCTION environment...
    echo REACT_APP_API_URL=https://customer-prediction-bigdata.onrender.com > .env
    echo REACT_APP_ENV=production >> .env
    echo.
    echo ✅ Switched to PRODUCTION environment  
    echo Frontend will connect to: https://customer-prediction-bigdata.onrender.com
) else (
    echo Invalid choice!
    goto end
)

echo.
echo ========================================
echo   Environment switched successfully!
echo ========================================
echo.
echo You may need to restart the frontend server.

:end
pause
