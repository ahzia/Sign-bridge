# Test script for backend executable
Write-Host "Testing backend executable..." -ForegroundColor Green

# Start the backend in background
Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process -FilePath ".\dist\backend.exe" -WindowStyle Hidden
$backendProcess = Get-Process -Name "backend" -ErrorAction SilentlyContinue

if ($backendProcess) {
    Write-Host "Backend process started with PID: $($backendProcess.Id)" -ForegroundColor Green
    
    # Wait for backend to start
    Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Test the features endpoint
    try {
        Write-Host "Testing /features endpoint..." -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/features" -UseBasicParsing -TimeoutSec 30
        Write-Host "Response status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response content: $($response.Content)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Error testing backend: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Stop the backend
    Write-Host "Stopping backend..." -ForegroundColor Yellow
    Stop-Process -Name "backend" -Force -ErrorAction SilentlyContinue
    Write-Host "Backend stopped." -ForegroundColor Green
}
else {
    Write-Host "Failed to start backend process" -ForegroundColor Red
}



