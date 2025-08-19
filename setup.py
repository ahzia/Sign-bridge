#!/usr/bin/env python3
"""
Setup script for Tesseract OCR with NPU Support
- Installs all required dependencies
- Configures environment
- Tests installation
"""

import subprocess
import sys
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Run a command and handle errors"""
    logger.info(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} failed: {e}")
        logger.error(f"   Error output: {e.stderr}")
        return False

def install_dependencies():
    """Install all required dependencies"""
    logger.info("📦 Installing dependencies...")
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install requirements
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing requirements"):
        return False
    
    return True

def test_imports():
    """Test that all required modules can be imported"""
    logger.info("🧪 Testing imports...")
    
    modules_to_test = [
        ('pytesseract', 'Tesseract OCR'),
        ('PIL', 'Pillow'),
        ('numpy', 'NumPy'),
        ('cv2', 'OpenCV'),
        ('yaml', 'PyYAML'),
        ('onnxruntime', 'ONNX Runtime'),
        ('coloredlogs', 'Colored Logs')
    ]
    
    failed_imports = []
    
    for module_name, description in modules_to_test:
        try:
            __import__(module_name)
            logger.info(f"✅ {description} imported successfully")
        except ImportError as e:
            logger.error(f"❌ Failed to import {description}: {e}")
            failed_imports.append(module_name)
    
    if failed_imports:
        logger.error(f"❌ Failed to import: {', '.join(failed_imports)}")
        return False
    
    logger.info("✅ All imports successful")
    return True

def test_tesseract():
    """Test Tesseract OCR functionality"""
    logger.info("🧪 Testing Tesseract OCR...")
    
    try:
        import pytesseract
        from PIL import Image
        
        # Create a simple test image
        test_image = Image.new('RGB', (200, 100), color='white')
        from PIL import ImageDraw
        draw = ImageDraw.Draw(test_image)
        draw.text((20, 20), "Test", fill='black')
        
        # Try OCR
        result = pytesseract.image_to_string(test_image, lang='eng')
        
        if result.strip():
            logger.info("✅ Tesseract OCR test passed")
            return True
        else:
            logger.warning("⚠️ Tesseract OCR returned empty result")
            return False
            
    except Exception as e:
        logger.error(f"❌ Tesseract OCR test failed: {e}")
        return False

def test_npu():
    """Test NPU support"""
    logger.info("🧪 Testing NPU support...")
    
    try:
        import onnxruntime as ort
        providers = ort.get_available_providers()
        
        if "QNNExecutionProvider" in providers:
            logger.info("✅ NPU (QNN) support available")
            return True
        else:
            logger.warning("⚠️ NPU (QNN) not available, will use CPU")
            return True  # Not a failure, just no NPU
            
    except Exception as e:
        logger.error(f"❌ NPU test failed: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    logger.info("📁 Creating directories...")
    
    directories = ['logs', 'models', 'test_images', 'output']
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"✅ Created directory: {directory}")
        else:
            logger.info(f"📁 Directory already exists: {directory}")

def main():
    """Main setup function"""
    logger.info("🚀 Setting up Tesseract OCR with NPU Support")
    logger.info("=" * 60)
    
    # Step 1: Install dependencies
    if not install_dependencies():
        logger.error("❌ Dependency installation failed")
        return False
    
    # Step 2: Test imports
    if not test_imports():
        logger.error("❌ Import tests failed")
        return False
    
    # Step 3: Test Tesseract
    if not test_tesseract():
        logger.error("❌ Tesseract test failed")
        logger.info("💡 You may need to install Tesseract binary:")
        logger.info("   Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        logger.info("   Linux: sudo apt-get install tesseract-ocr")
        logger.info("   macOS: brew install tesseract")
        return False
    
    # Step 4: Test NPU
    if not test_npu():
        logger.error("❌ NPU test failed")
        return False
    
    # Step 5: Create directories
    create_directories()
    
    logger.info("\n🎉 Setup completed successfully!")
    logger.info("=" * 60)
    
    logger.info("\n💡 Next steps:")
    logger.info("1. Run: python tesseract_ocr_service.py")
    logger.info("2. Run: python test_tesseract_ocr.py")
    logger.info("3. Check logs/tesseract_ocr.log for detailed logs")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

