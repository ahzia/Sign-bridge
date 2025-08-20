#!/usr/bin/env python3
"""
Unified SignBridge Start Script
This script provides a cross-platform way to start SignBridge with platform-specific optimizations.
"""

import os
import sys
import subprocess
import platform
import time
import signal
import threading
from pathlib import Path

# Add the backend directory to the path
project_root = Path(__file__).parent.parent
backend_dir = project_root / "backend"
sys.path.insert(0, str(backend_dir))

try:
    from platform_detector import get_platform_detector
except ImportError:
    print("❌ Platform detector not available")
    print("Please ensure you have run the setup script first")
    sys.exit(1)


class SignBridgeStarter:
    """Manages the startup process for SignBridge."""
    
    def __init__(self):
        self.platform_detector = get_platform_detector()
        self.platform_id = self.platform_detector.platform_id
        self.backend_process = None
        self.frontend_process = None
        
    def print_header(self):
        """Print startup header."""
        print("🚀 SignBridge Unified Starter")
        print("=" * 50)
        print(f"📍 Platform: {self.platform_id}")
        print(f"📍 System: {platform.system()} {platform.machine()}")
        print(f"📍 Whisper: {self.platform_detector.config['whisper_implementation']}")
        print("=" * 50)
    
    def check_environment(self):
        """Check if the environment is properly set up."""
        print("🔍 Checking environment...")
        
        # Check backend directory
        if not backend_dir.exists():
            print("❌ Backend directory not found")
            return False
        
        # Check virtual environment
        venv_found = False
        if self.platform_id == "windows_arm64":
            venv_path = backend_dir / ".venv"
            if venv_path.exists():
                print("✅ NPU virtual environment found")
                venv_found = True
        elif self.platform_id == "macos":
            venv_path = backend_dir / "py311_venv"
            if venv_path.exists():
                print("✅ macOS virtual environment found")
                venv_found = True
        else:
            print("⚠️  No platform-specific virtual environment required")
            venv_found = True
        
        if not venv_found:
            print("❌ Virtual environment not found")
            print("Please run the setup script first:")
            print("   python setup_unified.py")
            return False
        
        # Check frontend
        frontend_dir = project_root / "frontend"
        if not frontend_dir.exists():
            print("❌ Frontend directory not found")
            return False
        
        package_json = frontend_dir / "package.json"
        if not package_json.exists():
            print("❌ Frontend package.json not found")
            return False
        
        print("✅ Environment check passed")
        return True
    
    def start_backend(self):
        """Start the backend server."""
        print("🔧 Starting backend...")
        
        # Change to backend directory
        os.chdir(backend_dir)
        
        # Activate virtual environment and start backend
        if self.platform_id == "windows_arm64":
            # Windows ARM64 with NPU
            activate_script = backend_dir / ".venv" / "Scripts" / "activate.bat"
            if os.name == 'nt':  # Windows
                cmd = f'call "{activate_script}" && python main.py'
                self.backend_process = subprocess.Popen(cmd, shell=True)
            else:
                # Cross-platform fallback
                python_path = backend_dir / ".venv" / "Scripts" / "python.exe"
                self.backend_process = subprocess.Popen([str(python_path), "main.py"])
        
        elif self.platform_id == "macos":
            # macOS with standard Whisper
            python_path = backend_dir / "py311_venv" / "bin" / "python"
            self.backend_process = subprocess.Popen([str(python_path), "main.py"])
        
        else:
            # Other platforms
            self.backend_process = subprocess.Popen([sys.executable, "main.py"])
        
        print("✅ Backend started")
        return True
    
    def wait_for_backend(self, timeout=30):
        """Wait for backend to be ready."""
        print("⏳ Waiting for backend to start...")
        
        import requests
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get("http://127.0.0.1:8000/health", timeout=1)
                if response.status_code == 200:
                    print("✅ Backend is ready")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            time.sleep(1)
        
        print("❌ Backend failed to start within timeout")
        return False
    
    def start_frontend(self):
        """Start the Tauri frontend."""
        print("🎨 Starting frontend...")
        
        # Change to frontend directory
        frontend_dir = project_root / "frontend"
        os.chdir(frontend_dir)
        
        # Install dependencies if needed
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], check=True)
        
        # Start Tauri development server
        self.frontend_process = subprocess.Popen(["npm", "run", "tauri:dev"])
        print("✅ Frontend started")
        return True
    
    def print_status(self):
        """Print status information."""
        print("\n🎉 SignBridge started successfully!")
        print("=" * 50)
        print("📱 Tauri app should open automatically")
        print("🔧 Backend running on http://127.0.0.1:8000")
        print("🌐 Frontend running on http://localhost:5173")
        print("📚 API docs: http://127.0.0.1:8000/docs")
        print("🔍 Health check: http://127.0.0.1:8000/health")
        print("=" * 50)
        print("Press Ctrl+C to stop all services")
    
    def cleanup(self):
        """Clean up processes on exit."""
        print("\n🛑 Stopping SignBridge...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
        
        print("✅ SignBridge stopped")
    
    def run(self):
        """Run the complete startup process."""
        try:
            self.print_header()
            
            if not self.check_environment():
                return False
            
            if not self.start_backend():
                return False
            
            if not self.wait_for_backend():
                return False
            
            if not self.start_frontend():
                return False
            
            self.print_status()
            
            # Wait for user interrupt
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
            
            return True
            
        except Exception as e:
            print(f"❌ Error starting SignBridge: {e}")
            return False
        finally:
            self.cleanup()


def main():
    """Main entry point."""
    starter = SignBridgeStarter()
    success = starter.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
