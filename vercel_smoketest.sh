@echo off
REM Windows smoke test (local):
REM 1) build static frontend + bundle backend
REM 2) run server briefly

npm install
npm run build

start /b npm run start

timeout /t 2 >nul

echo Smoke test done (server started in background). Open http://localhost:3000

