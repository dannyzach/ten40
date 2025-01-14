from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database import Base
from werkzeug.security import generate_password_hash, check_password_hash
import logging

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Use string reference to avoid circular import
    receipts = relationship("Receipt", back_populates="user") 

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password, method='scrypt')
        
    def verify_password(self, password):
        return check_password_hash(self.hashed_password, password) 