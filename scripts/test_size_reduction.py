#!/usr/bin/env python3
"""
Test script to compare backend sizes before and after optimization
"""

import os
import sys
from pathlib import Path

def get_file_size_mb(file_path):
    """Get file size in MB."""
    if not file_path.exists():
        return 0
    return file_path.stat().st_size / (1024 * 1024)

def analyze_backend_size():
    """Analyze the current backend size and model files."""
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    models_dir = backend_dir / "models"
    dist_dir = backend_dir / "dist"
    
    print("🔍 Backend Size Analysis")
    print("=" * 50)
    
    # Check if backend executable exists
    if platform.system() == "Windows":
        backend_exe = dist_dir / "backend.exe"
    else:
        backend_exe = dist_dir / "backend"
    
    if backend_exe.exists():
        size_mb = get_file_size_mb(backend_exe)
        print(f"📦 Backend Executable: {size_mb:.1f} MB")
    else:
        print("❌ Backend executable not found. Run build first.")
        return
    
    # Analyze model files
    print("\n📁 Model Files Analysis:")
    print("-" * 30)
    
    essential_models = [
        "WhisperEncoder.onnx",
        "WhisperDecoder.onnx"
    ]
    
    unnecessary_models = [
        "WhisperEncoder_ctx_onnx1.22.0_e2f7d18c5548d5e5714d391d8ad3f208.onnx",
        "WhisperEncoder_ctx_onnx1.22.0_e2f7d18c5548d5e5714d391d8ad3f208_qnn.bin",
        "WhisperDecoder_ctx_onnx1.22.0_b709713e0cb5933c00feb6a17e40cd32.onnx",
        "WhisperDecoder_ctx_onnx1.22.0_b709713e0cb5933c00feb6a17e40cd32_qnn.bin"
    ]
    
    total_essential = 0
    total_unnecessary = 0
    
    print("✅ Essential Models (included in build):")
    for model in essential_models:
        model_path = models_dir / model
        if model_path.exists():
            size_mb = get_file_size_mb(model_path)
            total_essential += size_mb
            print(f"   {model}: {size_mb:.1f} MB")
        else:
            print(f"   {model}: ❌ Not found")
    
    print("\n❌ Unnecessary Models (excluded from build):")
    for model in unnecessary_models:
        model_path = models_dir / model
        if model_path.exists():
            size_mb = get_file_size_mb(model_path)
            total_unnecessary += size_mb
            print(f"   {model}: {size_mb:.1f} MB")
        else:
            print(f"   {model}: ❌ Not found")
    
    print(f"\n📊 Summary:")
    print(f"   Essential models: {total_essential:.1f} MB")
    print(f"   Unnecessary models: {total_unnecessary:.1f} MB")
    print(f"   Potential savings: {total_unnecessary:.1f} MB")
    
    # Calculate potential size reduction
    if backend_exe.exists():
        current_size = get_file_size_mb(backend_exe)
        estimated_new_size = current_size - total_unnecessary
        reduction_percent = (total_unnecessary / current_size) * 100
        
        print(f"\n🎯 Size Reduction Estimate:")
        print(f"   Current size: {current_size:.1f} MB")
        print(f"   Estimated new size: {estimated_new_size:.1f} MB")
        print(f"   Reduction: {reduction_percent:.1f}%")

if __name__ == "__main__":
    import platform
    analyze_backend_size()

