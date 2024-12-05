from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import config
from contextlib import contextmanager

Base = declarative_base()

class Receipt(Base):
    """Receipt database model"""
    __tablename__ = 'receipts'

    id = Column(Integer, primary_key=True)
    image_path = Column(String, nullable=False)
    content = Column(JSON)

    def to_dict(self):
        """Convert receipt to dictionary"""
        return {
            'id': self.id,
            'image_path': self.image_path,
            'content': self.content
        }

# Initialize database
engine = create_engine(f'sqlite:///{config.db_path}')
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