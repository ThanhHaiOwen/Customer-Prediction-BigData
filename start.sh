#!/bin/bash

echo "========================================"
echo "   Customer Churn Prediction System"
echo "========================================"
echo ""
echo "Starting Backend and Frontend..."
echo ""

# Start Backend in background
echo "Starting Backend (Flask)..."
python app.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend (React)..."
cd react-frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "   Servers are running..."
echo "========================================"
echo ""
echo "Backend PID: $BACKEND_PID (http://localhost:5000)"
echo "Frontend PID: $FRONTEND_PID (http://localhost:3001)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
