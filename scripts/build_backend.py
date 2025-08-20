#!/usr/bin/env python3
"""
Build script for SignBridge backend
Creates a standalone executable that can be bundled with Tauri
Supports platform-specific builds with NPU and standard Whisper implementations
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def detect_platform():
    """Detect the current platform for build configuration."""
    system = platform.system()
    machine = platform.machine()
    
    if system == "Windows":
        if machine == "ARM64":
            return "windows_arm64"
        else:
            return "windows_x64"
    elif system == "Darwin":
        return "macos"
    elif system == "Linux":
        return "linux"
    else:
        return "unknown"

def get_python_path(backend_dir, platform_id):
    """Get the appropriate Python path based on platform."""
    if platform_id == "windows_arm64":
        # Use the NPU virtual environment
        return backend_dir / ".venv" / "Scripts" / "python.exe"
    elif platform_id == "macos":
        # Use the macOS virtual environment
        return backend_dir / "py311_venv" / "bin" / "python"
    else:
        # Fallback to system Python
        return sys.executable

def get_hidden_imports(platform_id):
    """Get platform-specific hidden imports for PyInstaller."""
    base_imports = [
        'fastapi', 'fastapi.middleware.cors', 'fastapi.middleware', 
        'fastapi.encoders', 'fastapi.dependencies', 'fastapi.security',
        'starlette', 'starlette.middleware', 'starlette.middleware.cors',
        'starlette.routing', 'starlette.responses', 'starlette.background',
        'starlette.concurrency', 'starlette.datastructures', 'starlette.types',
        'uvicorn', 'uvicorn.protocols', 'uvicorn.protocols.http',
        'uvicorn.protocols.websockets', 'uvicorn.lifespan', 'pydantic',
        'typing_extensions', 'python_multipart', 'requests', 'dotenv',
        'dotenv.main', 'jinja2', 'anyio', 'h11', 'torch', 'torch._C',
        'signwriting_translation', 'signwriting_translation.bin',
        'pydantic_core', 'numpy', 'tqdm', 'numba'
    ]
    
    if platform_id == "windows_arm64":
        # Add NPU-specific imports
        base_imports.extend([
            'whisper', 'qai_hub', 'qai_hub_models', 'onnxruntime_qnn',
            'onnxruntime', 'platform_detector'
        ])
    elif platform_id == "macos":
        # Add standard Whisper imports
        base_imports.extend([
            'whisper', 'openai_whisper', 'platform_detector'
        ])
    else:
        # Add basic imports for other platforms
        base_imports.extend([
            'platform_detector'
        ])
    
    return base_imports

def get_data_files(backend_dir, platform_id):
    """Get platform-specific data files for PyInstaller."""
    data_files = [
        ('main.py', '.'),
        ('platform_detector.py', '.'),
        ('api', 'api'),
        ('config.py', '.'),
        ('env.example', '.')
    ]
    
    if platform_id == "windows_arm64":
        # Add NPU model files
        models_dir = backend_dir / "models"
        if models_dir.exists():
            data_files.append(('models', 'models'))
    
    return data_files

def main():
    print("🔧 Building SignBridge Backend...")
    
    # Detect platform
    platform_id = detect_platform()
    print(f"📍 Platform: {platform_id}")
    
    # Get the project root
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Get Python path
    python_path = get_python_path(backend_dir, platform_id)
    
    if not python_path.exists():
        print(f"❌ Python environment not found at {python_path}")
        print("Please run the setup script first:")
        if platform_id == "windows_arm64":
            print("   python setup_unified.py")
        elif platform_id == "macos":
            print("   bash setup_py311_env.sh")
        else:
            print("   pip install -r requirements.txt")
        sys.exit(1)
    
    # Install PyInstaller if not already installed
    print("📦 Installing PyInstaller...")
    subprocess.run([str(python_path), "-m", "pip", "install", "pyinstaller"], check=True)
    
    # Get platform-specific configuration
    hidden_imports = get_hidden_imports(platform_id)
    data_files = get_data_files(backend_dir, platform_id)
    
    # Create PyInstaller spec for standalone executable
    spec_content = f'''# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas={data_files},
    hiddenimports={hidden_imports},
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
'''
    
    # Write the spec file
    spec_file = backend_dir / "backend.spec"
    with open(spec_file, 'w') as f:
        f.write(spec_content)
    
    # Build the executable
    print("🔨 Building executable...")
    subprocess.run([str(python_path), "-m", "PyInstaller", "backend.spec", "--clean"], check=True)
    
    # Copy the executable to the Tauri resources directory
    dist_dir = backend_dir / "dist"
    tauri_resources = project_root / "frontend" / "src-tauri" / "resources"
    
    # Create resources directory if it doesn't exist
    tauri_resources.mkdir(exist_ok=True)
    
    # Copy the executable
    if platform.system() == "Windows":
        source = dist_dir / "backend.exe"
        target = tauri_resources / "backend"
    else:
        source = dist_dir / "backend"
        target = tauri_resources / "backend"
    
    if source.exists():
        import shutil
        shutil.copy2(source, target)
        print(f"✅ Backend executable copied to {target}")
        
        # Print platform-specific information
        if platform_id == "windows_arm64":
            print("🔧 Built with NPU acceleration support")
        elif platform_id == "macos":
            print("🔧 Built with standard Whisper support")
        else:
            print("🔧 Built with limited functionality")
    else:
        print(f"❌ Backend executable not found at {source}")
        sys.exit(1)
    
    print("🎉 Backend build complete!")

if __name__ == "__main__":
    main() 