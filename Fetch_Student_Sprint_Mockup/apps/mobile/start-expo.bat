@echo off
cd /d "%~dp0"
echo Starting Expo with tunnel for iOS...
echo.
npx expo start --tunnel
pause
