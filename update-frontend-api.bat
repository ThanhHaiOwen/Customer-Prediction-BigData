@echo off
echo ========================================
echo   Update Frontend API URL
echo ========================================
echo.

set /p backend_url="Enter your Render backend URL (e.g., https://customer-prediction-bigdata.onrender.com): "

if "%backend_url%"=="" (
    echo Error: Backend URL cannot be empty!
    goto end
)

echo.
echo Updating frontend environment variables...

cd react-frontend

echo REACT_APP_API_URL=%backend_url% > .env
echo REACT_APP_ENV=production >> .env
echo REACT_APP_TITLE=Customer Prediction System >> .env
echo REACT_APP_DESCRIPTION=Hệ thống dự đoán khách hàng rời bỏ dịch vụ >> .env
echo GENERATE_SOURCEMAP=false >> .env

echo.
echo ✅ Updated .env file with:
echo REACT_APP_API_URL=%backend_url%

cd ..

echo.
echo Committing changes...
git add react-frontend/.env
git commit -m "Frontend: Update API URL to point to Render backend"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Frontend updated successfully!
echo ========================================
echo.
echo Vercel will automatically redeploy with new API URL.
echo.
echo Frontend: https://customer-prediction-big-data-sfsa.vercel.app
echo Backend:  %backend_url%
echo.
echo Wait 2-3 minutes for Vercel to redeploy, then test the connection.

:end
pause
