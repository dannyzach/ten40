import pytest
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)

# Set testing environment variable
os.environ['TESTING'] = 'true'

# Create test directories
os.makedirs('test_uploads', exist_ok=True)
os.makedirs('data', exist_ok=True)

@pytest.fixture(scope='session', autouse=True)
def setup_test_env():
    """Set up test environment"""
    yield
    # Clean up after all tests
    import shutil
    if os.path.exists('test_uploads'):
        shutil.rmtree('test_uploads')
    if os.path.exists('data'):
        shutil.rmtree('data')