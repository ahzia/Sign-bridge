#!/usr/bin/env python3
"""
Create a simple test image for OCR testing
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    """Create a simple test image with text"""
    
    # Create a white image
    width, height = 400, 200
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a default font, fallback to basic if not available
    try:
        # Try to use a system font
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
    
    # Add text to the image
    text = "This is a test\nAhmad Zia yousufi"
    lines = text.split('\n')
    
    y_position = 50
    for line in lines:
        # Calculate text size and center it
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x_position = (width - text_width) // 2
        draw.text((x_position, y_position), line, fill='black', font=font)
        y_position += text_height + 10
    
    # Save the image
    output_path = "test4.png"
    image.save(output_path)
    print(f"✅ Created test image: {output_path}")
    print(f"📐 Image size: {width}x{height}")
    print(f"📝 Text content: '{text}'")
    
    return output_path

if __name__ == "__main__":
    create_test_image()
