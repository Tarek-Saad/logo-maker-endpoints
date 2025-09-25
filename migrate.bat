@echo off
echo 🚀 Starting Logo Maker Database Migration...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found
    echo Please create .env file with your database configuration
    echo Copy env.example to .env and update the values
    pause
    exit /b 1
)

echo ✅ Node.js found
echo ✅ .env file found
echo.

REM Run the migration
echo 🔄 Running database migration...
node api/config/migrate-to-logo-maker.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo 🎉 Your Logo Maker database is ready!
) else (
    echo.
    echo ❌ Migration failed!
    echo Please check your database connection and try again.
)

echo.
pause
