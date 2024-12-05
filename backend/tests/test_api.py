import unittest
import logging
import requests
import json
from .base import BaseTest

logger = logging.getLogger(__name__)

class TestReceipts(unittest.TestCase, BaseTest):
    """Test suite for Receipt API endpoints"""

    @classmethod
    def setUpClass(cls):
        """Set up test suite - check server availability"""
        if not cls.wait_for_server():
            raise RuntimeError("Server not available")
        cls.cleanup_old_test_receipts()

    def setUp(self):
        """Set up each test"""
        self.test_image = self.create_test_receipt_image()

    @classmethod
    def cleanup_old_test_receipts(cls):
        """Clean up old test receipts"""
        logger.info("Cleaning up old test receipts...")
        try:
            response = requests.get(f'{cls.BASE_URL}/receipts')
            if response.status_code == 200:
                receipts = response.json()
                for receipt in receipts:
                    if 'test_receipt' in receipt['image_path']:
                        requests.delete(f'{cls.BASE_URL}/receipts/{receipt["id"]}')
        except Exception as e:
            logger.warning(f"Cleanup failed: {str(e)}")

    def test_upload_receipt(self):
        """Test receipt upload endpoint"""
        files = {'file': ('test_receipt.png', self.test_image, 'image/png')}
        response = requests.post(
            f'{self.BASE_URL}/upload',
            files=files,
            timeout=self.UPLOAD_TIMEOUT
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('id', data)
        self.assertIn('image_path', data)
        self.assertIn('content', data)
        return data['id']

    def test_get_receipts(self):
        """Test get all receipts endpoint"""
        response = requests.get(
            f'{self.BASE_URL}/receipts',
            timeout=self.REQUEST_TIMEOUT
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_get_receipt(self):
        """Test get single receipt endpoint"""
        receipt_id = self.test_upload_receipt()
        
        response = requests.get(
            f'{self.BASE_URL}/receipts/{receipt_id}',
            timeout=self.REQUEST_TIMEOUT
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['id'], receipt_id)

    def test_update_receipt(self):
        """Test update receipt endpoint"""
        receipt_id = self.test_upload_receipt()
        
        update_data = {
            'content': {
                'store_name': 'Updated Store',
                'date': '2024-01-20',
                'items': [
                    {'name': 'Test Item 1', 'quantity': 1, 'price': 19.99},
                    {'name': 'Test Item 2', 'quantity': 2, 'price': 29.99}
                ],
                'subtotal': 79.97,
                'tax': 6.40,
                'total_amount': 86.37
            }
        }
        
        response = requests.put(
            f'{self.BASE_URL}/receipts/{receipt_id}',
            json=update_data,
            timeout=self.REQUEST_TIMEOUT
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['content'], update_data['content'])

    def test_delete_receipt(self):
        """Test delete receipt endpoint"""
        receipt_id = self.test_upload_receipt()
        
        response = requests.delete(
            f'{self.BASE_URL}/receipts/{receipt_id}',
            timeout=self.REQUEST_TIMEOUT
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify deletion
        response = requests.get(f'{self.BASE_URL}/receipts/{receipt_id}')
        self.assertEqual(response.status_code, 404) 