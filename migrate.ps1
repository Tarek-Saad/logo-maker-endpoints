# Logo Maker Database Migration Script
# PowerShell version

Write-Host "🚀 Starting Logo Maker Database Migration..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file with your database configuration" -ForegroundColor Yellow
    Write-Host "Copy env.example to .env and update the values" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Run the migration
Write-Host "🔄 Running database migration..." -ForegroundColor Yellow
try {
    node api/config/migrate-to-logo-maker.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host "🎉 Your Logo Maker database is ready!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Please check your database connection and try again." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running migration: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
