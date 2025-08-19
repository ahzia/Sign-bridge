#!/usr/bin/env python3
"""
Test script to verify basic backend functionality without ML dependencies
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
    except ImportError as e:
        print(f"❌ PyTorch import failed: {e}")
        return False
    
    try:
        import numpy
        print("✅ NumPy imported successfully")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False
    
    return True

def test_basic_fastapi():
    """Test basic FastAPI functionality"""
    print("\nTesting basic FastAPI functionality...")
    
    try:
        from fastapi import FastAPI
        app = FastAPI()
        
        @app.get("/")
        def read_root():
            return {"message": "Hello World"}
        
        print("✅ FastAPI app created successfully")
        return True
    except Exception as e:
        print(f"❌ FastAPI test failed: {e}")
        return False

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

def main():
    """Run all tests"""
    print("🚀 Testing SignBridge Backend Setup")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed")
        return False
    
    # Test FastAPI
    if not test_basic_fastapi():
        print("\n❌ FastAPI tests failed")
        return False
    
    # Test backend structure
    if not test_backend_structure():
        print("\n❌ Backend structure tests failed")
        return False
    
    print("\n" + "=" * 50)
    print("✅ All basic tests passed!")
    print("\n📋 Current Status:")
    print("   - Basic dependencies installed and working")
    print("   - FastAPI framework functional")
    print("   - Backend structure intact")
    print("\n⚠️  Next Steps:")
    print("   1. Install Visual Studio Build Tools")
    print("   2. Install ML dependencies (whisper, signwriting-translation)")
    print("   3. Test full backend functionality")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

