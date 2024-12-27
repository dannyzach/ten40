import os

class Config:
    """Base configuration"""
    def __init__(self):
        self.db_path = os.path.join('data', 'receipts.db')
        self.upload_folder = os.path.join('Receipts', 'uploads')
        
        # Single source of truth for expense categories
        self.expense_categories = [
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
        ]
        
        # Payment methods
        self.payment_methods = [
            "Credit Card",
            "Debit Card",
            "Cash",
            "Check",
            "Wire Transfer",
            "Other"
        ]
        
        # Receipt statuses
        self.receipt_statuses = [
            "Pending",
            "Approved",
            "Rejected"
        ]

class TestConfig(Config):
    """Test configuration"""
    def __init__(self):
        super().__init__()  # Call parent init to get the categories and other settings
        self.db_path = ':memory:'  # Use in-memory SQLite for tests
        self.upload_folder = 'test_uploads'

# Use test config if TESTING environment variable is set
config = TestConfig() if os.getenv('TESTING') else Config()
  