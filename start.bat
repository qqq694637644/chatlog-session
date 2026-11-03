@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not in PATH.
  pause
  exit /b 1
)

if not exist ".env.server" (
  echo .env.server is missing.
  echo Run setup-auth.bat once, then copy the generated key to your local Chrome launcher BAT.
  pause
  exit /b 1
)

node server.mjs
if errorlevel 1 (
  echo Chatlog web server exited with an error.
  pause
)