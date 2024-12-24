import pytest
from services.categorization_service import CategorizationService
from tests.config import config
from unittest.mock import patch, MagicMock

def test_categorize_receipt_valid_category():
    """Test categorization with a valid category response"""
    test_content = {
        'Vendor': 'Office Depot',
        'text': ['Paper', 'Pens', 'Stapler']
    }
    
    # Mock OpenAI response with a valid category
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=config.expense_categories[0]))
    ]
    
    with patch('services.categorization_service.client.chat.completions.create', return_value=mock_response):
        category = CategorizationService.categorize_receipt(test_content)
        assert category in config.expense_categories

def test_categorize_receipt_invalid_category():
    """Test categorization with an invalid category response"""
    test_content = {
        'Vendor': 'Some Store',
        'text': ['Item 1', 'Item 2']
    }
    
    # Mock OpenAI response with an invalid category
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content="Invalid Category"))
    ]
    
    with patch('services.categorization_service.client.chat.completions.create', return_value=mock_response):
        category = CategorizationService.categorize_receipt(test_content)
        assert category == "Other Expenses"  # Should default to Other Expenses

def test_categorize_receipt_api_error():
    """Test categorization when API call fails"""
    test_content = {
        'Vendor': 'Some Store',
        'text': ['Item 1', 'Item 2']
    }
    
    # Mock API error
    with patch('services.categorization_service.client.chat.completions.create', side_effect=Exception("API Error")):
        category = CategorizationService.categorize_receipt(test_content)
        assert category == "Other Expenses"  # Should default to Other Expenses

def test_categorize_receipt_prompt_content():
    """Test that the prompt includes all categories"""
    test_content = {
        'Vendor': 'Test Store',
        'text': ['Test Item']
    }
    
    mock_create = MagicMock()
    
    with patch('services.categorization_service.client.chat.completions.create', mock_create):
        CategorizationService.categorize_receipt(test_content)
        
        # Check that all categories are included in the prompt
        call_args = mock_create.call_args[1]
        messages = call_args['messages']
        prompt = messages[0]['content']
        
        for category in config.expense_categories:
            assert category in prompt

def test_categorize_receipt_empty_content():
    """Test categorization with empty content"""
    test_content = {}
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=config.expense_categories[0]))
    ]
    
    with patch('services.categorization_service.client.chat.completions.create', return_value=mock_response):
        category = CategorizationService.categorize_receipt(test_content)
        assert category in config.expense_categories

def test_categorize_receipt_none_content():
    """Test categorization with None content"""
    with pytest.raises(AttributeError):
        CategorizationService.categorize_receipt(None) 