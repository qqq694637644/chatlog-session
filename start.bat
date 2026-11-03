@echo off
setlocal
cd /d "%~dp0"

if not exist ".env.server" (
  echo Chatlog API Key has not been created.
  echo Run "npm run setup:auth" once, then copy the printed key into your local Chrome launcher BAT.
  pause
  exit /b 1
)

call npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

call npm run start