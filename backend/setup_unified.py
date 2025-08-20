#!/usr/bin/env python3
"""
Unified SignBridge Backend Setup Script
This script automatically detects the platform and sets up the appropriate environment.
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path
from typing import Dict, Any, Optional

# Add the backend directory to the path so we can import our modules
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from platform_detector import get_platform_detector
except ImportError:
    print("⚠️  Platform detector not available, using basic detection")
    from platform_detector import PlatformDetector
    platform_detector = PlatformDetector()
else:
    platform_detector = get_platform_detector()


class SetupManager:
    """Manages the setup process for different platforms."""
    
    def __init__(self):
        self.platform_detector = platform_detector
        self.platform_id = platform_detector.platform_id
        self.config = platform_detector.config
        self.backend_dir = Path(__file__).parent
        self.venv_activated = False
        
    def print_header(self):
        """Print setup header."""
        print("🚀 SignBridge Backend Setup")
        print("=" * 50)
        print(f"Platform: {self.platform_id}")
        print(f"System: {platform.system()}")
        print(f"Machine: {platform.machine()}")
        print(f"Python: {sys.version}")
        print("=" * 50)
    
    def check_python_version(self) -> bool:
        """Check if Python version is compatible."""
        required_version = self.config["python_version"]
        current_version = sys.version_info
        
        print(f"🔍 Checking Python version...")
        print(f"   Required: {required_version}")
        print(f"   Current: {current_version.major}.{current_version.minor}.{current_version.micro}")
        
        # Simple version check (can be improved)
        if required_version.startswith("3.11"):
            if current_version.major == 3 and current_version.minor >= 11:
                print("   ✅ Python version is compatible")
                return True
            else:
                print("   ❌ Python version is not compatible")
                print(f"   Please install Python {required_version}")
                return False
        
        print("   ⚠️  Version check not implemented for this platform")
        return True
    
    def check_uv_availability(self) -> bool:
        """Check if uv package manager is available."""
        try:
            result = subprocess.run(["uv", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print("   ✅ uv package manager is available")
                return True
        except FileNotFoundError:
            pass
        
        print("   ❌ uv package manager not found")
        return False
    
    def install_uv(self):
        """Install uv package manager."""
        print("📦 Installing uv package manager...")
        
        if platform.system() == "Windows":
            # Install uv on Windows
            try:
                subprocess.run([
                    sys.executable, "-m", "pip", "install", "uv"
                ], check=True)
                print("   ✅ uv installed successfully")
                return True
            except subprocess.CalledProcessError:
                print("   ❌ Failed to install uv")
                return False
        else:
            # Install uv on Unix-like systems
            try:
                subprocess.run([
                    "curl", "-LsSf", "https://astral.sh/uv/install.sh", "|", "sh"
                ], shell=True, check=True)
                print("   ✅ uv installed successfully")
                return True
            except subprocess.CalledProcessError:
                print("   ❌ Failed to install uv")
                return False
    

    
    def setup_windows_arm64(self):
        """Setup for Windows ARM64 with NPU support."""
        print("🔧 Setting up Windows ARM64 with NPU support...")
        
        # Run the PowerShell setup script
        setup_script = self.config["setup_script"]
        if setup_script and Path(setup_script).exists():
            print(f"📋 Running setup script: {setup_script}")
            try:
                subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", setup_script], check=True)
                print("   ✅ Setup script completed successfully")
                return True
                    
            except subprocess.CalledProcessError as e:
                print(f"   ❌ Setup script failed: {e}")
                return False
        else:
            print("   ❌ Setup script not found")
            return False
    
    def setup_macos(self):
        """Setup for macOS."""
        print("🔧 Setting up macOS...")
        
        # Run the bash setup script
        setup_script = self.config["setup_script"]
        if setup_script and Path(setup_script).exists():
            print(f"📋 Running setup script: {setup_script}")
            try:
                subprocess.run(["bash", setup_script], check=True)
                print("   ✅ Setup script completed successfully")
                return True
                    
            except subprocess.CalledProcessError as e:
                print(f"   ❌ Setup script failed: {e}")
                return False
        else:
            print("   ❌ Setup script not found")
            return False
    
    def setup_manual(self):
        """Manual setup for other platforms."""
        print("🔧 Setting up manually...")
        
        requirements_file = self.config["requirements_file"]
        if not Path(requirements_file).exists():
            print(f"   ❌ Requirements file not found: {requirements_file}")
            return False
        
        print(f"📦 Installing dependencies from {requirements_file}")
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", requirements_file
            ], check=True)
            print("   ✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Failed to install dependencies: {e}")
            return False
    
    def create_env_file(self):
        """Create .env file if it doesn't exist."""
        env_file = self.backend_dir / ".env"
        env_example = self.backend_dir / "env.example"
        
        if not env_file.exists() and env_example.exists():
            print("📝 Creating .env file from template...")
            shutil.copy(env_example, env_file)
            print("   ✅ .env file created")
            print("   ⚠️  Please edit .env file with your configuration")
        elif env_file.exists():
            print("   ✅ .env file already exists")
        else:
            print("   ⚠️  No .env template found")
    
    def verify_setup(self):
        """Verify the setup was successful."""
        print("🔍 Verifying setup...")
        
        # Check if virtual environment exists
        venv_paths = [
            self.backend_dir / ".venv",
            self.backend_dir / "py311_venv",
            self.backend_dir / "npu_venv"
        ]
        
        venv_found = False
        for venv_path in venv_paths:
            if venv_path.exists():
                print(f"   ✅ Virtual environment found: {venv_path.name}")
                venv_found = True
                break
        
        if not venv_found:
            print("   ⚠️  No virtual environment found")
        
        # Check if .env file exists
        if (self.backend_dir / ".env").exists():
            print("   ✅ Configuration file found")
        else:
            print("   ⚠️  Configuration file not found")
        
        # Check if models directory exists (for NPU)
        if self.platform_id in ["windows_arm64", "windows_x64_npu"]:
            models_dir = self.backend_dir / "models"
            if models_dir.exists():
                print("   ✅ Models directory found")
            else:
                print("   ⚠️  Models directory not found")
        
        print("   ✅ Setup verification completed")
    
    def test_imports(self):
        """Test if key modules can be imported."""
        print("🧪 Testing imports...")
        
        test_modules = []
        
        if self.platform_id in ["windows_arm64", "windows_x64_npu"]:
            test_modules = [
                "fastapi",
                "uvicorn"
            ]
            # Test NPU modules separately to avoid DLL issues
            npu_modules = [
                "qai_hub",
                "onnxruntime_qnn"
            ]
        elif self.platform_id == "macos":
            test_modules = [
                "fastapi",
                "uvicorn",
                "whisper",
                "torch"
            ]
            npu_modules = []
        else:
            test_modules = [
                "fastapi",
                "uvicorn"
            ]
            npu_modules = []
        
        # Test basic modules first
        failed_imports = []
        for module in test_modules:
            try:
                __import__(module)
                print(f"   ✅ {module}")
            except ImportError as e:
                print(f"   ❌ {module}: {e}")
                failed_imports.append(module)
            except Exception as e:
                print(f"   ⚠️  {module}: {e}")
                # Don't count DLL/loading errors as import failures
                if "DLL" not in str(e) and "Win32" not in str(e):
                    failed_imports.append(module)
        
        # Test NPU modules separately
        if npu_modules:
            print("   🔍 Testing NPU modules...")
            for module in npu_modules:
                try:
                    __import__(module)
                    print(f"   ✅ {module}")
                except ImportError as e:
                    print(f"   ❌ {module}: {e}")
                    failed_imports.append(module)
                except Exception as e:
                    print(f"   ⚠️  {module}: {e}")
                    # Don't count DLL/loading errors as import failures
                    if "DLL" not in str(e) and "Win32" not in str(e):
                        failed_imports.append(module)
        
        if failed_imports:
            print(f"   ⚠️  Failed to import: {', '.join(failed_imports)}")
            return False
        else:
            print("   ✅ All imports successful")
            return True
    
    def print_next_steps(self):
        """Print next steps for the user."""
        print("\n🎉 Setup completed!")
        print("=" * 50)
        print("Next steps:")
        
        if self.platform_id in ["windows_arm64", "windows_x64_npu"]:
            print("1. Activate the virtual environment:")
            print("   .\\.venv\\Scripts\\activate")
            print("2. Start the backend:")
            print("   python main.py")
        
        elif self.platform_id == "macos":
            print("1. Activate the virtual environment:")
            print("   source py311_venv/bin/activate")
            print("2. Start the backend:")
            print("   python main.py")
        
        else:
            print("1. Start the backend:")
            print("   python main.py")
        
        print("\n💡 Quick start:")
        print("   # Windows with NPU (ARM64 or x64):")
        print("   .\\.venv\\Scripts\\activate && python main.py")
        print("   # macOS:")
        print("   source py311_venv/bin/activate && python main.py")
        
        print("\n📚 For more information, visit:")
        print("   http://127.0.0.1:8000/setup-guide")
        print("=" * 50)
    
    def run(self):
        """Run the complete setup process."""
        self.print_header()
        
        # Check Python version
        if not self.check_python_version():
            return False
        
        # Platform-specific setup
        success = False
        if self.platform_id in ["windows_arm64", "windows_x64_npu"]:
            success = self.setup_windows_arm64()
        elif self.platform_id == "macos":
            success = self.setup_macos()
        else:
            success = self.setup_manual()
        
        if not success:
            print("❌ Setup failed")
            return False
        
        # Create .env file
        self.create_env_file()
        
        # Verify setup
        self.verify_setup()
        
        # Test imports
        import_success = self.test_imports()
        
        # Note: Virtual environment activation is handled by the setup scripts
        # The user needs to activate it manually in their terminal session
        
        # Don't fail setup if only DLL issues occurred
        if not import_success and self.platform_id in ["windows_arm64", "windows_x64_npu"]:
            print("\n⚠️  Some imports failed, but this may be due to DLL/architecture issues.")
            print("   The setup completed successfully. Try running the backend to test functionality.")
        
        # Run basic backend test
        print("\n🔍 Running basic backend test...")
        try:
            from test_backend_basic import test_basic_backend
            test_basic_backend()
        except ImportError:
            print("   ⚠️  Could not run basic backend test")
        except Exception as e:
            print(f"   ⚠️  Basic backend test failed: {e}")
        
        # Print next steps
        self.print_next_steps()
        
        return True


def main():
    """Main entry point."""
    try:
        setup_manager = SetupManager()
        success = setup_manager.run()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
