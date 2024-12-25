import os
import pytest
from backend.config import config  # Import the config object directly

class ConfigTests:
    """Tests for configuration settings"""
    
    def test_database_path(self):
        """Test that test config uses in-memory database"""
        assert config.db_path == ':memory:'
        
    def test_upload_folder(self):
        """Test upload folder configuration"""
        assert config.upload_folder == 'test_uploads'
            
    def test_expense_categories(self):
        """Test expense categories configuration"""
        # Test that expense categories are defined
        assert hasattr(config, 'expense_categories')
        assert isinstance(config.expense_categories, list)
        assert len(config.expense_categories) > 0
        
        # Test that required categories are present
        required_categories = [
            "Advertising",
            "Travel",
            "Meals",
            "Other Expenses"
        ]
        for category in required_categories:
            assert category in config.expense_categories, f"Required category '{category}' not found"
        
        # Test that categories are strings and properly formatted
        for category in config.expense_categories:
            assert isinstance(category, str), f"Category '{category}' is not a string"
            assert len(category.strip()) == len(category), f"Category '{category}' has leading/trailing whitespace"
            assert category[0].isupper(), f"Category '{category}' should start with uppercase letter"

    def test_payment_methods(self):
        """Test payment methods configuration"""
        # Test that required methods are present
        required_methods = ["Credit Card", "Cash", "Check"]
        for method in required_methods:
            assert method in config.payment_methods, f"Required payment method '{method}' not found"
            
        # Test for duplicates
        assert len(config.payment_methods) == len(set(config.payment_methods))

    def test_receipt_statuses(self):
        """Test receipt statuses configuration"""
        # Test required statuses
        required_statuses = {"Pending", "Approved", "Rejected"}
        assert set(config.receipt_statuses) == required_statuses
        
        # Test for duplicates
        assert len(config.receipt_statuses) == len(set(config.receipt_statuses))