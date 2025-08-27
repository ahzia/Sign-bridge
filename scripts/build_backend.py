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
            # Check if NPU models are available for x64
            project_root = Path(__file__).parent.parent
            models_dir = project_root / "backend" / "models"
            if (models_dir / "WhisperEncoder.onnx").exists() and (models_dir / "WhisperDecoder.onnx").exists():
                return "windows_x64_npu"
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
    if platform_id in ["windows_arm64", "windows_x64_npu"]:
        # Use the production virtual environment for Windows builds
        return backend_dir / ".venv_production" / "Scripts" / "python.exe"
    elif platform_id == "macos":
        # Use the macOS virtual environment
        return backend_dir / "py311_venv" / "bin" / "python"
    else:
        # Fallback to system Python
        return Path(sys.executable)

def get_requirements_file(platform_id):
    """Get the appropriate requirements file based on platform."""
    if platform_id in ["windows_arm64", "windows_x64_npu"]:
        # Use production requirements for optimized builds
        return "requirements_production.txt"
    elif platform_id == "macos":
        return "requirements_main.txt"
    else:
        return "requirements.txt"

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
        'sockeye', 'sockeye.model', 'sockeye.beam_search', 'sockeye.decoder', 
        'sockeye.encoder', 'sockeye.layers', 'sockeye.embeddings', 'sockeye.arguments',
        'sockeye.config', 'sockeye.constants', 'sockeye.inference', 'sockeye.data_io',
        'sockeye.log',
        'pydantic_core', 'numpy', 'tqdm', 'numba'
    ]
    
    if platform_id in ["windows_arm64", "windows_x64_npu"]:
        # Add NPU-specific imports
        base_imports.extend([
            'whisper', 'qai_hub', 'qai_hub_models', 'qai_hub_models.models', 'qai_hub_models.models._shared',
            'qai_hub_models.models._shared.whisper', 'qai_hub_models.models._shared.whisper.model',
            'qai_hub_models.models._shared.whisper.tokenizer', 'qai_hub_models.models._shared.whisper.config',
            'qai_hub_models.models._shared.whisper.app', 'qai_hub_models.models._shared.whisper.utils',
            'qai_hub_models.models._shared.whisper.audio', 'qai_hub_models.models._shared.whisper.decoding',
            'onnxruntime', 'onnxruntime.capi', 'onnxruntime.capi.onnxruntime_pybind11_state',
            'sockeye', 'sockeye.model', 'sockeye.beam_search', 'sockeye.decoder', 'sockeye.encoder', 
            'sockeye.layers', 'sockeye.embeddings', 'sockeye.arguments', 'sockeye.config', 'sockeye.constants', 
            'sockeye.inference', 'sockeye.data_io', 'sockeye.log', 'sockeye.utils', 'sockeye.vocab',
            'signwriting_translation', 'signwriting_translation.model', 'signwriting_translation.data',
            'signwriting_translation.utils', 'signwriting_translation.config',
            'torch', 'torch.nn', 'torch.nn.functional', 'torch.jit', 'torch.jit.script',
            'platform_detector'
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
    ]
    
        # Add essential YAML files directly to the backend directory
    if platform_id in ["windows_arm64", "windows_x64_npu"]:
        import site
        site_packages = site.getsitepackages()[0]
        
        # First try to copy from site-packages
        qai_path = Path(site_packages) / "qai_hub_models"
        yaml_files_copied = False
        
        if qai_path.exists():
            import shutil
            # Copy asset_bases.yaml
            asset_bases_src = qai_path / "asset_bases.yaml"
            asset_bases_dst = backend_dir / "asset_bases.yaml"
            if asset_bases_src.exists():
                shutil.copy2(asset_bases_src, asset_bases_dst)
                data_files.append(('asset_bases.yaml', 'qai_hub_models'))
                print(f"✅ Copied asset_bases.yaml from site-packages to backend directory")
                yaml_files_copied = True
            else:
                print(f"⚠️  asset_bases.yaml not found at {asset_bases_src}")
            
            # Copy devices_and_chipsets.yaml
            devices_src = qai_path / "devices_and_chipsets.yaml"
            devices_dst = backend_dir / "devices_and_chipsets.yaml"
            if devices_src.exists():
                shutil.copy2(devices_src, devices_dst)
                data_files.append(('devices_and_chipsets.yaml', 'qai_hub_models'))
                print(f"✅ Copied devices_and_chipsets.yaml from site-packages to backend directory")
                yaml_files_copied = True
            else:
                print(f"⚠️  devices_and_chipsets.yaml not found at {devices_src}")
        else:
            print(f"⚠️  qai_hub_models directory not found at {qai_path}")
        
        # If not found in site-packages, try to copy from the cloned repository
        if not yaml_files_copied:
            ai_hub_models_path = Path(__file__).parent.parent / "ai-hub-models" / "qai_hub_models"
            if ai_hub_models_path.exists():
                import shutil
                print(f"📁 Found ai-hub-models repository at {ai_hub_models_path}")
                
                # Copy asset_bases.yaml
                asset_bases_src = ai_hub_models_path / "asset_bases.yaml"
                asset_bases_dst = backend_dir / "asset_bases.yaml"
                if asset_bases_src.exists():
                    shutil.copy2(asset_bases_src, asset_bases_dst)
                    data_files.append(('asset_bases.yaml', 'qai_hub_models'))
                    print(f"✅ Copied asset_bases.yaml from ai-hub-models repository to backend directory")
                else:
                    print(f"⚠️  asset_bases.yaml not found at {asset_bases_src}")
                
                # Copy devices_and_chipsets.yaml
                devices_src = ai_hub_models_path / "devices_and_chipsets.yaml"
                devices_dst = backend_dir / "devices_and_chipsets.yaml"
                if devices_src.exists():
                    shutil.copy2(devices_src, devices_dst)
                    data_files.append(('devices_and_chipsets.yaml', 'qai_hub_models'))
                    print(f"✅ Copied devices_and_chipsets.yaml from ai-hub-models repository to backend directory")
                else:
                    print(f"⚠️  devices_and_chipsets.yaml not found at {devices_src}")
            else:
                print(f"⚠️  ai-hub-models repository not found at {ai_hub_models_path}")
                print(f"   Please ensure the ai-hub-models repository is cloned in the project root")
    
    # Add essential source files for TorchScript compilation (minimal set)
    if platform_id in ["windows_arm64", "windows_x64_npu"]:
        # Include only essential source files to avoid memory issues
        import site
        site_packages = site.getsitepackages()[0]
        
        # Add essential YAML and data files - use absolute paths to ensure they're found
        essential_data_files = [
            "qai_hub_models/asset_bases.yaml",
            "qai_hub_models/devices_and_chipsets.yaml"
        ]
        for file_path in essential_data_files:
            full_path = Path(site_packages) / file_path
            if full_path.exists():
                # Use the full path as the source and the relative path as the destination
                data_files.append((str(full_path), "qai_hub_models"))
                print(f"✅ Including essential data file: {file_path}")
            else:
                print(f"⚠️  Missing data file: {file_path}")
        
        # Add all YAML files from qai_hub_models
        qai_yaml_dir = Path(site_packages) / "qai_hub_models"
        if qai_yaml_dir.exists():
            for yaml_file in qai_yaml_dir.rglob("*.yaml"):
                relative_path = yaml_file.relative_to(site_packages)
                data_files.append((str(yaml_file), str(relative_path.parent)))
                print(f"✅ Including QAI YAML: {relative_path}")
        
        # Add all YAML files from qai_hub_models/models
        qai_models_dir = Path(site_packages) / "qai_hub_models" / "models"
        if qai_models_dir.exists():
            for yaml_file in qai_models_dir.rglob("*.yaml"):
                relative_path = yaml_file.relative_to(site_packages)
                data_files.append((str(yaml_file), str(relative_path.parent)))
                print(f"✅ Including QAI model YAML: {relative_path}")
        
        # Create a temporary directory for source files
        temp_src_dir = backend_dir / "temp_src"
        temp_src_dir.mkdir(exist_ok=True)
        
        # Copy all signwriting_translation source files to temp directory
        signwriting_src = Path(site_packages) / "signwriting_translation"
        if signwriting_src.exists():
            signwriting_temp = temp_src_dir / "signwriting_translation"
            signwriting_temp.mkdir(exist_ok=True)
            import shutil
            shutil.copytree(signwriting_src, signwriting_temp, dirs_exist_ok=True)
            data_files.append(('temp_src/signwriting_translation', 'signwriting_translation'))
            print(f"✅ Copied signwriting_translation source to temp directory")
        
        # Copy all sockeye source files to temp directory
        sockeye_src = Path(site_packages) / "sockeye"
        if sockeye_src.exists():
            sockeye_temp = temp_src_dir / "sockeye"
            sockeye_temp.mkdir(exist_ok=True)
            import shutil
            shutil.copytree(sockeye_src, sockeye_temp, dirs_exist_ok=True)
            data_files.append(('temp_src/sockeye', 'sockeye'))
            print(f"✅ Copied sockeye source to temp directory")
        
        # Copy all qai_hub_models source files to temp directory
        qai_src = Path(site_packages) / "qai_hub_models"
        if qai_src.exists():
            qai_temp = temp_src_dir / "qai_hub_models"
            qai_temp.mkdir(exist_ok=True)
            import shutil
            shutil.copytree(qai_src, qai_temp, dirs_exist_ok=True)
            data_files.append(('temp_src/qai_hub_models', 'qai_hub_models'))
            print(f"✅ Copied qai_hub_models source to temp directory")
        
        # Add Whisper assets (tiktoken files)
        whisper_src = Path(site_packages) / "whisper"
        if whisper_src.exists():
            whisper_assets = whisper_src / "assets"
            if whisper_assets.exists():
                # Include the entire whisper directory structure
                data_files.append((str(whisper_src), 'whisper'))
                print(f"✅ Including Whisper package: {whisper_src}")
            else:
                print(f"⚠️  Whisper assets not found at {whisper_assets}")
        else:
            print(f"⚠️  Whisper package not found at {whisper_src}")
    
    # Handle environment file - use .env if it exists, otherwise use env.example
    env_file = '.env' if (backend_dir / '.env').exists() else 'env.example'
    data_files.append((env_file, '.'))
    print(f"✅ Including environment file: {env_file}")
    
    if platform_id in ["windows_arm64", "windows_x64_npu"]:
        # Include all model files, not just essential ones
        models_dir = backend_dir / "models"
        if models_dir.exists():
            for model_file in models_dir.glob("*"):
                if model_file.is_file():
                    relative_path = model_file.relative_to(backend_dir)
                    data_files.append((str(relative_path), 'models'))
                    print(f"✅ Including model: {relative_path}")
        else:
            print("⚠️  Warning: Models directory not found")
    
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
        if platform_id in ["windows_arm64", "windows_x64_npu"]:
            print("   .\\setup_production.ps1")
        elif platform_id == "macos":
            print("   bash setup_py311_env.sh")
        else:
            print("   pip install -r requirements.txt")
        sys.exit(1)
    
    # Check if PyInstaller is already installed (requirements already installed by setup_production.ps1)
    if platform.system() == "Windows":
        # On Windows, check if PyInstaller is already installed
        try:
            subprocess.run(["uv", "run", "--python", str(python_path), "python", "-c", "import pyinstaller"], check=True, capture_output=True)
            print("✅ PyInstaller already installed")
        except subprocess.CalledProcessError:
            print("📦 Installing PyInstaller...")
            subprocess.run(["uv", "pip", "install", "pyinstaller", "--python", str(python_path)], check=True)
    else:
        # On other platforms, install requirements and PyInstaller
        requirements_file = get_requirements_file(platform_id)
        print(f"📦 Installing requirements from {requirements_file}...")
        subprocess.run([str(python_path), "-m", "pip", "install", "-r", requirements_file], check=True)
        
        # Install PyInstaller if not already installed
        print("📦 Installing PyInstaller...")
        subprocess.run([str(python_path), "-m", "pip", "install", "pyinstaller"], check=True)
    
    # Get platform-specific configuration
    hidden_imports = get_hidden_imports(platform_id)
    data_files = get_data_files(backend_dir, platform_id)
    
    # Create PyInstaller spec for standalone executable
    # Disable strip on Windows since the strip utility doesn't exist
    strip_enabled = platform.system() != "Windows"
    
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
    strip={strip_enabled},  # Remove debug symbols to reduce size (disabled on Windows)
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
    strip={strip_enabled},  # Enable debug symbol stripping (disabled on Windows)
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
    
    if platform.system() == "Windows":
        # On Windows, use uv run with the production virtual environment
        subprocess.run(["uv", "run", "--python", str(python_path), "pyinstaller", "backend.spec", "--clean"], check=True)
    else:
        # On other platforms, use the Python executable
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