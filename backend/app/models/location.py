from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Location(Base):
    __tablename__ = "location"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    
    # Self-referential relationship for hierarchical locations
    parent_id = Column(Integer, ForeignKey("location.id"), nullable=True)
    parent = relationship("Location", remote_side=[id], backref="children")
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("user.id"))
    
    # Relationships
    owner = relationship("User", back_populates="locations")
    items = relationship("Item", back_populates="location")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 