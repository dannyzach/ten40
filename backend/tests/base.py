import logging
import requests
import time
from PIL import Image, ImageDraw
import io
import sys

# Configure logging
logger = logging.getLogger(__name__)

class BaseTest:
    """Base class for API tests"""
    
    BASE_URL = 'http://localhost:3456/api'
    UPLOAD_TIMEOUT = 120  # 2 minutes for upload/OCR
    REQUEST_TIMEOUT = 30  # 30 seconds for other requests

    @classmethod
    def wait_for_server(cls, timeout=30, interval=2):
        """Wait for server to become available"""
        logger.info("Checking server availability...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f'{cls.BASE_URL}/health')
                if response.status_code == 200:
                    logger.info("Server is available")
                    return True
            except requests.ConnectionError:
                logger.debug(f"Server not ready, retrying in {interval} seconds...")
            time.sleep(interval)
        
        logger.error(f"Server did not become available within {timeout} seconds")
        return False

    @staticmethod
    def create_test_receipt_image():
        """Create a test receipt image"""
        logger.info("Creating test receipt image...")
        
        # Create image
        width, height = 576, 1000
        img = Image.new('RGB', (width, height), color=(250, 250, 250))
        draw = ImageDraw.Draw(img)
        
        # Add content
        y = 50
        draw.text((width//2 - 50, y), "TEST STORE", fill=(0, 0, 0))
        y += 50
        draw.text((50, y), "Date: 2024-01-20", fill=(0, 0, 0))
        y += 50
        
        # Add items
        items = [
            ("Item 1", "$10.99"),
            ("Item 2", "$15.00"),
            ("Item 3", "$17.00")
        ]
        for item, price in items:
            draw.text((50, y), f"{item}{' ' * 20}{price}", fill=(0, 0, 0))
            y += 30
        
        # Add totals
        y += 20
        draw.text((50, y), f"Subtotal{' ' * 20}$42.99", fill=(0, 0, 0))
        y += 30
        draw.text((50, y), f"Tax{' ' * 25}$3.44", fill=(0, 0, 0))
        y += 30
        draw.text((50, y), f"Total{' ' * 23}$46.43", fill=(0, 0, 0))
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return img_bytes 