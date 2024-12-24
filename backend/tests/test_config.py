import os

# Configuration class - used by other tests
class TestConfig:
    """Test configuration"""
    def __init__(self):
        # Use in-memory SQLite for tests
        self.db_path = ':memory:'
        # Use temporary directory for test uploads
        self.upload_folder = os.path.join('tests', 'test_uploads')
        # Expense categories for testing
        self.expense_categories = [
            "Advertising",
            "Car and truck expenses",
            "Commissions and fees",
            "Contract labor",
            "Depletion",
            "Depreciation",
            "Employee benefit programs",
            "Insurance (other than health)",
            "Interest",
            "Legal and professional services",
            "Office expenses",
            "Pension and profit-sharing plans",
            "Rent or lease",
            "Repairs and maintenance",
            "Supplies",
            "Taxes and licenses",
            "Travel",
            "Meals",
            "Utilities",
            "Wages",
            "Other expenses"
        ]

# Create config instance used by other tests
config = TestConfig()

# Separate test class
class ConfigTests:
    """Tests for configuration settings"""
    def test_database_url(self):
        """Test database URL configuration"""
        assert config.db_path == ':memory:'
        
    def test_upload_folder(self):
        """Test upload folder configuration"""
        assert config.upload_folder == os.path.join('tests', 'test_uploads')
        
    def test_expense_categories(self):
        """Test expense categories configuration"""
        # Test that expense categories are defined
        assert hasattr(config, 'expense_categories')
        assert isinstance(config.expense_categories, list)
        assert len(config.expense_categories) > 0
        
        # Test that required categories are present
        required_categories = [
            "Advertising",
            "Office expenses",
            "Travel",
            "Meals",
            "Utilities",
            "Other expenses"
        ]
        for category in required_categories:
            assert category in config.expense_categories, f"Required category '{category}' not found"
        
        # Test that categories are strings and properly formatted
        for category in config.expense_categories:
            assert isinstance(category, str), f"Category '{category}' is not a string"
            assert len(category.strip()) == len(category), f"Category '{category}' has leading/trailing whitespace"
            assert category[0].isupper(), f"Category '{category}' should start with uppercase letter"