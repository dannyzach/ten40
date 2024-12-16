import os

class TestConfig:
    """Test configuration"""
    def __init__(self):
        # Use in-memory SQLite for tests
        self.db_path = ':memory:'
        # Use temporary directory for test uploads
        self.upload_folder = os.path.join('tests', 'test_uploads')
        
config = TestConfig() 