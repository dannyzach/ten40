import pytest
from datetime import datetime
from models.database import Receipt, get_db
from api.routes import api_bp

def test_update_receipt_fields(client):
    """Test updating receipt fields"""
    # Create a test receipt
    with get_db() as db:
        receipt = Receipt(
            image_path="test.jpg",
            vendor="Test Vendor",
            amount="10.00",
            date="2023-12-16",
            payment_method="CASH",
            category="Other",
            content={"test": "data"}
        )
        db.add(receipt)
        db.commit()
        receipt_id = receipt.id

    # Test updating fields
    update_data = {
        "vendor": "New Vendor",
        "amount": "25.50",
        "category": "Office expenses"
    }

    response = client.patch(f'/api/receipts/{receipt_id}/update', json=update_data)
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['vendor'] == "New Vendor"
    assert data['amount'] == "25.50"
    assert data['category'] == "Office expenses"

    # Verify changes were recorded
    response = client.get(f'/api/receipts/{receipt_id}/history')
    assert response.status_code == 200
    
    changes = response.get_json()
    assert len(changes) == 3  # Should have 3 changes
    assert any(c['field'] == 'vendor' and c['new_value'] == 'New Vendor' for c in changes)
    assert any(c['field'] == 'amount' and c['new_value'] == '25.50' for c in changes)
    assert any(c['field'] == 'category' and c['new_value'] == 'Office expenses' for c in changes)

def test_update_invalid_receipt(client):
    """Test updating non-existent receipt"""
    response = client.patch('/api/receipts/99999/update', json={"vendor": "Test"})
    assert response.status_code == 404

def test_get_history_invalid_receipt(client):
    """Test getting history for non-existent receipt"""
    response = client.get('/api/receipts/99999/history')
    assert response.status_code == 404