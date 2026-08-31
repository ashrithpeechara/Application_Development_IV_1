@echo off
echo ===================================================
echo Starting Full C-ASA Live Network Simulation System
echo ===================================================

echo [1/2] Launching Django REST Backend on http://localhost:8000 ...
start "C-ASA Backend (Django)" cmd /k "cd /d "%~dp0backend" && python manage.py runserver 0.0.0.0:8000"

echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "C-ASA Frontend (Next.js)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo All services launched!
echo Open your browser at: http://localhost:3000
echo.
