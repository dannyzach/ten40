import os

# Configuration class - used by other tests
class TestConfig:
    """Test configuration"""
    def __init__(self):
        # Use in-memory SQLite for tests
        self.db_path = ':memory:'
        # Use temporary directory for test uploads
        self.upload_folder = os.path.join('tests', 'test_uploads')

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