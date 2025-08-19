# Windows ARM64 Setup Guide for SignBridge

## Overview
This guide provides step-by-step instructions for setting up SignBridge on Windows ARM64 systems. The project requires Python 3.11, Node.js, Rust, and several other dependencies.

## Current System Status
- ✅ Node.js v22.18.0 (installed)
- ✅ npm v10.9.3 (installed)
- ✅ Python 3.11.9 (installed)
- ✅ Rust 1.89.0 (installed)
- ⚠️ Visual Studio Build Tools (needed for some Python packages)
- ⚠️ Some ML dependencies need compilation (numba, signwriting-translation)

## Prerequisites Installation

### 1. Install Python 3.11
**Download from:** https://www.python.org/downloads/release/python-3118/

**For Windows ARM64:**
1. Download `Windows installer (64-bit)` - ARM64 version
2. Run installer as Administrator
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. Verify installation:
   ```powershell
   python --version
   # Should show: Python 3.11.x
   ```

### 2. Install Rust
**Download from:** https://rustup.rs/

1. Open PowerShell as Administrator
2. Run the installer:
   ```powershell
   winget install Rustlang.Rust.MSVC
   ```
   Or download from: https://www.rust-lang.org/tools/install

3. Restart PowerShell after installation
4. Verify installation:
   ```powershell
   rustc --version
   cargo --version
   ```

### 3. Install Visual Studio Build Tools (Required for Rust)
**Download from:** https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

1. Download "Build Tools for Visual Studio 2022"
2. Run installer and select:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK
   - CMake tools for Visual Studio

## Project Setup

### 1. Clone and Navigate to Project
```powershell
cd C:\Users\ahzia\kick-start\Sign-bridge
```

### 2. Setup Python Backend
```powershell
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv py311_venv

# Activate virtual environment
.\py311_venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install backend dependencies (Windows ARM64 compatible)
# Note: requirements.txt contains torch==2.0.1 which is not available for ARM64
# We install dependencies manually to use compatible versions

# Install basic dependencies
pip install fastapi uvicorn python-multipart requests python-dotenv --no-deps
pip install starlette pydantic click h11 colorama pyyaml watchfiles websockets charset-normalizer idna urllib3 certifi annotated-types pydantic-core typing-inspection anyio sniffio

# Install PyTorch (CPU-only for ARM64)
pip install torch --index-url https://download.pytorch.org/whl/cpu --no-deps

# Install numpy
pip install numpy
```

### 3. Setup Frontend
```powershell
# Navigate to frontend directory
cd ..\frontend

# Install Node.js dependencies
npm install

# Install Tauri CLI globally
npm install -g @tauri-apps/cli
```

### 4. Verify Setup
```powershell
# Test backend
cd ..\backend
.\py311_venv\Scripts\Activate.ps1
python run_backend.py
# Should start FastAPI server on http://localhost:8000

# Test frontend (in new PowerShell window)
cd ..\frontend
npm run tauri:dev
# Should open Tauri development window
```

## Development Workflow

### Quick Start (Development)
```powershell
# From project root
.\scripts\start_app.sh
```

### Manual Start (Development)
```powershell
# Terminal 1: Start backend
cd backend
.\py311_venv\Scripts\Activate.ps1
python run_backend.py

# Terminal 2: Start frontend
cd frontend
npm run tauri:dev
```

## Production Build

### Build for Production
```powershell
# From project root
cd frontend
npm run build:production
```

### Build Artifacts Location
```
frontend/src-tauri/target/release/bundle/
├── msi/
│   └── SignBridge_0.1.0_x64_en-US.msi
└── nsis/
    └── SignBridge_0.1.0_x64-setup.exe
```

## Troubleshooting

### Common Issues

#### 1. Python not found
**Solution:** Ensure Python is added to PATH during installation

#### 2. Rust build errors
**Solution:** Install Visual Studio Build Tools with C++ components

#### 3. PyTorch installation issues
**Solution:** Use CPU-only version for ARM64:
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

#### 4. Tauri build errors
**Solution:** Ensure all Rust dependencies are installed:
```powershell
rustup update
cargo install tauri-cli
```

### ARM64-Specific Notes

#### PyTorch Compatibility
- Use CPU-only PyTorch builds for ARM64
- GPU acceleration not available on ARM64 Windows
- Performance may be slower than x64 builds

#### Build Performance
- ARM64 builds may take longer than x64
- Consider using release builds for better performance
- Development builds are slower but faster to compile

## Environment Variables

Create `.env` file in backend directory:
```env
# Optional: Groq API for text simplification
GROQ_API_KEY=your_groq_api_key_here

# Optional: HuggingFace token for model downloads
HUGGINGFACE_TOKEN=your_token_here
```

## Current Setup Status

### ✅ Completed:
- Python 3.11.9 installed and working
- Rust 1.89.0 installed and working
- Node.js v22.18.0 and npm v10.9.3 working
- Frontend dependencies installed
- Frontend builds successfully
- Basic backend dependencies installed (FastAPI, PyTorch, numpy)

### ⚠️ Pending:
- Visual Studio Build Tools needed for ML dependencies
- signwriting-translation package (requires older PyTorch version)
- whisper package (requires compilation)
- numba package (requires compilation)

## Quick Setup Script

Run the automated setup script:
```powershell
.\scripts\setup_windows_arm64.ps1
```

## Next Steps

### 1. Install Visual Studio Build Tools (Required)
**Download from:** https://visualstudio.microsoft.com/visual-cpp-build-tools/

1. Download "Build Tools for Visual Studio 2022"
2. Run installer and select:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK
   - CMake tools for Visual Studio

### 2. Complete Backend Setup
```powershell
cd backend
.\py311_venv\Scripts\Activate.ps1
pip install git+https://github.com/openai/whisper.git
```

### 3. Test Development Setup
```powershell
# Terminal 1: Start backend
cd backend
.\py311_venv\Scripts\Activate.ps1
python run_backend.py

# Terminal 2: Start frontend
cd frontend
npm run tauri:dev
```

### 4. Build for Production
```powershell
cd frontend
npm run build:production
```

## Troubleshooting

### ML Dependencies Issues
- **Problem**: numba, signwriting-translation fail to install
- **Solution**: Install Visual Studio Build Tools with C++ components

### PyTorch Version Conflicts
- **Problem**: requirements.txt specifies torch==2.0.1 which is not available for ARM64
- **Solution**: Use CPU-only PyTorch builds for ARM64 compatibility
- **Problem**: signwriting-translation requires PyTorch <=2.3.1
- **Solution**: Use CPU-only PyTorch builds for ARM64 compatibility

### Network Issues
- **Problem**: pip/npm downloads fail
- **Solution**: Check internet connection, try using VPN if needed

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the plan files in the `plan/` directory
3. Check GitHub issues for known problems
4. Ensure all dependencies are properly installed

