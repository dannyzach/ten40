import os
import pytest
from config import Config, TestConfig as AppTestConfig
from tests.config import TestConfig as LocalTestConfig

def test_base_config_initialization():
    """Test that base config initializes with correct values"""
    config = Config()
    test_config = LocalTestConfig()
    
    # Verify that test config has same categories as main config
    assert set(config.expense_categories) == set(test_config.expense_categories)
    assert set(config.payment_methods) == set(test_config.payment_methods)
    assert set(config.receipt_statuses) == set(test_config.receipt_statuses)

def test_test_config_paths():
    """Test that test configs have correct paths"""
    local_config = LocalTestConfig()
    app_test_config = AppTestConfig()
    
    # Both should use in-memory database
    assert local_config.db_path == ':memory:'
    assert app_test_config.db_path == ':memory:'
    
    # Test upload paths
    assert local_config.upload_folder == os.path.join('tests', 'test_uploads')
    assert app_test_config.upload_folder == 'test_uploads'

def test_expense_categories_completeness():
    """Test that all required expense categories are present"""
    config = LocalTestConfig()
    required_categories = {
        "Advertising",
        "Car and Truck Expenses",
        "Commissions and Fees",
        "Contract Labor",
        "Depletion",
        "Depreciation and Section 179 Expense Deduction",
        "Employee Benefit Programs",
        "Insurance (Other Than Health)",
        "Interest",
        "Legal and Professional Services",
        "Office Expenses",
        "Pension and Profit-Sharing Plans",
        "Rent or Lease",
        "Repairs and Maintenance",
        "Supplies",
        "Taxes and Licenses",
        "Travel",
        "Meals",
        "Utilities",
        "Wages",
        "Other Expenses"
    }
    
    assert set(config.expense_categories) == required_categories

def test_payment_methods_completeness():
    """Test that all required payment methods are present"""
    config = LocalTestConfig()
    required_methods = {
        "Credit Card",
        "Debit Card",
        "Cash",
        "Check",
        "Wire Transfer",
        "Other"
    }
    
    assert set(config.payment_methods) == required_methods

def test_receipt_statuses_completeness():
    """Test that all required receipt statuses are present"""
    config = LocalTestConfig()
    required_statuses = {"Pending", "Approved", "Rejected"}
    
    assert set(config.receipt_statuses) == required_statuses