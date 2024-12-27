import os

# Test configuration class - used by other tests
class TestConfig:
    """Test configuration"""
    def __init__(self):
        # Use in-memory SQLite for tests
        self.db_path = ':memory:'
        # Use temporary directory for test uploads
        self.upload_folder = os.path.join('tests', 'test_uploads')
        
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

# Create config instance used by other tests
config = TestConfig() 