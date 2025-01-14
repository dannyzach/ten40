from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    vendor = Column(String(255))
    amount = Column(String(50))
    date = Column(String(50))
    payment_method = Column(String(50))
    category = Column(String(50))
    status = Column(String(20), nullable=False, default='pending')
    image_path = Column(String(255), nullable=False)
    content = Column(Text)
    
    # Use string reference to avoid circular import
    user = relationship("User", back_populates="receipts")
    changes = relationship("ReceiptChangeHistory", back_populates="receipt")

    def to_dict(self):
        """Convert receipt to dictionary"""
        return {
            'id': self.id,
            'image_path': self.image_path,
            'vendor': self.vendor or 'Missing',
            'amount': self.amount or 'Missing',
            'date': self.date or 'Missing',
            'payment_method': self.payment_method or 'Missing',
            'category': self.category or 'Other Expenses',
            'content': self.content,
            'status': self.status,
            'type': 'Expenses'
        }

class ReceiptChangeHistory(Base):
    __tablename__ = "receipt_change_history"
    
    id = Column(Integer, primary_key=True)
    receipt_id = Column(Integer, ForeignKey('receipts.id', ondelete='CASCADE'), nullable=False)
    field_name = Column(String, nullable=False)
    new_value = Column(String, nullable=False)
    changed_at = Column(DateTime, nullable=False)
    changed_by = Column(String)
    
    # Add relationship to Receipt
    receipt = relationship("Receipt", back_populates="changes")