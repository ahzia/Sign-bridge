#!/usr/bin/env python3
"""
OCR Test Runner - Run all OCR tests and provide summary
"""

import subprocess
import sys
import os
from datetime import datetime

def run_test(test_file, test_name):
    """Run a single test file"""
    print(f"\n🧪 Running {test_name}...")
    print("=" * 60)
    
    try:
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Test completed successfully")
            print(result.stdout)
            return True, result.stdout
        else:
            print("❌ Test failed")
            print(result.stdout)
            if result.stderr:
                print("Error output:")
                print(result.stderr)
            return False, result.stdout + result.stderr
            
    except subprocess.TimeoutExpired:
        print("⏰ Test timed out after 60 seconds")
        return False, "Test timed out"
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return False, str(e)

def create_test_image():
    """Create test image if it doesn't exist"""
    if not os.path.exists("test4.png"):
        print("📷 Creating test image...")
        try:
            subprocess.run([sys.executable, "create_test_image.py"], 
                         check=True, capture_output=True)
            print("✅ Test image created")
        except subprocess.CalledProcessError:
            print("⚠️  Could not create test image - tests may fail")

def main():
    """Run all OCR tests"""
    print("🚀 OCR Test Suite Runner")
    print("=" * 80)
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create test image if needed
    create_test_image()
    
    # Define tests to run
    tests = [
        ("test_ocr_status.py", "OCR Status Test"),
        ("test_ocr_simple.py", "OCR Simple Test"),
        ("test_ocr_integration.py", "OCR Integration Test")
    ]
    
    results = []
    
    for test_file, test_name in tests:
        if os.path.exists(test_file):
            success, output = run_test(test_file, test_name)
            results.append((test_name, success, output))
        else:
            print(f"⚠️  Test file not found: {test_file}")
            results.append((test_name, False, "Test file not found"))
    
    # Summary
    print(f"\n📊 Test Results Summary")
    print("=" * 80)
    
    passed = 0
    total = len(results)
    
    for test_name, success, output in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\n🎯 Overall Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All OCR tests passed!")
        print("💡 The OCR functionality is working perfectly!")
        return True
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        print("\n💡 Troubleshooting tips:")
        print("   1. Make sure the backend server is running on port 8000")
        print("   2. Check that OCR model files exist in backend/models/ocr/")
        print("   3. Verify ONNX Runtime QNN is properly installed")
        print("   4. Ensure test image exists (run create_test_image.py)")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
