from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, Numeric, ForeignKey, Enum, inspect
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.orm import sessionmaker
from config import config
from contextlib import contextmanager
from datetime import datetime
import os
import enum
from decimal import Decimal

Base = declarative_base()

def get_engine():
    """Get SQLAlchemy engine, creating database directory if needed"""
    db_dir = os.path.dirname(config.db_path)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    return create_engine(f'sqlite:///{config.db_path}')

class ExpenseCategory(enum.Enum):
    ADVERTISING = "Advertising"
    CAR_AND_TRUCK = "Car and truck expenses"
    COMMISSIONS = "Commissions and fees"
    CONTRACT_LABOR = "Contract labor"
    DEPLETION = "Depletion"
    DEPRECIATION = "Depreciation"
    EMPLOYEE_BENEFITS = "Employee benefit programs"
    INSURANCE = "Insurance (other than health)"
    INTEREST_MORTGAGE = "Interest (mortgage)"
    INTEREST_OTHER = "Interest (other)"
    LEGAL = "Legal and professional services"
    OFFICE = "Office expenses"
    PENSION = "Pension and profit-sharing plans"
    RENT = "Rent or lease"
    REPAIRS = "Repairs and maintenance"
    SUPPLIES = "Supplies"
    TAXES = "Taxes and licenses"
    TRAVEL = "Travel, meals, and entertainment"
    UTILITIES = "Utilities"
    WAGES = "Wages"
    OTHER = "Other"

class Receipt(Base):
    """Receipt database model"""
    __tablename__ = 'receipts'

    id = Column(Integer, primary_key=True)
    image_path = Column(String, nullable=False)
    vendor = Column(String)
    amount = Column(String)  # Back to String to handle 'Missing'
    date = Column(String)    # Back to String to handle 'Missing'
    payment_method = Column(String)
    category = Column(String)  # Back to String to handle 'Missing'
    content = Column(JSON, nullable=False)
    
    # Relationship to change history
    changes = relationship("ReceiptChangeHistory", back_populates="receipt")

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
            
            # Set fields directly from content, defaulting to 'Missing'
            self.vendor = content_lower.get('vendor') or 'Missing'
            self.amount = content_lower.get('amount') or 'Missing'
            self.date = content_lower.get('date') or 'Missing'
            self.payment_method = content_lower.get('payment_method') or 'Missing'
            
            # Handle category
            if not self.category:
                from services.categorization_service import CategorizationService
                self.category = CategorizationService.categorize_receipt(self.content)

    def to_dict(self):
        """Convert receipt to dictionary"""
        return {
            'id': self.id,
            'image_path': self.image_path,
            'vendor': self.vendor or 'Missing',
            'amount': self.amount or 'Missing',
            'date': self.date or 'Missing',
            'payment_method': self.payment_method or 'Missing',
            'category': self.category or 'Other',
            'content': self.content
        }

class ReceiptChangeHistory(Base):
    __tablename__ = 'receipt_change_history'

    id = Column(Integer, primary_key=True)
    receipt_id = Column(Integer, ForeignKey('receipts.id'), nullable=False)
    field_name = Column(String, nullable=False)
    new_value = Column(String, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    changed_by = Column(String, nullable=True)  # Will be used later for user tracking

    # Relationship to receipt
    receipt = relationship("Receipt", back_populates="changes")

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

# Drop all tables and recreate - should only be called explicitly
def init_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

# Only create tables if they don't exist
inspector = inspect(engine)
if not inspector.has_table('receipts'):
    Base.metadata.create_all(engine) 