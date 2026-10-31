@echo off
cd /d "%~dp0"
where node >/dev/null 2>/dev/null || (echo Node.js is not installed. Get the LTS version from https://nodejs.org & pause & exit /b)
start "" http://localhost:3000
node server.js
pause
