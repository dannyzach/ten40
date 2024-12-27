import pytest
from backend.config import config

def test_get_options(client):
    """Test options endpoint returns correct configuration options"""
    response = client.get('/api/options')
    assert response.status_code == 200
    
    data = response.json
    # Verify all required fields are present
    assert 'categories' in data
    assert 'payment_methods' in data
    assert 'statuses' in data
    assert 'vendors' in data
    
    # Verify configuration values are correct
    assert set(data['categories']) == set(config.expense_categories)
    assert set(data['payment_methods']) == set(config.payment_methods)
    assert set(data['statuses']) == set(config.receipt_statuses) 