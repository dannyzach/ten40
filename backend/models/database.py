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
    vendor = Column(String)
    amount = Column(String)  # Using String to handle various currency formats
    date = Column(String)    # Using String to handle various date formats
    payment_method = Column(String)
    content = Column(JSON, nullable=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.content:
            # Flatten nested JSON structure recursively
            def flatten_dict(d, parent_key='', sep='_'):
                items = []
                for k, v in d.items():
                    new_key = f"{parent_key}{sep}{k}" if parent_key else k
                    if isinstance(v, dict):
                        items.extend(flatten_dict(v, new_key, sep=sep).items())
                    else:
                        items.append((new_key, v))
                return dict(items)

            # Flatten and convert to lowercase
            flattened = flatten_dict(self.content)
            content_lower = {k.lower(): v for k, v in flattened.items()}
            
            self.vendor = content_lower.get('vendor') or 'Missing'
            self.amount = content_lower.get('amount') or 'Missing'
            self.date = content_lower.get('date') or 'Missing'
            self.payment_method = content_lower.get('payment_method') or 'Missing'

    def to_dict(self):
        """Convert receipt to dictionary"""
        return {
            'id': self.id,
            'image_path': self.image_path,
            'vendor': self.vendor or 'Missing',
            'amount': self.amount or 'Missing',
            'date': self.date or 'Missing',
            'payment_method': self.payment_method or 'Missing',
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

# Drop all tables and recreate
def init_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

# Initialize database
init_db() 