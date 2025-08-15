@echo off
echo 🚀 Building SignBridge for Production...

cd /d "%~dp0.."

echo 🔧 Building backend executable...
python scripts/build_backend.py

echo 🎨 Building Tauri app...
cd frontend

if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

echo 🔨 Building Tauri app...
npm run build

echo 🎉 Production build complete!
echo.
echo 📦 Built app location: frontend/src-tauri/target/release/bundle/
echo 🔧 Backend is bundled with the app - no external dependencies required!
echo.
echo ✅ Ready for Windows Store deployment!
pause
