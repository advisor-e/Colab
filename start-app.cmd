@echo off
REM ============================================================================
REM  Start Advisor-e Collaborate and open it in your browser.
REM
REM  HOW TO USE: just double-click this file.
REM   - A separate "server" window opens and runs the app. KEEP IT OPEN.
REM   - Your browser opens automatically once the app is ready.
REM   - To STOP the app, close that server window.
REM
REM  Runs the full app (Nuxt front end on :3000 + Restify back end on :4000)
REM  in dev mode on the locked Node 14.15. See CONTRIBUTING.md.
REM ============================================================================

cd /d "%~dp0"

echo.
echo   Starting Advisor-e Collaborate...
echo   A separate window will run the app - keep it open while you work.
echo.

REM Launch the app in its own window so it keeps running after this one closes.
start "Advisor-e Collaborate (server) - KEEP OPEN" cmd /k "nvm use 14.15.0 && npm run dev:all"

echo   Waiting for the app to be ready (the first start can take a minute)...

set /a tries=0
:waitloop
set /a tries+=1
if %tries% gtr 90 goto giveup
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "try { [void](Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:3000); exit 0 } catch { exit 1 }"
if errorlevel 1 goto waitloop

echo   Ready - opening http://localhost:3000
start "" http://localhost:3000
goto done

:giveup
echo.
echo   The app did not respond after a few minutes.
echo   Look at the server window for errors. If it mentions a missing
echo   node_modules, run:  npm install   (see CONTRIBUTING.md), then try again.
echo   Opening the browser anyway in case it just needs a moment...
start "" http://localhost:3000

:done
echo.
echo   All set. Leave the server window open while you use the app.
timeout /t 6 /nobreak >nul
