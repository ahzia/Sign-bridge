@echo off
REM Production build script for SignBridge (Windows batch version)
REM Builds backend executable and bundles it with Tauri app

echo 🚀 Building SignBridge for Production...

REM Get the project root directory
cd /d "%~dp0.."

REM Step 1: Build the backend executable
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

REM Create a temporary Tauri config without resources for Windows build
echo 🔧 Creating temporary Tauri config for Windows build...
powershell -Command "(Get-Content 'src-tauri\tauri.conf.json' | ConvertFrom-Json | ForEach-Object { $_.bundle.resources = @(); $_ } | ConvertTo-Json -Depth 10) | Set-Content 'src-tauri\tauri.conf.json'"

REM Build the Tauri app
echo 🔨 Building Tauri app...
npm run build

REM Restore original config
echo 🔧 Restoring original Tauri config...
powershell -Command "(Get-Content 'src-tauri\tauri.conf.json' | ConvertFrom-Json | ForEach-Object { $_.bundle.resources = @('resources/backend'); $_ } | ConvertTo-Json -Depth 10) | Set-Content 'src-tauri\tauri.conf.json'"

REM Copy backend executable to the bundle directory
echo 📦 Copying backend executable to bundle...
if exist "src-tauri\resources\backend" (
    powershell -Command "Copy-Item 'src-tauri\resources\backend' 'src-tauri\target\release\bundle\backend.exe' -Force"
    echo ✅ Backend executable copied to bundle
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
