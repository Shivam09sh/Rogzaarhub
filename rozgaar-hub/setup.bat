@echo off
REM RozgaarHub Setup Script for Windows
REM This script helps set up the project for new collaborators

echo ========================================
echo    RozgaarHub Setup Script (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node -v
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm is installed
npm -v
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend dependency installation failed!
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend dependency installation failed!
    pause
    exit /b 1
)

cd ..
echo [OK] Backend dependencies installed
echo.

REM Check for environment files
echo Checking environment files...

if not exist "backend\.env" (
    echo [WARNING] backend\.env not found!
    if exist "backend\.env.example" (
        echo Copying backend\.env.example to backend\.env...
        copy "backend\.env.example" "backend\.env" >nul
        echo [OK] Created backend\.env from example file
        echo [OK] Database credentials are already configured!
    ) else (
        echo [ERROR] backend\.env.example not found! Please contact project owner.
        pause
        exit /b 1
    )
) else (
    echo [OK] backend\.env exists
)

if not exist ".env" (
    echo [WARNING] .env not found!
    if exist ".env.example" (
        echo Copying .env.example to .env...
        copy ".env.example" ".env" >nul
        echo [OK] Created .env from example file
    ) else (
        echo [ERROR] .env.example not found! Please contact project owner.
        pause
        exit /b 1
    )
) else (
    echo [OK] .env exists
)

echo.
echo ========================================
echo          Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Environment files are configured with shared database
echo 2. Open TWO command prompt windows:
echo.
echo    Window 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Window 2 (Frontend):
echo    npm run dev
echo.
echo 3. Open http://localhost:8080 in your browser
echo.
echo You're all set! Everyone shares the same database.
echo For detailed instructions, see SETUP.md
echo.
pause
