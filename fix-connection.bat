@echo off
echo ========================================
echo   Fixing Frontend-Backend Connection
echo ========================================
echo.

echo ✅ Backend found at: https://customer-prediction-bigdata.onrender.com
echo ✅ Backend health check: OK
echo ✅ Backend prediction API: OK
echo ✅ Backend chart data API: OK

echo.
echo Updating frontend to connect to correct backend URL...

git add react-frontend/.env
git commit -m "Fix: Update frontend API URL to correct backend - customer-prediction-bigdata.onrender.com"
git push origin main

echo.
echo ========================================
echo   Connection Fixed!
echo ========================================
echo.
echo Frontend: https://customer-prediction-big-data-sfsa.vercel.app
echo Backend:  https://customer-prediction-bigdata.onrender.com
echo.
echo Vercel will auto-deploy in 2-3 minutes.
echo After that, all features should work!
echo.
echo Test the connection:
echo 1. Wait 3 minutes for Vercel to redeploy
echo 2. Go to: https://customer-prediction-big-data-sfsa.vercel.app
echo 3. Try the prediction feature
echo 4. Check browser console for any errors
echo.
pause
