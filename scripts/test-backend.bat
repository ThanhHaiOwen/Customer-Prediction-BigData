@echo off
echo ========================================
echo   Testing Backend Before Deploy
echo ========================================
echo.

echo Starting backend server...
start "Backend Test" cmd /k "python app.py"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing API endpoints...

echo.
echo 1. Testing health endpoint...
curl -s http://localhost:5000/health
echo.

echo.
echo 2. Testing prediction endpoint...
curl -s -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d "{\"MonthlyCharges\": 50, \"Contract\": \"Month-to-month\"}"
echo.

echo.
echo 3. Testing filter endpoint...
curl -s "http://localhost:5000/api/filter-churn?churn=Yes" | head -c 200
echo ...
echo.

echo.
echo 4. Testing chart data endpoint...
curl -s http://localhost:5000/api/churn-data
echo.

echo.
echo ========================================
echo   Backend test completed!
echo ========================================
echo.
echo If all tests passed, backend is ready for deployment.
echo Run prepare-backend-deploy.bat to deploy.
echo.
pause
