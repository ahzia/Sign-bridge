# PowerShell script to generate icons for MSIX packaging
# This script requires ImageMagick to be installed

Write-Host "🎨 Generating icons for SignBridge MSIX package..." -ForegroundColor Green

# Check if ImageMagick is installed
try {
    $magickVersion = magick -version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "ImageMagick not found"
    }
    Write-Host "✅ ImageMagick found" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick not found. Please install ImageMagick first:" -ForegroundColor Red
    Write-Host "   winget install ImageMagick.ImageMagick" -ForegroundColor Yellow
    Write-Host "   Or download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    exit 1
}

# Create icons directory if it doesn't exist
$iconsDir = "frontend\public"
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force
}

# Generate ICO file (Windows)
Write-Host "📱 Generating ICO file..." -ForegroundColor Blue
magick frontend\public\icon.svg -resize 256x256 frontend\public\icon.ico

# Generate PNG files for different sizes
Write-Host "🖼️ Generating PNG files..." -ForegroundColor Blue
magick frontend\public\icon.svg -resize 16x16 frontend\public\icon-16.png
magick frontend\public\icon.svg -resize 32x32 frontend\public\icon-32.png
magick frontend\public\icon.svg -resize 48x48 frontend\public\icon-48.png
magick frontend\public\icon.svg -resize 64x64 frontend\public\icon-64.png
magick frontend\public\icon.svg -resize 128x128 frontend\public\icon-128.png
magick frontend\public\icon.svg -resize 256x256 frontend\public\icon-256.png
magick frontend\public\icon.svg -resize 512x512 frontend\public\icon-512.png

# Generate ICNS file (macOS)
Write-Host "🍎 Generating ICNS file..." -ForegroundColor Blue
magick frontend\public\icon.svg -resize 512x512 frontend\public\icon.icns

Write-Host "✅ All icons generated successfully!" -ForegroundColor Green
Write-Host "📁 Icons saved to: $iconsDir" -ForegroundColor Cyan
