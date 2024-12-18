from sqlalchemy import Column, String, Integer, DateTime, Text
from backend.database import Base

class Receipt(Base):
    __tablename__ = 'receipts'
    
    id = Column(Integer, primary_key=True)
    image_path = Column(String(255), nullable=False)
    vendor = Column(String(255))
    amount = Column(String(50))
    date = Column(String(50))
    payment_method = Column(String(50))
    category = Column(String(50))
    content = Column(Text)
    status = Column(String(20), nullable=False, default='pending')