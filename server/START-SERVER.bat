@echo off
rem BreakGlass kit server launcher (Windows)
cd /d "%~dp0.."
where python3 >nul 2>nul
if %errorlevel%==0 (
  python3 server\serve.py %1
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python server\serve.py %1
  goto :end
)
echo No Python found - using the built-in Windows server instead.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
:end
pause
