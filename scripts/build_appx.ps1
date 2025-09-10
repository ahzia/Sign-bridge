# PowerShell script to build SignBridge as APPX package for Microsoft Store

Write-Host "🚀 Building SignBridge APPX package..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "frontend\package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location frontend

# Build the application
Write-Host "🔨 Building SignBridge..." -ForegroundColor Blue

# Build frontend
Write-Host "📱 Building frontend..." -ForegroundColor Blue
npm run build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Build APPX package
Write-Host "📦 Building APPX package..." -ForegroundColor Blue
npm run build:appx
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APPX build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Check if APPX was created
$appxFile = Get-ChildItem -Path "frontend\dist-electron" -Filter "*.appx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($appxFile) {
    Write-Host "✅ APPX package created successfully!" -ForegroundColor Green
    Write-Host "📁 Package location: $($appxFile.FullName)" -ForegroundColor Cyan
    Write-Host "📏 Package size: $([math]::Round($appxFile.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    
    # Show package info
    Write-Host "`n📋 Package Information:" -ForegroundColor Yellow
    Write-Host "   Name: SignBridge" -ForegroundColor White
    Write-Host "   Version: 1.0.0" -ForegroundColor White
    Write-Host "   Publisher: SignBridge Team" -ForegroundColor White
    Write-Host "   Architecture: ARM64" -ForegroundColor White
    Write-Host "   Target: Microsoft Store" -ForegroundColor White
    
    Write-Host "`n🎉 Build completed successfully!" -ForegroundColor Green
    Write-Host "📤 You can now upload the APPX file to the Microsoft Store Partner Center" -ForegroundColor Cyan
    Write-Host "⚠️  Note: This is an ARM64 build. For x64, you may need to adjust the configuration." -ForegroundColor Yellow
} else {
    Write-Host "❌ APPX package not found. Build may have failed." -ForegroundColor Red
    exit 1
}
