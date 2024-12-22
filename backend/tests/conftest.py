import pytest
from dotenv import load_dotenv
import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from flask import Flask, g

# Load environment variables
load_dotenv()
print(os.getenv('TEST_DATABASE_URL'))

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Import after path setup
from models.database import Base
from tests.test_config import config
from api.routes import api_bp

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create test directories
os.makedirs(config.upload_folder, exist_ok=True)

@pytest.fixture(scope='session')
def engine():
    """Create test database engine"""
    database_url = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')
    return create_engine(database_url, echo=False)

@pytest.fixture(scope='session')
def tables(engine):
    """Create all database tables"""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(engine):
    """Create a new database session for a test"""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(engine, tables, db_session):
    """Create Flask test client"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['UPLOAD_FOLDER'] = config.upload_folder
    app.config['DATABASE_URL'] = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')
    
    @app.before_request
    def before_request():
        g.db_session = db_session
    
    # app.register_blueprint(api_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    
    with app.test_client() as client:
        with app.app_context():
            yield client

@pytest.fixture(scope='session', autouse=True)
def cleanup():
    """Clean up after all tests"""
    yield
    # Clean up test uploads
    import shutil
    if os.path.exists(config.upload_folder):
        shutil.rmtree(config.upload_folder)