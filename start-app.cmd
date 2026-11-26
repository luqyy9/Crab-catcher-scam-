@echo off
setlocal
title Crab Catcher
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed, or not on your PATH.
  echo   Install the LTS version from https://nodejs.org and try again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo.
  echo   First run: installing dependencies. This takes a few minutes.
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo   npm install failed. Scroll up to see the error.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo   Starting Crab Catcher...
echo   Opening http://localhost:3000 in a few seconds.
echo.
echo   Keep this window open while you use the app.
echo   Press Ctrl+C to stop the server.
echo.

start "" /min cmd /c "timeout /t 9 >nul && start http://localhost:3000"

call npm run dev

echo.
echo   Server stopped.
echo.
pause
