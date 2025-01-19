import os
from datetime import timedelta

class Config:
    """Base configuration"""
    def __init__(self):
        # Database path relative to this file (config.py)
        self.db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'receipts.db')
        self.upload_folder = os.getenv('UPLOAD_FOLDER', 'uploads')
        
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

    # JWT configurations
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('TOKEN_EXPIRE_MINUTES', 30)))
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    @property
    def jwt_secret_key(self):
        return os.getenv('AUTH_SECRET_KEY')

class TestConfig(Config):
    """Test configuration"""
    def __init__(self):
        super().__init__()
        self.db_path = ':memory:'
        self.upload_folder = 'test_uploads'

# Use test config if TESTING environment variable is set
config = TestConfig() if os.getenv('TESTING') else Config()

# OAuth configurations (if needed)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
  