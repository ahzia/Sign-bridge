# Simple script to start SignBridge (Windows PowerShell version)

Write-Host "🚀 Starting SignBridge..." -ForegroundColor Green

# Get the project root directory
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $PROJECT_ROOT

Write-Host "🔧 Starting backend..." -ForegroundColor Yellow

# Activate Python environment and start backend
Set-Location backend
& ".\py311_venv\Scripts\Activate.ps1"
Start-Process -FilePath "python" -ArgumentList "run_backend.py" -WindowStyle Hidden
Set-Location ..

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Tauri frontend
Write-Host "🎨 Starting Tauri frontend..." -ForegroundColor Yellow
Set-Location frontend
Start-Process -FilePath "npm" -ArgumentList "run", "tauri:dev" -WindowStyle Hidden
Set-Location ..

Write-Host "🎉 SignBridge started successfully!" -ForegroundColor Green
Write-Host "📱 Tauri app should open automatically" -ForegroundColor Cyan
Write-Host "🔧 Backend running on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "🌐 Frontend running on http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow

# Wait for user input
Read-Host
