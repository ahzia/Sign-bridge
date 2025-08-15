# Production build script for SignBridge (Windows PowerShell version)
# Builds backend executable and bundles it with Tauri app

Write-Host "🚀 Building SignBridge for Production..." -ForegroundColor Green

# Get the project root directory
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $PROJECT_ROOT

# Step 1: Build the backend executable
Write-Host "🔧 Building backend executable..." -ForegroundColor Yellow
python scripts/build_backend.py

# Step 2: Build the Tauri app
Write-Host "🎨 Building Tauri app..." -ForegroundColor Yellow
Set-Location frontend

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the Tauri app
Write-Host "🔨 Building Tauri app..." -ForegroundColor Yellow
npm run build

Write-Host "🎉 Production build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Built app location: frontend/src-tauri/target/release/bundle/" -ForegroundColor Cyan
Write-Host "🔧 Backend is bundled with the app - no external dependencies required!" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Ready for Windows Store deployment!" -ForegroundColor Green
