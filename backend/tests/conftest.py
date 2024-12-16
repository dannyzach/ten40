import pytest
import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Import after path setup
from models.database import Base
from tests.test_config import config

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create test directories
os.makedirs(config.upload_folder, exist_ok=True)

@pytest.fixture(scope='session')
def engine():
    """Create test database engine"""
    return create_engine('sqlite:///:memory:', echo=False)

@pytest.fixture(scope='session')
def tables(engine):
    """Create all database tables"""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(engine, tables):
    """Create a new database session for a test"""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope='session', autouse=True)
def cleanup():
    """Clean up after all tests"""
    yield
    # Clean up test uploads
    import shutil
    if os.path.exists(config.upload_folder):
        shutil.rmtree(config.upload_folder)