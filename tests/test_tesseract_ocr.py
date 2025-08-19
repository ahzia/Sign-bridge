#!/usr/bin/env python3
"""
Comprehensive Test Script for Tesseract OCR Service
- Tests with various image types and text
- Performance benchmarking
- Accuracy validation
- NPU integration testing
"""

import os
import sys
import time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import logging
from typing import List, Dict, Any

# Import our service
from tesseract_ocr_service import TesseractOCRService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TesseractOCRTestSuite:
    """Comprehensive test suite for Tesseract OCR"""
    
    def __init__(self):
        self.service = TesseractOCRService()
        self.test_images = []
        self.results = []
    
    def create_test_images(self):
        """Create diverse test images for comprehensive testing"""
        logger.info("🎨 Creating diverse test images...")
        
        # Test 1: Simple clear text
        img1 = Image.new('RGB', (400, 100), color='white')
        draw = ImageDraw.Draw(img1)
        draw.text((20, 20), "Hello World 2024", fill='black')
        self.test_images.append(("Simple Clear Text", img1, "Hello World 2024"))
        
        # Test 2: Numbers only
        img2 = Image.new('RGB', (300, 80), color='white')
        draw = ImageDraw.Draw(img2)
        draw.text((20, 20), "1234567890", fill='red')
        self.test_images.append(("Numbers Only", img2, "1234567890"))
        
        # Test 3: Mixed case text
        img3 = Image.new('RGB', (500, 120), color='lightblue')
        draw = ImageDraw.Draw(img3)
        draw.text((20, 20), "Test OCR Implementation", fill='darkblue')
        self.test_images.append(("Mixed Case Text", img3, "Test OCR Implementation"))
        
        # Test 4: Multi-line text
        img4 = Image.new('RGB', (600, 200), color='white')
        draw = ImageDraw.Draw(img4)
        lines = ["Line 1: Hello", "Line 2: World", "Line 3: 2024"]
        y_pos = 30
        for line in lines:
            draw.text((30, y_pos), line, fill='black')
            y_pos += 40
        self.test_images.append(("Multi-line Text", img4, "Line 1: Hello\nLine 2: World\nLine 3: 2024"))
        
        # Test 5: Small text
        img5 = Image.new('RGB', (300, 60), color='white')
        draw = ImageDraw.Draw(img5)
        draw.text((20, 10), "Small Text Test", fill='black')
        self.test_images.append(("Small Text", img5, "Small Text Test"))
        
        # Test 6: Large text
        img6 = Image.new('RGB', (800, 200), color='white')
        draw = ImageDraw.Draw(img6)
        draw.text((50, 50), "LARGE TEXT", fill='black')
        self.test_images.append(("Large Text", img6, "LARGE TEXT"))
        
        # Test 7: Dark background
        img7 = Image.new('RGB', (500, 100), color='darkblue')
        draw = ImageDraw.Draw(img7)
        draw.text((20, 20), "White Text on Blue", fill='white')
        self.test_images.append(("Dark Background", img7, "White Text on Blue"))
        
        # Test 8: Complex text with symbols
        img8 = Image.new('RGB', (600, 120), color='white')
        draw = ImageDraw.Draw(img8)
        draw.text((20, 20), "Test@123#456", fill='black')
        self.test_images.append(("Complex Text", img8, "Test@123#456"))
        
        logger.info(f"✅ Created {len(self.test_images)} test images")
    
    def run_single_test(self, name: str, image: Image.Image, expected: str) -> Dict[str, Any]:
        """Run a single OCR test"""
        logger.info(f"\n📸 Testing: {name}")
        logger.info(f"   Expected: '{expected}'")
        
        try:
            # Run OCR
            result = self.service.transcribe_image(image)
            
            # Analyze accuracy
            accuracy = self._calculate_accuracy(result['recognized_text'], expected)
            
            # Store result
            test_result = {
                'test_name': name,
                'expected_text': expected,
                'recognized_text': result['recognized_text'],
                'confidence': result['confidence'],
                'inference_time_ms': result['inference_time_ms'],
                'npu_used': result['npu_used'],
                'accuracy': accuracy,
                'image_size': image.size,
                'success': 'error' not in result
            }
            
            # Display results
            logger.info(f"   ✅ Recognized: '{result['recognized_text']}'")
            logger.info(f"   📊 Confidence: {result['confidence']:.3f}")
            logger.info(f"   ⏱️ Time: {result['inference_time_ms']:.2f}ms")
            logger.info(f"   ⚡ NPU: {result['npu_used']}")
            logger.info(f"   🎯 Accuracy: {accuracy:.1f}%")
            
            return test_result
            
        except Exception as e:
            logger.error(f"   ❌ Test failed: {e}")
            return {
                'test_name': name,
                'expected_text': expected,
                'recognized_text': '',
                'confidence': 0.0,
                'inference_time_ms': 0.0,
                'npu_used': False,
                'accuracy': 0.0,
                'image_size': image.size,
                'success': False,
                'error': str(e)
            }
    
    def _calculate_accuracy(self, recognized: str, expected: str) -> float:
        """Calculate accuracy between recognized and expected text"""
        if not recognized or not expected:
            return 0.0
        
        # Simple character-level accuracy
        recognized_clean = recognized.lower().strip()
        expected_clean = expected.lower().strip()
        
        if recognized_clean == expected_clean:
            return 100.0
        
        # Calculate similarity
        from difflib import SequenceMatcher
        similarity = SequenceMatcher(None, recognized_clean, expected_clean).ratio()
        return similarity * 100
    
    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        logger.info("🧪 Running Comprehensive Tesseract OCR Tests")
        logger.info("=" * 60)
        
        # Create test images
        self.create_test_images()
        
        # Run tests
        for name, image, expected in self.test_images:
            result = self.run_single_test(name, image, expected)
            self.results.append(result)
        
        # Generate summary
        self.generate_summary_report()
    
    def generate_summary_report(self):
        """Generate comprehensive summary report"""
        logger.info("\n📊 Tesseract OCR Test Summary Report")
        logger.info("=" * 60)
        
        if not self.results:
            logger.warning("⚠️ No test results to analyze")
            return
        
        # Calculate statistics
        total_tests = len(self.results)
        successful_tests = len([r for r in self.results if r['success']])
        failed_tests = total_tests - successful_tests
        
        # Performance metrics
        successful_results = [r for r in self.results if r['success']]
        if successful_results:
            avg_confidence = np.mean([r['confidence'] for r in successful_results])
            avg_time = np.mean([r['inference_time_ms'] for r in successful_results])
            avg_accuracy = np.mean([r['accuracy'] for r in successful_results])
            npu_usage_count = len([r for r in successful_results if r['npu_used']])
        
        # Display overall statistics
        logger.info(f"📈 Overall Statistics:")
        logger.info(f"   Total Tests: {total_tests}")
        logger.info(f"   Successful: {successful_tests}")
        logger.info(f"   Failed: {failed_tests}")
        logger.info(f"   Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        if successful_results:
            logger.info(f"\n📊 Performance Metrics:")
            logger.info(f"   Average Confidence: {avg_confidence:.3f}")
            logger.info(f"   Average Time: {avg_time:.2f}ms")
            logger.info(f"   Average Accuracy: {avg_accuracy:.1f}%")
            logger.info(f"   NPU Usage: {npu_usage_count}/{len(successful_results)} ({npu_usage_count/len(successful_results)*100:.1f}%)")
        
        # Detailed results
        logger.info(f"\n📋 Detailed Test Results:")
        for result in self.results:
            status = "✅" if result['success'] else "❌"
            accuracy_str = f"{result['accuracy']:.1f}%" if result['success'] else "N/A"
            logger.info(f"   {status} {result['test_name']}: {accuracy_str} accuracy")
        
        # Service status
        service_status = self.service.get_status()
        logger.info(f"\n🔧 Service Status:")
        logger.info(f"   Tesseract Available: {'✅' if service_status['tesseract_available'] else '❌'}")
        logger.info(f"   NPU Available: {'✅' if service_status['npu_available'] else '❌'}")
        logger.info(f"   Providers: {', '.join(service_status['providers'])}")
        
        # Recommendations
        logger.info(f"\n💡 Recommendations:")
        if avg_accuracy < 90:
            logger.info("   - Consider image preprocessing improvements")
        if avg_time > 50:
            logger.info("   - Consider NPU optimization for faster inference")
        if not service_status['npu_available']:
            logger.info("   - Install NPU drivers for acceleration")
        
        logger.info("🎉 Comprehensive testing completed!")
    
    def test_with_existing_images(self, image_paths: List[str]):
        """Test with existing images from file paths"""
        logger.info(f"📸 Testing with {len(image_paths)} existing images...")
        
        for image_path in image_paths:
            if not os.path.exists(image_path):
                logger.warning(f"⚠️ Image not found: {image_path}")
                continue
            
            try:
                image = Image.open(image_path)
                logger.info(f"\n📸 Testing: {image_path}")
                logger.info(f"   Image size: {image.size}")
                
                result = self.service.transcribe_image(image)
                
                logger.info(f"   ✅ Recognized: '{result['recognized_text']}'")
                logger.info(f"   📊 Confidence: {result['confidence']:.3f}")
                logger.info(f"   ⏱️ Time: {result['inference_time_ms']:.2f}ms")
                logger.info(f"   ⚡ NPU: {result['npu_used']}")
                
            except Exception as e:
                logger.error(f"   ❌ Failed to process {image_path}: {e}")

def main():
    """Main test function"""
    logger.info("🚀 Tesseract OCR Comprehensive Test Suite")
    logger.info("=" * 60)
    
    # Initialize test suite
    test_suite = TesseractOCRTestSuite()
    
    # Run comprehensive tests
    test_suite.run_comprehensive_tests()
    
    # Test with existing images if available
    existing_images = [
        "../tests/test3.png",
        "../tests/test4.png", 
        "../tests/test5.png",
        "../tests/test7.png"
    ]
    
    # Check which images exist
    available_images = [img for img in existing_images if os.path.exists(img)]
    if available_images:
        logger.info(f"\n📸 Testing with {len(available_images)} existing images...")
        test_suite.test_with_existing_images(available_images)
    
    logger.info("\n🎉 All tests completed!")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()

