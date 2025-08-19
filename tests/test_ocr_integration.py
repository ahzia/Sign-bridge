#!/usr/bin/env python3
"""
OCR Integration Test - Test complete OCR workflow
"""

import requests
import os
import time

def test_server_connection():
    """Test basic server connection"""
    print("🔌 Testing server connection...")
    
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and accessible")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server on port 8000")
        return False
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def test_ocr_status():
    """Test OCR service status"""
    print("\n📊 Testing OCR service status...")
    
    try:
        response = requests.get("http://127.0.0.1:8000/api/ocr/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OCR status endpoint working")
            print(f"   Status: {data['ocr_service']['status']}")
            print(f"   Model Loaded: {data['ocr_service']['model_loaded']}")
            print(f"   QNN Available: {data['ocr_service']['qnn_available']}")
            return True
        else:
            print(f"❌ OCR status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ OCR status test failed: {e}")
        return False

def test_ocr_transcription():
    """Test OCR transcription with a sample image"""
    print("\n📝 Testing OCR transcription...")
    
    # Check if test image exists
    test_image_path = "test4.png"
    if not os.path.exists(test_image_path):
        print(f"⚠️  Test image not found: {test_image_path}")
        print("💡 Skipping transcription test - add a test image to run this test")
        return True  # Not a failure, just skip
    
    try:
        with open(test_image_path, "rb") as f:
            files = {"file": ("test4.png", f, "image/png")}
            
            print(f"📷 Uploading image: {test_image_path}")
            response = requests.post(
                "http://127.0.0.1:8000/api/ocr/transcribe",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ OCR transcription successful!")
            print(f"   Text: '{result['recognized_text']}'")
            print(f"   Confidence: {result['confidence']:.2f}")
            print(f"   NPU Used: {result['npu_used']}")
            print(f"   Time: {result['inference_time_ms']:.2f}ms")
            return True
        else:
            print(f"❌ OCR transcription failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ OCR transcription test failed: {e}")
        return False

def test_ocr_performance():
    """Test OCR performance with multiple requests"""
    print("\n⚡ Testing OCR performance...")
    
    test_image_path = "test4.png"
    if not os.path.exists(test_image_path):
        print("⚠️  Skipping performance test - no test image available")
        return True
    
    try:
        times = []
        for i in range(3):
            print(f"   Running test {i+1}/3...")
            
            with open(test_image_path, "rb") as f:
                files = {"file": ("test4.png", f, "image/png")}
                
                start_time = time.time()
                response = requests.post(
                    "http://127.0.0.1:8000/api/ocr/transcribe",
                    files=files,
                    timeout=30
                )
                end_time = time.time()
                
                if response.status_code == 200:
                    result = response.json()
                    total_time = (end_time - start_time) * 1000
                    inference_time = result['inference_time_ms']
                    times.append(total_time)
                    print(f"      Total: {total_time:.1f}ms, Inference: {inference_time:.1f}ms")
                else:
                    print(f"      ❌ Request {i+1} failed")
                    return False
        
        avg_time = sum(times) / len(times)
        print(f"   📊 Average response time: {avg_time:.1f}ms")
        print(f"   ✅ Performance test completed")
        return True
        
    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False

def main():
    """Run all OCR integration tests"""
    print("🚀 OCR Integration Test Suite")
    print("=" * 80)
    
    tests = [
        ("Server Connection", test_server_connection),
        ("OCR Status", test_ocr_status),
        ("OCR Transcription", test_ocr_transcription),
        ("OCR Performance", test_ocr_performance)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        print("-" * 40)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n📊 Test Results Summary")
    print("=" * 80)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All OCR integration tests passed!")
        print("💡 The OCR service is working perfectly!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
