@echo off
REM DALL-E MCP Server Launcher for Windows

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is not installed or not in the PATH.
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Get parameters
set PORT=3000
set BASE_PATH=
if not "%~1"=="" set PORT=%~1
if not "%~2"=="" set BASE_PATH=%~2

echo Starting DALL-E MCP Server on port %PORT%...
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Run the server
node run-server.js %PORT% %BASE_PATH%

REM If the server exited unexpectedly
echo Server stopped.
pause 