# Script to start SignBridge with backend integration (Windows PowerShell version)
# This script is equivalent to start_app.sh but works on Windows

Write-Host "🚀 Starting SignBridge..." -ForegroundColor Green

# Get the project root directory
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $PROJECT_ROOT

# Function to cleanup on exit
function Cleanup {
    Write-Host "🛑 Cleaning up..." -ForegroundColor Yellow
    if ($BACKEND_PROCESS) {
        Write-Host "Stopping backend (PID: $($BACKEND_PROCESS.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $BACKEND_PROCESS.Id -Force -ErrorAction SilentlyContinue
    }
    if ($TAURI_PROCESS) {
        Write-Host "Stopping Tauri (PID: $($TAURI_PROCESS.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $TAURI_PROCESS.Id -Force -ErrorAction SilentlyContinue
    }
    exit 0
}

# Set up signal handlers
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

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
    $BACKEND_PROCESS = Start-Process -FilePath "python" -ArgumentList "run_backend.py" -PassThru -WindowStyle Hidden
    Set-Location ..
    
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
    
    # Wait for backend to be ready
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ Backend started successfully (PID: $($BACKEND_PROCESS.Id))" -ForegroundColor Green
            break
        } catch {
            if ($i -eq 30) {
                Write-Host "❌ Backend failed to start within 30 seconds" -ForegroundColor Red
                Cleanup
            }
            Start-Sleep -Seconds 1
        }
    }
}

# Test backend functionality
Write-Host "🧪 Testing backend functionality..." -ForegroundColor Yellow
try {
    $body = @{ text = "Hello world" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/simplify_text" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Backend API test successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API test failed" -ForegroundColor Red
    Cleanup
}

# Start Tauri frontend
Write-Host "🎨 Starting Tauri frontend..." -ForegroundColor Yellow
Set-Location frontend
$TAURI_PROCESS = Start-Process -FilePath "npm" -ArgumentList "run", "tauri:dev" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "🎉 SignBridge started successfully!" -ForegroundColor Green
Write-Host "📱 Tauri app should open automatically" -ForegroundColor Cyan
Write-Host "🔧 Backend running on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "🌐 Frontend running on http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Wait for user to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Cleanup
}
