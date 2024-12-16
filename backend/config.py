import os

class Config:
    """Base configuration"""
    def __init__(self):
        self.db_path = os.path.join('data', 'receipts.db')
        self.upload_folder = os.path.join('Receipts', 'uploads')

class TestConfig(Config):
    """Test configuration"""
    def __init__(self):
        self.db_path = ':memory:'  # Use in-memory SQLite for tests
        self.upload_folder = 'test_uploads'

# Use test config if TESTING environment variable is set
config = TestConfig() if os.getenv('TESTING') else Config()
  