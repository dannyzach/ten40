import pytest
from flask import url_for
from tests.config import config
from models.database import Receipt, get_db

def test_get_options_empty_db(client):
    """Test getting options with empty database"""
    response = client.get('/api/options')
    assert response.status_code == 200
    
    data = response.json
    assert 'categories' in data
    assert 'payment_methods' in data
    assert 'statuses' in data
    assert 'vendors' in data
    
    # Check categories from config
    assert set(data['categories']) == set(config.expense_categories)
    assert set(data['payment_methods']) == set(config.payment_methods)
    assert set(data['statuses']) == set(config.receipt_statuses)
    assert data['vendors'] == []  # Empty database, no vendors

def test_get_options_with_vendors(client, app):
    """Test getting options with vendors in database"""
    # Add some test receipts with vendors
    test_vendors = ["Vendor A", "Vendor B", "Missing", "Vendor C"]
    with app.app_context():
        with get_db() as db:
            for vendor in test_vendors:
                receipt = Receipt(
                    image_path="test.jpg",
                    vendor=vendor,
                    content={},
                    status="pending"
                )
                db.add(receipt)
            db.commit()
    
    response = client.get('/api/options')
    assert response.status_code == 200
    
    data = response.json
    # Check vendors are returned and sorted (excluding "Missing")
    assert data['vendors'] == sorted([v for v in test_vendors if v != "Missing"])
    
    # Check other options are from config
    assert set(data['categories']) == set(config.expense_categories)
    assert set(data['payment_methods']) == set(config.payment_methods)
    assert set(data['statuses']) == set(config.receipt_statuses)

def test_options_endpoint_error_handling(client, monkeypatch):
    """Test error handling in options endpoint"""
    def mock_db_error(*args, **kwargs):
        raise Exception("Database error")
    
    # Patch the database query to simulate an error
    monkeypatch.setattr("models.database.get_db", mock_db_error)
    
    response = client.get('/api/options')
    assert response.status_code == 500
    assert response.json['error'] == "Failed to fetch options"
    assert 'details' in response.json

def test_validate_category(client):
    """Test category validation in receipt updates"""
    # Create a test receipt
    response = client.post('/api/upload', data={
        'file': (open('tests/test_receipt_debug.png', 'rb'), 'test_receipt.png')
    })
    assert response.status_code == 200
    receipt_id = response.json['id']
    
    # Test valid category
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'category': config.expense_categories[0]
    })
    assert response.status_code == 200
    
    # Test invalid category
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'category': 'Invalid Category'
    })
    assert response.status_code == 400
    assert 'category' in response.json['details']

def test_validate_payment_method(client):
    """Test payment method validation in receipt updates"""
    # Create a test receipt
    response = client.post('/api/upload', data={
        'file': (open('tests/test_receipt_debug.png', 'rb'), 'test_receipt.png')
    })
    assert response.status_code == 200
    receipt_id = response.json['id']
    
    # Test valid payment method
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'payment_method': config.payment_methods[0]
    })
    assert response.status_code == 200
    
    # Test invalid payment method
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'payment_method': 'Invalid Method'
    })
    assert response.status_code == 400
    assert 'payment_method' in response.json['details']

def test_validate_status(client):
    """Test status validation and transitions in receipt updates"""
    # Create a test receipt
    response = client.post('/api/upload', data={
        'file': (open('tests/test_receipt_debug.png', 'rb'), 'test_receipt.png')
    })
    assert response.status_code == 200
    receipt_id = response.json['id']
    
    # Test valid status transition: pending -> approved
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'status': config.receipt_statuses[1]  # 'Approved'
    })
    assert response.status_code == 200
    
    # Test invalid status transition: approved -> approved (no change)
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'status': config.receipt_statuses[1]  # 'Approved'
    })
    assert response.status_code == 400
    assert 'status' in response.json['details']
    
    # Test invalid status value
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={
        'status': 'invalid_status'
    })
    assert response.status_code == 400
    assert 'status' in response.json['details'] 