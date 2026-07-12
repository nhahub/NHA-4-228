@echo off
title Car Performance & Tuning Lab - Startup
echo ==============================================
echo  Starting Car Performance & Tuning Lab...
echo ==============================================
echo.

:: Start Backend API Server
echo Starting Backend API Server on Port 5000...
start "Tuning Lab Backend" cmd /k "cd /d %~dp0\backend && npm run dev"

:: Start Frontend React Server
echo Starting Frontend React Web App on Port 3000...
start "Tuning Lab Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Launching your browser at http://localhost:3000...
echo.
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo ==============================================
echo  Startup Complete! 
echo  Keep the two spawned terminal windows open.
echo ==============================================
pause
