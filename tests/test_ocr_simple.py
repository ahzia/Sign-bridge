#!/usr/bin/env python3
"""
Simple OCR Test - Test the OCR endpoint with an image
"""

import requests
import os

def test_ocr_with_image():
    """Test OCR with test4.png"""
    print("🧪 Testing OCR with Image")
    print("=" * 50)
    
    try:
        # Test the root endpoint first
        print("📊 Testing root endpoint...")
        response = requests.get("http://127.0.0.1:8000/")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Server is running!")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Server not responding: {response.status_code}")
            return False
        
        # Test OCR status
        print("\n📊 Testing OCR status...")
        response = requests.get("http://127.0.0.1:8000/api/ocr/status")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OCR service is available!")
            print(f"   QNN Available: {data['ocr_service']['qnn_available']}")
            print(f"   Model Loaded: {data['ocr_service']['model_loaded']}")
        else:
            print(f"❌ OCR status failed: {response.status_code}")
            return False
        
        # Test OCR with image
        print("\n📝 Testing OCR with test4.png...")
        
        # Check if test image exists
        test_image_path = "test4.png"
        if not os.path.exists(test_image_path):
            print(f"❌ Test image not found: {test_image_path}")
            print("💡 Please add a test image named 'test4.png' to the tests directory")
            return False
        
        print(f"📷 Using test image: {test_image_path}")
        
        with open(test_image_path, "rb") as f:
            files = {"file": ("test4.png", f, "image/png")}
            
            response = requests.post(
                "http://127.0.0.1:8000/api/ocr/transcribe",
                files=files
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ OCR transcription successful!")
            print(f"   📝 Recognized Text: '{result['recognized_text']}'")
            print(f"   🎯 Confidence: {result['confidence']:.2f}")
            print(f"   ⚡ NPU Used: {result['npu_used']}")
            print(f"   ⏱️  Inference Time: {result['inference_time_ms']:.2f}ms")
            print(f"   📁 File Name: {result['file_name']}")
            print(f"   📐 Image Size: {result['image_size']}")
            return True
        else:
            print(f"❌ OCR transcription failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 OCR Image Test")
    print("=" * 80)
    
    success = test_ocr_with_image()
    
    if success:
        print(f"\n🎉 OCR test completed successfully!")
        print(f"💡 The image-to-text feature is working perfectly!")
    else:
        print(f"\n❌ OCR test failed!")
        print(f"💡 Check that:")
        print(f"   1. Backend server is running on port 8000")
        print(f"   2. OCR model is properly loaded")
        print(f"   3. Test image exists in tests directory")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
