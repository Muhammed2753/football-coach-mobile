@echo off
echo ========================================
echo FOOTBALL COACH APP - COMPLETE FIX
echo ========================================

echo Step 1: Clearing Expo cache...
cd /d "c:\Users\AJAI MUHAMMED\Desktop\champs\football-coach-mobile"
call npx expo install --fix

echo Step 2: Installing dependencies...
call npm install

echo Step 3: Clearing all caches...
call npm run reset

echo Step 4: Starting with tunnel mode...
echo.
echo ========================================
echo FIXES APPLIED:
echo ✅ Added tunnel mode for QR scanning
echo ✅ Fixed all component imports
echo ✅ Added proper permissions
echo ✅ Fixed babel configuration
echo ✅ Created metro config
echo ✅ Fixed PlayerCard component
echo ✅ Fixed ProfileForm component
echo ✅ Added proper error handling
echo ========================================
echo.
echo Your app should now work with Expo Go!
echo Scan the QR code that appears next.
echo.

call npm start