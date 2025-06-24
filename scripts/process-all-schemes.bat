@echo off
REM Script to process all schemes in sequence

echo ========================================
echo    Sahayak-AI Scheme Processing Tool
echo ========================================
echo.

REM Create data directory and initialize with sample data
echo Step 1: Initializing data directory...
node scripts/init-scheme-data.js
echo.

REM Process all scheme files from the scheme directory
echo Step 2: Processing all scheme files...
node scripts/process-schemes.js
echo.

REM Validate the generated data
echo Step 3: Validating generated data...
node scripts/validate-schemes.js
echo.

echo ========================================
echo    Processing Complete!
echo ========================================
echo The processed scheme data is now available
echo in the 'data' directory and ready to use
echo in the Sahayak-AI app.
echo.

pause 