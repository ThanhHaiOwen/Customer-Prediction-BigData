@echo off
echo ========================================
echo   Customer Churn Prediction System
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

REM Start Backend in new window
echo Starting Backend (Flask)...
start "Backend Server" cmd /k "python app.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new window
echo Starting Frontend (React)...
start "Frontend Server" cmd /k "cd react-frontend && npm start"

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3001
echo.
echo Press any key to exit this window...
pause >nul
