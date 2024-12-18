import pytest
from sqlalchemy import inspect
from backend.database import engine

def test_status_column_exists():
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('receipts')]
    assert 'status' in columns

def test_status_column_default():
    with engine.connect() as connection:
        result = connection.execute("""
            SELECT sql FROM sqlite_master 
            WHERE type='table' AND name='receipts'
        """).scalar()
        assert "status VARCHAR(20) DEFAULT 'pending'" in result.lower() 