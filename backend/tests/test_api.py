import pytest
import io
from PIL import Image, ImageDraw
import json

def create_test_receipt_image():
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

def test_upload_receipt_unit(client):
    """Unit test for receipt upload endpoint"""
    test_image = create_test_receipt_image()
    response = client.post(
        '/api/upload',
        data={'file': (test_image, 'test_receipt.png', 'image/png')}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'id' in data
    assert 'image_path' in data
    assert 'content' in data
    return data['id']

def test_get_receipts_unit(client):
    """Unit test for get all receipts endpoint"""
    response = client.get('/api/receipts')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_receipt_unit(client):
    """Unit test for get single receipt endpoint"""
    receipt_id = test_upload_receipt_unit(client)
    response = client.get(f'/api/receipts/{receipt_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == receipt_id

def test_update_receipt_unit(client):
    """Unit test for update receipt endpoint"""
    receipt_id = test_upload_receipt_unit(client)
    
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
    
    response = client.put(
        f'/api/receipts/{receipt_id}',
        json=update_data
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['content'] == update_data['content']

def test_delete_receipt_unit(client):
    """Unit test for delete receipt endpoint"""
    receipt_id = test_upload_receipt_unit(client)
    
    response = client.delete(f'/api/receipts/{receipt_id}')
    assert response.status_code == 200
    
    # Verify deletion
    response = client.get(f'/api/receipts/{receipt_id}')
    assert response.status_code == 404