@echo off
echo ===================================================
echo Starting C-ASA Django Backend on http://localhost:8000
echo ===================================================
cd /d "%~dp0backend"
python manage.py runserver 0.0.0.0:8000
pause
