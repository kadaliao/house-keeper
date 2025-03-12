from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True, index=True)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=True)
    purchase_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    image_url = Column(String, nullable=True)
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="items")
    location = relationship("Location", back_populates="items")
    reminders = relationship("Reminder", back_populates="item")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 