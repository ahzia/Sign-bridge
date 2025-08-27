# Production setup script for SignBridge Backend
# Creates a separate virtual environment for production builds using the same setup as development

Write-Host "Setting up SignBridge Backend for Production..." -ForegroundColor Green

# Remove existing production venv if it exists
if (Test-Path ".venv_production") {
    Write-Host "Removing existing production virtual environment..." -ForegroundColor Yellow
    Remove-Item ".venv_production" -Recurse -Force
}

# Create new production virtual environment
Write-Host "Creating production virtual environment..." -ForegroundColor Yellow
uv venv .venv_production -p 3.11.13

# Install the same requirements as development (this works!)
Write-Host "Installing main requirements (same as development)..." -ForegroundColor Yellow
uv pip install -r requirements_main.txt --python .venv_production\Scripts\python.exe

Write-Host "Installing NPU requirements (same as development)..." -ForegroundColor Yellow
uv pip install -r requirements_npu.txt --python .venv_production\Scripts\python.exe

# Handle onnxruntime conflicts (same as development setup)
Write-Host "Handling onnxruntime conflicts..." -ForegroundColor Yellow
uv pip uninstall onnxruntime onnxruntime-qnn --python .venv_production\Scripts\python.exe
uv pip install onnxruntime-qnn==1.22.0 --python .venv_production\Scripts\python.exe

# Remove development-only packages to reduce size
Write-Host "Removing development-only packages..." -ForegroundColor Yellow
uv pip uninstall ipython jupyter notebook jupyterlab matplotlib seaborn plotly --python .venv_production\Scripts\python.exe

Write-Host "Production environment setup complete!" -ForegroundColor Green
Write-Host "Production venv: .venv_production" -ForegroundColor Cyan
Write-Host "Development venv: .venv" -ForegroundColor Cyan
