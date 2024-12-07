from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from config import config
from contextlib import contextmanager
from datetime import datetime
import os

Base = declarative_base()

def get_engine():
    """Get SQLAlchemy engine, creating database directory if needed"""
    db_dir = os.path.dirname(config.db_path)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    return create_engine(f'sqlite:///{config.db_path}')

class Receipt(Base):
    """Receipt database model"""
    __tablename__ = 'receipts'

    id = Column(Integer, primary_key=True)
    image_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    content = Column(JSON, nullable=False)

    def to_dict(self):
        """Convert receipt to dictionary"""
        return {
            'id': self.id,
            'image_path': self.image_path,
            'original_filename': self.original_filename,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'content': self.content
        }

# Initialize database
engine = get_engine()
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

@contextmanager
def get_db():
    """Database session context manager"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close() 