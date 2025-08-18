#!/usr/bin/env python3
"""
OCR Status Test - Test the OCR service status and availability
"""

import requests

def test_ocr_status():
    """Test OCR service status"""
    print("🧪 Testing OCR Service Status")
    print("=" * 50)
    
    try:
        # Test the OCR status endpoint
        print("📊 Testing OCR status endpoint...")
        response = requests.get("http://127.0.0.1:8000/api/ocr/status")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OCR status endpoint working!")
            print(f"   📊 OCR Service: {data['ocr_service']['status']}")
            print(f"   🤖 Model Loaded: {data['ocr_service']['model_loaded']}")
            print(f"   ⚡ QNN Available: {data['ocr_service']['qnn_available']}")
            print(f"   🔧 NPU Enabled: {data['ocr_service']['npu_enabled']}")
            print(f"   📁 Model Path: {data['ocr_service']['model_path']}")
            print(f"   ⏱️  Initialization Time: {data['ocr_service']['init_time_ms']:.2f}ms")
            return True
        else:
            print(f"❌ OCR status failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_ocr_root():
    """Test OCR root endpoint"""
    print("\n📊 Testing OCR root endpoint...")
    
    try:
        response = requests.get("http://127.0.0.1:8000/api/ocr/")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OCR root endpoint working!")
            print(f"   📝 Message: {data['message']}")
            print(f"   🔗 Endpoints: {data['endpoints']}")
            return True
        else:
            print(f"❌ OCR root failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ OCR root test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 OCR Status Test")
    print("=" * 80)
    
    status_success = test_ocr_status()
    root_success = test_ocr_root()
    
    if status_success and root_success:
        print(f"\n🎉 OCR status tests completed successfully!")
        print(f"💡 The OCR service is properly configured and ready!")
    else:
        print(f"\n❌ OCR status tests failed!")
        print(f"💡 Check that:")
        print(f"   1. Backend server is running on port 8000")
        print(f"   2. OCR model files are present in backend/models/ocr/")
        print(f"   3. ONNX Runtime QNN is properly installed")
    
    return status_success and root_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
