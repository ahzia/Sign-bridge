#!/usr/bin/env python3
"""
Simple test script for backend executable
"""
import subprocess
import time
import requests
import sys
import os

def test_backend():
    print("🔧 Testing backend executable...")
    
    # Check if backend executable exists
    backend_path = "./dist/backend.exe"
    if not os.path.exists(backend_path):
        print(f"❌ Backend executable not found at {backend_path}")
        return False
    
    print(f"✅ Backend executable found: {backend_path}")
    
    # Start backend process
    print("Starting backend...")
    try:
        process = subprocess.Popen(
            [backend_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Wait a bit for startup
        print("⏳ Waiting for backend to start...")
        time.sleep(15)
        
        # Check if process is still running
        if process.poll() is not None:
            print("❌ Backend process exited unexpectedly")
            stdout, stderr = process.communicate()
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return False
        
        print("✅ Backend process is running")
        
        # Test the features endpoint
        print("Testing /features endpoint...")
        try:
            response = requests.get("http://127.0.0.1:8000/features", timeout=30)
            print(f"✅ Response status: {response.status_code}")
            print(f"✅ Response content: {response.text}")
            
            # Test model status endpoint
            print("Testing /model-status endpoint...")
            response = requests.get("http://127.0.0.1:8000/model-status", timeout=30)
            print(f"✅ Model status: {response.status_code}")
            print(f"✅ Model status content: {response.text}")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error testing endpoints: {e}")
            return False
        
        # Stop the backend
        print("🛑 Stopping backend...")
        process.terminate()
        process.wait(timeout=10)
        print("✅ Backend stopped successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error running backend: {e}")
        return False

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)
