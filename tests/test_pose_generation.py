#!/usr/bin/env python3
"""
Test script for pose generation API
"""

import requests
import json
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_pose_generation():
    """Test the pose generation API endpoint"""
    
    backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    
    # Test data
    test_data = {
        "text": "hello",
        "spoken_language": "en",
        "signed_language": "ase"
    }
    
    try:
        # Make the API call
        response = requests.post(
            f"{backend_url}/generate_pose",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Pose generation API is working!")
            print(f"Data format: {result.get('data_format')}")
            print(f"Pose data length: {len(result.get('pose_data', ''))}")
            
            # Try to decode the base64 data
            try:
                binary_data = base64.b64decode(result['pose_data'])
                print(f"Binary data size: {len(binary_data)} bytes")
                print("✅ Base64 decoding successful!")
            except Exception as e:
                print(f"❌ Base64 decoding failed: {e}")
                
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_pose_generation() 