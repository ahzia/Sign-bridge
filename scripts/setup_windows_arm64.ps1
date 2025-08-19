# Windows ARM64 Setup Script for SignBridge
# This script automates the setup process for Windows ARM64 systems

param(
    [switch]$SkipPrerequisites,
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

Write-Host "🚀 Setting up SignBridge for Windows ARM64..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to add to PATH for current session
function Add-ToPath($path) {
    $env:PATH += ";$path"
    Write-Host "Added $path to PATH" -ForegroundColor Yellow
}

# Check and setup prerequisites
if (-not $SkipPrerequisites) {
    Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan
    
    # Check Python
    if (-not (Test-Command "python")) {
        Write-Host "❌ Python not found in PATH" -ForegroundColor Red
        Write-Host "Please install Python 3.11 from https://www.python.org/downloads/" -ForegroundColor Yellow
        Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
        exit 1
    } else {
        $pythonVersion = python --version
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    }
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    } else {
        $nodeVersion = node --version
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    }
    
    # Check Rust
    if (-not (Test-Command "rustc")) {
        Write-Host "❌ Rust not found" -ForegroundColor Red
        Write-Host "Please install Rust from https://rustup.rs/" -ForegroundColor Yellow
        exit 1
    } else {
        $rustVersion = rustc --version
        Write-Host "✅ Rust found: $rustVersion" -ForegroundColor Green
    }
    
    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Host "❌ npm not found" -ForegroundColor Red
        exit 1
    } else {
        $npmVersion = npm --version
        Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
    }
}

# Setup backend
if (-not $SkipBackend) {
    Write-Host "🐍 Setting up Python backend..." -ForegroundColor Cyan
    
    # Navigate to backend directory
    Set-Location "backend"
    
    # Create virtual environment if it doesn't exist
    if (-not (Test-Path "py311_venv")) {
        Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
        python -m venv py311_venv
    }
    
    # Activate virtual environment
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".\py311_venv\Scripts\Activate.ps1"
    
    # Upgrade pip
    Write-Host "Upgrading pip..." -ForegroundColor Yellow
    python -m pip install --upgrade pip
    
         # Install basic dependencies (Windows ARM64 compatible)
     Write-Host "Installing basic dependencies..." -ForegroundColor Yellow
     pip install fastapi uvicorn python-multipart requests python-dotenv --no-deps
     pip install starlette pydantic click h11 colorama pyyaml watchfiles websockets charset-normalizer idna urllib3 certifi annotated-types pydantic-core typing-inspection anyio sniffio
    
    # Install PyTorch (CPU-only for ARM64)
    Write-Host "Installing PyTorch (CPU-only)..." -ForegroundColor Yellow
    pip install torch --index-url https://download.pytorch.org/whl/cpu --no-deps
    
    # Install numpy
    Write-Host "Installing numpy..." -ForegroundColor Yellow
    pip install numpy
    
    Write-Host "⚠️  Note: Some ML dependencies require Visual Studio Build Tools" -ForegroundColor Yellow
    Write-Host "   - numba, signwriting-translation need compilation" -ForegroundColor Yellow
    Write-Host "   - Install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Yellow
    
    # Return to project root
    Set-Location ".."
}

# Setup frontend
if (-not $SkipFrontend) {
    Write-Host "🎨 Setting up frontend..." -ForegroundColor Cyan
    
    # Navigate to frontend directory
    Set-Location "frontend"
    
    # Install dependencies
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
    
    # Install Tauri CLI globally
    Write-Host "Installing Tauri CLI..." -ForegroundColor Yellow
    npm install -g @tauri-apps/cli
    
    # Test build
    Write-Host "Testing frontend build..." -ForegroundColor Yellow
    npm run build:frontend
    
    # Return to project root
    Set-Location ".."
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Install Visual Studio Build Tools for ML dependencies" -ForegroundColor White
Write-Host "2. Run: cd backend && .\py311_venv\Scripts\Activate.ps1 && pip install git+https://github.com/openai/whisper.git" -ForegroundColor White
Write-Host "3. Run: cd frontend && npm run tauri:dev" -ForegroundColor White
Write-Host ""
Write-Host "🔧 For development:" -ForegroundColor Cyan
Write-Host "   Terminal 1: cd backend && .\py311_venv\Scripts\Activate.ps1 && python run_backend.py" -ForegroundColor White
Write-Host "   Terminal 2: cd frontend && npm run tauri:dev" -ForegroundColor White
Write-Host ""
Write-Host "🏭 For production build:" -ForegroundColor Cyan
Write-Host "   cd frontend && npm run build:production" -ForegroundColor White
