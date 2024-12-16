# These imports are required for Flask application setup and database initialization
from .config import config
from .models.database import Base, get_db, Receipt
