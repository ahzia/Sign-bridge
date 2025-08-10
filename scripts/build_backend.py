#!/usr/bin/env python3
"""
Build script for SignBridge backend
Creates a standalone executable that can be bundled with Tauri
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def main():
    print("🔧 Building SignBridge Backend...")
    
    # Get the project root
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Activate virtual environment
    if platform.system() == "Windows":
        python_path = backend_dir / "py311_venv" / "Scripts" / "python.exe"
    else:
        python_path = backend_dir / "py311_venv" / "bin" / "python"
    
    if not python_path.exists():
        print("❌ Python virtual environment not found. Please run setup first.")
        sys.exit(1)
    
    # Install PyInstaller if not already installed
    print("📦 Installing PyInstaller...")
    subprocess.run([str(python_path), "-m", "pip", "install", "pyinstaller"], check=True)
    
    # Create PyInstaller spec for standalone executable
    spec_content = f'''# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['run_backend.py'],
    pathex=[],
    binaries=[],
    datas=[('main.py', '.'), ('api', 'api')],
    hiddenimports=[
        'fastapi', 'fastapi.middleware.cors', 'fastapi.middleware', 
        'fastapi.encoders', 'fastapi.dependencies', 'fastapi.security',
        'starlette', 'starlette.middleware', 'starlette.middleware.cors',
        'starlette.routing', 'starlette.responses', 'starlette.background',
        'starlette.concurrency', 'starlette.datastructures', 'starlette.types',
        'uvicorn', 'uvicorn.protocols', 'uvicorn.protocols.http',
        'uvicorn.protocols.websockets', 'uvicorn.lifespan', 'pydantic',
        'typing_extensions', 'python_multipart', 'requests', 'dotenv',
        'dotenv.main', 'jinja2', 'anyio', 'h11', 'torch', 'torch._C',
        'signwriting_translation', 'signwriting_translation.bin', 'whisper',
        'pydantic_core', 'numpy', 'tqdm', 'numba'
    ],
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
        target = tauri_resources / "backend.exe"
    else:
        source = dist_dir / "backend"
        target = tauri_resources / "backend"
    
    if source.exists():
        import shutil
        shutil.copy2(source, target)
        print(f"✅ Backend executable copied to {target}")
    else:
        print(f"❌ Backend executable not found at {source}")
        sys.exit(1)
    
    print("🎉 Backend build complete!")

if __name__ == "__main__":
    main() 