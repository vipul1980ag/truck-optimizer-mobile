@echo off
title Truck Capacity Optimizer - Android Build
color 0A
echo.
echo  ============================================
echo   Truck Capacity Optimizer - Android Build
echo  ============================================
echo.
echo  This will build an APK you can install on
echo  any Android phone — no Play Store needed.
echo.
echo  When asked about a keystore, just press ENTER
echo  to let EAS generate one automatically.
echo.
pause

cd /d "%~dp0"
set EXPO_TOKEN=1BzsHJ-jUUjCWzwYOdWVVpER831iv2XP0EoZZ_4F

echo.
echo  Starting build... (takes 10-20 minutes)
echo.

eas build --platform android --profile preview

echo.
echo  ============================================
echo   Build submitted to Expo servers!
echo   Download your APK at:
echo   https://expo.dev/accounts/vipul1980/projects/truck-optimizer-mobile
echo  ============================================
echo.
pause
