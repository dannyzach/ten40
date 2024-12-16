import unittest
import requests
import io
from PIL import Image, ImageDraw

class TestReceiptAPI(unittest.TestCase):
    """Integration tests for Receipt REST API"""
    
    BASE_URL = 'http://localhost:3456/api'

    def create_test_image(self):
        """Create a test receipt image"""
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

    def test_upload_receipt(self):
        """Test receipt upload endpoint"""
        # Upload a test image
        test_image = self.create_test_image()
        response = requests.post(
            f'{self.BASE_URL}/upload',
            files={'file': ('test.png', test_image, 'image/png')}
        )
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response has required fields
        required_fields = {'id', 'image_path', 'vendor', 'amount', 'date', 'payment_method', 'category'}
        self.assertTrue(all(field in data for field in required_fields))
        
        return data['id']

    def test_get_receipts(self):
        """Test get all receipts endpoint"""
        response = requests.get(f'{self.BASE_URL}/receipts')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_get_receipt(self):
        """Test get single receipt endpoint"""
        # First create a receipt
        receipt_id = self.test_upload_receipt()
        
        # Get the receipt
        response = requests.get(f'{self.BASE_URL}/receipts/{receipt_id}')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['id'], receipt_id)

    def test_update_receipt(self):
        """Test update receipt endpoint"""
        # First create a receipt
        receipt_id = self.test_upload_receipt()
        
        # Update it
        update_data = {
            'vendor': 'Updated Store',
            'amount': '99.99',
            'category': 'Test Category'
        }
        
        response = requests.patch(
            f'{self.BASE_URL}/receipts/{receipt_id}/update',
            json=update_data
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify updates were applied
        for field, value in update_data.items():
            self.assertEqual(data[field], value)

    def test_delete_receipt(self):
        """Test delete receipt endpoint"""
        # First create a receipt
        receipt_id = self.test_upload_receipt()
        
        # Delete it
        response = requests.delete(f'{self.BASE_URL}/receipts/{receipt_id}')
        self.assertEqual(response.status_code, 200)
        
        # Verify it's gone
        response = requests.get(f'{self.BASE_URL}/receipts/{receipt_id}')
        self.assertEqual(response.status_code, 404)

    def test_error_cases(self):
        """Test error responses"""
        # Test 404 on non-existent receipt
        response = requests.get(f'{self.BASE_URL}/receipts/99999')
        self.assertEqual(response.status_code, 404)
        
        # Test 400 on upload with no file
        response = requests.post(f'{self.BASE_URL}/upload', files={})
        self.assertEqual(response.status_code, 400) 