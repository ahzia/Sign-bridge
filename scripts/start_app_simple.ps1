# Simple script to start SignBridge (Windows PowerShell version)

Write-Host "🚀 Starting SignBridge..." -ForegroundColor Green

# Get the project root directory
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $PROJECT_ROOT

# Check if backend is already running
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend already running on port 8000" -ForegroundColor Green
} catch {
    Write-Host "🔧 Starting backend..." -ForegroundColor Yellow
    
    # Activate Python environment and start backend
    Set-Location backend
    
    # Activate virtual environment
    & ".\py311_venv\Scripts\Activate.ps1"
    
    # Start backend in background
    Start-Process -FilePath "python" -ArgumentList "run_backend.py" -WindowStyle Hidden
    Set-Location ..
    
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
    
    # Wait for backend to be ready
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ Backend started successfully" -ForegroundColor Green
            break
        } catch {
            if ($i -eq 30) {
                Write-Host "❌ Backend failed to start within 30 seconds" -ForegroundColor Red
                exit 1
            }
            Start-Sleep -Seconds 1
        }
    }
}

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
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
