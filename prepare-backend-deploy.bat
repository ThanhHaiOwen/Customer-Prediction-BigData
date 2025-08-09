@echo off
echo ========================================
echo   Preparing Backend for Render Deploy
echo ========================================
echo.

echo 1. Checking required files...
if exist "app.py" (
    echo ✅ app.py found
) else (
    echo ❌ app.py not found
    goto error
)

if exist "wsgi.py" (
    echo ✅ wsgi.py found
) else (
    echo ❌ wsgi.py not found
    goto error
)

if exist "requirements.txt" (
    echo ✅ requirements.txt found
) else (
    echo ❌ requirements.txt not found
    goto error
)

if exist "render.yaml" (
    echo ✅ render.yaml found
) else (
    echo ❌ render.yaml not found
    goto error
)

if exist "best_logistic_model.pkl" (
    echo ✅ best_logistic_model.pkl found
) else (
    echo ❌ best_logistic_model.pkl not found
    goto error
)

if exist "scaler.pkl" (
    echo ✅ scaler.pkl found
) else (
    echo ❌ scaler.pkl not found
    goto error
)

echo.
echo 2. Committing backend changes...
git add .
git commit -m "Backend: Prepare for Render deployment - Update app.py for production"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Backend ready for deployment!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://render.com
echo 2. Sign in with GitHub
echo 3. Create new Web Service
echo 4. Follow instructions in deploy-backend.md
echo.
echo Backend will be available at:
echo https://customer-prediction-bigdata.onrender.com
echo.
goto end

:error
echo.
echo ❌ Missing required files for deployment!
echo Please ensure all files are present.
echo.

:end
pause
