import os

class Config:
    """Base configuration"""
    def __init__(self):
        self.db_path = os.path.join('data', 'receipts.db')
        self.upload_folder = os.path.join('Receipts', 'uploads')
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

class TestConfig(Config):
    """Test configuration"""
    def __init__(self):
        super().__init__()  # Call parent to get expense_categories
        self.db_path = ':memory:'  # Use in-memory SQLite for tests
        self.upload_folder = 'test_uploads'

# Use test config if TESTING environment variable is set
config = TestConfig() if os.getenv('TESTING') else Config()
  