@echo off
echo ========================================
echo   Complete Deployment Guide
echo ========================================
echo.
echo Your Vercel Frontend URL: https://customer-prediction-big-data-sfsa.vercel.app
echo.

echo 1. Preparing files for deployment...
git add .
git commit -m "Update: Configure for correct Vercel URL - customer-prediction-big-data-sfsa"
git push origin main

echo.
echo ========================================
echo   STEP 1: Deploy Backend to Render
echo ========================================
echo.
echo 1. Go to: https://render.com
echo 2. Sign in with GitHub
echo 3. Click "New" → "Web Service"
echo 4. Connect repository: Customer-Prediction-BigData
echo 5. Configure:
echo    - Name: customer-prediction-bigdata-sfsa
echo    - Environment: Python 3
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: gunicorn wsgi:app
echo    - Plan: Free
echo.
echo 6. Environment Variables:
echo    ALLOWED_ORIGINS = https://customer-prediction-big-data-sfsa.vercel.app,http://localhost:3000
echo    PYTHON_VERSION = 3.9.16
echo.
echo 7. Click "Create Web Service"
echo.

echo ========================================
echo   STEP 2: Update Frontend API URL
echo ========================================
echo.
echo After backend deploys successfully:
echo 1. Copy your Render backend URL (e.g., https://customer-prediction-bigdata-sfsa.onrender.com)
echo 2. Go to Vercel dashboard: https://vercel.com/vothanhhai156-3787s-projects/customer-prediction-big-data-sfsa
echo 3. Settings → Environment Variables
echo 4. Update REACT_APP_API_URL to your backend URL
echo 5. Redeploy
echo.

echo ========================================
echo   STEP 3: Test Connection
echo ========================================
echo.
echo 1. Test backend: curl https://your-backend-url.onrender.com/health
echo 2. Test frontend: https://customer-prediction-big-data-sfsa.vercel.app
echo 3. Try prediction feature to verify connection
echo.

echo ========================================
echo   Quick Deploy Commands
echo ========================================
echo.
echo Backend URL will be: https://customer-prediction-bigdata-sfsa.onrender.com
echo Frontend URL is: https://customer-prediction-big-data-sfsa.vercel.app
echo.
echo After both are deployed, test with:
echo curl https://customer-prediction-bigdata-sfsa.onrender.com/health
echo.

pause
