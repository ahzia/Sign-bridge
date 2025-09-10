# PowerShell script to build SignBridge as MSIX package for Microsoft Store

Write-Host "🚀 Building SignBridge MSIX package..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "frontend\package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first:" -ForegroundColor Red
    Write-Host "   winget install OpenJS.NodeJS" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "npm not found"
    }
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

# Generate icons if they don't exist
if (!(Test-Path "frontend\public\icon.ico")) {
    Write-Host "🎨 Generating icons..." -ForegroundColor Blue
    .\scripts\generate_icons.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate icons" -ForegroundColor Red
        exit 1
    }
}

# Generate certificate if it doesn't exist
if (!(Test-Path "frontend\certificates\signbridge.p12")) {
    Write-Host "🔐 Generating certificate..." -ForegroundColor Blue
    .\scripts\generate_certificate.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate certificate" -ForegroundColor Red
        exit 1
    }
}

# Build the application
Write-Host "🔨 Building SignBridge..." -ForegroundColor Blue
Set-Location frontend

# Build frontend
Write-Host "📱 Building frontend..." -ForegroundColor Blue
npm run build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Build MSIX package
Write-Host "📦 Building MSIX package..." -ForegroundColor Blue
npm run build:msix
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MSIX build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Check if MSIX was created
$msixFile = Get-ChildItem -Path "frontend\dist-electron" -Filter "*.msix" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($msixFile) {
    Write-Host "✅ MSIX package created successfully!" -ForegroundColor Green
    Write-Host "📁 Package location: $($msixFile.FullName)" -ForegroundColor Cyan
    Write-Host "📏 Package size: $([math]::Round($msixFile.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    
    # Show package info
    Write-Host "`n📋 Package Information:" -ForegroundColor Yellow
    Write-Host "   Name: SignBridge" -ForegroundColor White
    Write-Host "   Version: 1.0.0" -ForegroundColor White
    Write-Host "   Publisher: SignBridge Team" -ForegroundColor White
    Write-Host "   Architecture: x64" -ForegroundColor White
    Write-Host "   Target: Microsoft Store" -ForegroundColor White
    
    Write-Host "`n🎉 Build completed successfully!" -ForegroundColor Green
    Write-Host "📤 You can now upload the MSIX file to the Microsoft Store Partner Center" -ForegroundColor Cyan
} else {
    Write-Host "❌ MSIX package not found. Build may have failed." -ForegroundColor Red
    exit 1
}