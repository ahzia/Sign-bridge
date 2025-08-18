@echo off
echo 🚀 Starting SignBridge...

cd /d "%~dp0.."

echo 🔧 Starting backend...
cd backend
call py311_venv\Scripts\activate.bat
start /B python run_backend.py
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🎨 Starting Tauri frontend...
cd frontend
start /B npm run tauri:dev
cd ..

echo 🎉 SignBridge started successfully!
echo 📱 Tauri app should open automatically
echo 🔧 Backend running on http://127.0.0.1:8000
echo 🌐 Frontend running on http://localhost:5173
echo.
echo Press any key to exit...
pause >nul

