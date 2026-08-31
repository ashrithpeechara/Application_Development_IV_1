@echo off
echo ===================================================
echo Starting C-ASA Next.js Frontend on http://localhost:3000
echo ===================================================
cd /d "%~dp0frontend"
npm run dev
pause
