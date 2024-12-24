import pytest
from models.database import Receipt, get_db

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
        "category": "Office Expenses"
    }

    response = client.patch(f'/api/receipts/{receipt_id}/update', json=update_data)
    assert response.status_code == 200

    # Verify the updates were applied
    with get_db() as db:
        updated_receipt = db.query(Receipt).get(receipt_id)
        assert updated_receipt.vendor == "New Vendor"
        assert updated_receipt.amount == "25.50"
        assert updated_receipt.category == "Office Expenses"

    # Clean up
    with get_db() as db:
        db.query(Receipt).filter_by(id=receipt_id).delete()
        db.commit()

def test_update_invalid_receipt(client):
    """Test updating non-existent receipt"""
    response = client.patch('/api/receipts/99999/update', json={"vendor": "Test"})
    assert response.status_code == 404
    assert response.json['error'] == True
    assert response.json['message'] == "Receipt not found"

def test_partial_update_receipt(client):
    """Test updating only some fields of a receipt"""
    with get_db() as db:
        receipt = Receipt(
            image_path="test.jpg",
            vendor="Original Vendor",
            amount="10.00",
            date="2023-12-16",
            payment_method="CASH",
            category="Other Expenses",
            content={"test": "data"}
        )
        db.add(receipt)
        db.commit()
        receipt_id = receipt.id

    # Update only vendor
    response = client.patch(f'/api/receipts/{receipt_id}/update', json={"vendor": "New Vendor"})
    assert response.status_code == 200

    # Verify only vendor changed, other fields remained same
    with get_db() as db:
        updated_receipt = db.query(Receipt).get(receipt_id)
        assert updated_receipt.vendor == "New Vendor"
        assert updated_receipt.amount == "10.00"  # unchanged
        assert updated_receipt.category == "Other Expenses"  # unchanged

    # Clean up
    with get_db() as db:
        db.query(Receipt).filter_by(id=receipt_id).delete()
        db.commit()

def test_update_invalid_fields(client):
    """Test updating with invalid field values"""
    with get_db() as db:
        receipt = Receipt(
            image_path="test.jpg",
            content={"test": "data"}
        )
        db.add(receipt)
        db.commit()
        receipt_id = receipt.id

    # Test invalid amount format
    response = client.patch(f'/api/receipts/{receipt_id}/update', 
                          json={"amount": "invalid"})
    assert response.status_code == 400
    assert response.json['error'] == True
    assert 'message' in response.json
    assert 'details' in response.json
    assert 'amount' in response.json['details']

    # Clean up
    with get_db() as db:
        db.query(Receipt).filter_by(id=receipt_id).delete()
        db.commit()