import requests
import os
import logging
from PIL import Image, ImageDraw, ImageFont
import io
import random
import sys

# Force logging to stdout with DEBUG level
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True,  # Force override any existing logger
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Disable other loggers
logging.getLogger('urllib3').setLevel(logging.WARNING)
logging.getLogger('PIL').setLevel(logging.WARNING)

logger = logging.getLogger('test_upload')
logger.setLevel(logging.DEBUG)

# Test that logging works
logger.debug("Logging initialized")

BASE_URL = 'http://localhost:3456/api'

def create_test_receipt_image():
    """Create a realistic receipt image with noise"""
    logger.info("Creating test receipt image...")
    
    # Create a tall receipt image (typical receipt dimensions)
    width = 576  # Standard receipt width (72mm at 203dpi)
    height = 1000
    img = Image.new('RGB', (width, height), color=(250, 250, 250))  # Slightly off-white
    d = ImageDraw.Draw(img)
    
    # Try to use a monospace font
    try:
        font_paths = [
            '/System/Library/Fonts/Courier.dfont',  # macOS
            '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf',  # Linux
            'C:\\Windows\\Fonts\\cour.ttf'  # Windows
        ]
        
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, size=24)
                logger.info(f"Using font from: {path}")
                break
        
        if font is None:
            logger.warning("No suitable font found, using default font")
    except Exception as e:
        logger.error(f"Font error: {e}")
        font = None
    
    # Draw receipt content
    y = 50
    # Header
    d.text((width//2 - 50, y), "TEST STORE", fill=(0, 0, 0), font=font)
    y += 40
    d.text((width//2 - 80, y), "123 Main Street", fill=(0, 0, 0), font=font)
    y += 30
    d.text((width//2 - 80, y), "City, State 12345", fill=(0, 0, 0), font=font)
    y += 50
    
    # Transaction details
    d.text((50, y), "Date: 2024-01-20", fill=(0, 0, 0), font=font)
    y += 30
    d.text((50, y), "Receipt #: 1234", fill=(0, 0, 0), font=font)
    y += 50
    
    # Items
    d.text((50, y), "Item 1" + "." * 20 + "$10.99", fill=(0, 0, 0), font=font)
    y += 30
    d.text((50, y), "Item 2" + "." * 20 + "$15.00", fill=(0, 0, 0), font=font)
    y += 30
    d.text((50, y), "Item 3" + "." * 20 + "$17.00", fill=(0, 0, 0), font=font)
    y += 50
    
    # Totals
    d.text((50, y), "Subtotal" + "." * 20 + "$42.99", fill=(0, 0, 0), font=font)
    y += 30
    d.text((50, y), "Tax" + "." * 25 + "$3.44", fill=(0, 0, 0), font=font)
    y += 30
    d.text((50, y), "Total" + "." * 23 + "$46.43", fill=(0, 0, 0), font=font)
    
    # Save to file for inspection
    debug_path = os.path.join(os.path.dirname(__file__), 'test_receipt_debug.png')
    img.save(debug_path, format='PNG', quality=100)
    logger.info(f"Saved debug image to: {debug_path}")
    
    # Save to bytes for API
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG', quality=100)
    img_byte_arr.seek(0)
    return img_byte_arr

def test_upload():
    """Test receipt upload"""
    logger.info("\n=== Testing Upload API ===")
    
    try:
        # Create and prepare the test image
        img_data = create_test_receipt_image()
        logger.info("Test image created successfully")
        
        # Prepare the upload request
        files = {'file': ('test_receipt.png', img_data, 'image/png')}
        logger.info("Sending upload request to server...")
        
        # Make the request
        response = requests.post(f'{BASE_URL}/upload', files=files)
        logger.info(f"Upload response status code: {response.status_code}")
        
        # Parse and check the response
        response_data = response.json()
        logger.info(f"Upload response data: {response_data}")
        
        # Detailed response analysis
        if response.status_code == 200:
            logger.info("Upload successful!")
            if response_data.get('content') is None:
                logger.warning("OCR processing failed - content is None")
            else:
                logger.info("OCR processing successful")
                logger.info(f"Extracted content: {response_data['content']}")
        else:
            logger.error(f"Upload failed with status {response.status_code}")
            if 'error' in response_data:
                logger.error(f"Error message: {response_data['error']}")
        
        return response_data
            
    except Exception as e:
        logger.error(f"Test failed with error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None

if __name__ == '__main__':
    # Test that logging is working
    logger.info("Starting upload test...")
    
    result = test_upload()
    
    if result:
        logger.info("\n=== Test Summary ===")
        logger.info(f"Upload completed with result: {result}")
    else:
        logger.error("\n=== Test Failed ===")
        sys.exit(1) 