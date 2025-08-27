@echo off
REM Production build script for SignBridge (Windows batch version)
REM Builds backend executable and bundles it with Tauri app

echo 🚀 Building SignBridge for Production...

REM Get the project root directory
cd /d "%~dp0.."

REM Step 1: Set up production environment if needed
echo 🔧 Setting up production environment...
cd backend
if not exist ".venv_production" (
    echo 📦 Creating production virtual environment...
    powershell -ExecutionPolicy Bypass -File "setup_production.ps1"
) else (
    echo ✅ Production environment already exists
)
cd ..

REM Step 2: Build the backend executable
echo 🔧 Building backend executable...
python scripts/build_backend.py

REM Step 2: Build the Tauri app
echo 🎨 Building Tauri app...
cd frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Build the Tauri app (with backend resources included)
echo 🔨 Building Tauri app...
npm run build

REM Copy backend executable to the bundle directory
echo 📦 Copying backend executable to bundle...
if exist "src-tauri\resources\backend" (
    powershell -Command "Copy-Item 'src-tauri\resources\backend' 'src-tauri\target\release\bundle\backend' -Force"
    echo ✅ Backend executable copied to bundle
    
    REM Also copy to resources directory in the bundle
    if not exist "src-tauri\target\release\bundle\resources" (
        mkdir "src-tauri\target\release\bundle\resources"
    )
    powershell -Command "Copy-Item 'src-tauri\resources\backend' 'src-tauri\target\release\bundle\resources\backend' -Force"
    echo ✅ Backend executable copied to bundle resources
) else (
    echo ⚠️  Backend executable not found
)

echo 🎉 Production build complete!
echo.
echo 📦 Built app location: frontend/src-tauri/target/release/bundle/
echo 🔧 Backend is bundled with the app - no external dependencies required!
echo.
echo ✅ Ready for Windows Store deployment!
pause
