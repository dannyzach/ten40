from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import config
import os

print(f"[database.py] Current working directory: {os.getcwd()}")
print(f"[database.py] Database path from config: {config.db_path}")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{config.db_path}"
print(f"[database.py] Full database URL: {SQLALCHEMY_DATABASE_URL}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    # Import models so they're registered with Base
    from models.receipt import Receipt
    from models.user import User
    
    # Create tables
    Base.metadata.create_all(bind=engine)

# Add this function to get database session
def get_db():
    db = SessionLocal()
    print(f"[database.py] Creating new database session with URL: {db.get_bind().url}")
    try:
        return db
    except Exception as e:
        print(f"[database.py] Error creating database session: {str(e)}")
        db.close()
        raise e 