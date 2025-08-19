#!/usr/bin/env python3
"""
Test script to verify Python 3.12 setup and available functionality
"""

import sys
import os

def test_imports():
    """Test that basic imports work"""
    print("Testing basic imports...")

    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False

    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False

    try:
        import torch
        print("✅ PyTorch imported successfully")
        print(f"   PyTorch version: {torch.__version__}")
    except ImportError as e:
        print(f"❌ PyTorch import failed: {e}")
        return False

    try:
        import numpy
        print("✅ NumPy imported successfully")
        print(f"   NumPy version: {numpy.__version__}")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False

    try:
        import signwriting
        print("✅ SignWriting imported successfully")
    except ImportError as e:
        print(f"❌ SignWriting import failed: {e}")
        return False

    try:
        import signwriting_translation
        print("✅ SignWriting Translation imported successfully")
    except ImportError as e:
        print(f"❌ SignWriting Translation import failed: {e}")
        return False

    try:
        import whisper
        print("✅ Whisper imported successfully")
    except ImportError as e:
        print(f"❌ Whisper import failed: {e}")
        return False

    return True

def test_whisper_functionality():
    """Test basic whisper functionality"""
    print("\nTesting Whisper functionality...")
    
    try:
        import whisper
        # Test if we can load a model (this will fail without tiktoken, but we can test the import)
        print("✅ Whisper module accessible")
        
        # Test if we can access basic functions
        if hasattr(whisper, 'load_model'):
            print("✅ Whisper load_model function available")
        else:
            print("⚠️  Whisper load_model function not available")
            
    except Exception as e:
        print(f"❌ Whisper functionality test failed: {e}")
        return False
    
    return True

def test_signwriting_functionality():
    """Test basic SignWriting functionality"""
    print("\nTesting SignWriting functionality...")
    
    try:
        import signwriting
        print("✅ SignWriting module accessible")
        
        # Test if we can access basic functions
        if hasattr(signwriting, 'tokenizer'):
            print("✅ SignWriting tokenizer available")
        else:
            print("⚠️  SignWriting tokenizer not available")
            
    except Exception as e:
        print(f"❌ SignWriting functionality test failed: {e}")
        return False
    
    return True

def test_backend_structure():
    """Test that backend files exist and are accessible"""
    print("\nTesting backend structure...")

    required_files = [
        "main.py",
        "run_backend.py",
        "api/__init__.py",
        "api/pose_generation.py",
        "api/simplify_text.py",
        "api/transcribe.py"
    ]

    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} missing")
            return False

    return True

def test_missing_dependencies():
    """Test what dependencies are missing"""
    print("\nChecking missing dependencies...")
    
    missing_deps = []
    
    try:
        import tiktoken
        print("✅ tiktoken available")
    except ImportError:
        print("❌ tiktoken missing")
        missing_deps.append("tiktoken")
    
    try:
        import numba
        print("✅ numba available")
    except ImportError:
        print("❌ numba missing")
        missing_deps.append("numba")
    
    try:
        import httptools
        print("✅ httptools available")
    except ImportError:
        print("❌ httptools missing")
        missing_deps.append("httptools")
    
    try:
        import tokenizers
        print("✅ tokenizers available")
    except ImportError:
        print("❌ tokenizers missing")
        missing_deps.append("tokenizers")
    
    if missing_deps:
        print(f"\n⚠️  Missing dependencies: {', '.join(missing_deps)}")
        print("   These require compilation and are blocked by Windows ARM64 build issues")
    else:
        print("\n✅ All dependencies available!")
    
    return len(missing_deps) == 0

def main():
    """Run all tests"""
    print("🚀 Testing SignBridge Python 3.12 Setup")
    print("=" * 60)
    print(f"Python version: {sys.version}")
    print("=" * 60)

    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed")
        return False

    # Test functionality
    test_whisper_functionality()
    test_signwriting_functionality()

    # Test backend structure
    if not test_backend_structure():
        print("\n❌ Backend structure tests failed")
        return False

    # Test missing dependencies
    test_missing_dependencies()

    print("\n" + "=" * 60)
    print("✅ Python 3.12 setup test completed!")
    print("\n📋 Current Status:")
    print("   - Python 3.12 environment working")
    print("   - Core dependencies installed and functional")
    print("   - ML packages installed (with missing dependencies)")
    print("   - Backend structure intact")
    print("\n⚠️  Next Steps:")
    print("   1. Install Visual Studio 2022 Community with ARM64 support")
    print("   2. Install missing compilation-dependent packages")
    print("   3. Test full backend functionality")
    print("   4. Build Tauri application")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
