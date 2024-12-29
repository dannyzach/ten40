import pytest
from sqlalchemy import inspect
from models.database import engine, Receipt

def test_receipt_model_configuration():
    """Test that Receipt model is configured correctly"""
    # Get model metadata
    receipt_table = Receipt.__table__

    # Test status column configuration
    status_column = receipt_table.columns.get('status')
    assert status_column is not None
    assert status_column.type.length == 20
    assert not status_column.nullable
    assert status_column.default.arg == 'Pending'

    # Test required columns exist
    required_columns = {'id', 'image_path', 'content', 'status', 'expenseType'}
    actual_columns = set(receipt_table.columns.keys())
    assert required_columns.issubset(actual_columns)