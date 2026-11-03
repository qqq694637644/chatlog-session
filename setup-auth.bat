@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not in PATH.
  pause
  exit /b 1
)

node scripts\setup-auth.mjs
if errorlevel 1 (
  pause
  exit /b 1
)
pause