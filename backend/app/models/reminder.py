from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class RepeatType(str, enum.Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Reminder(Base):
    __tablename__ = "reminder"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, index=True)
    repeat_type = Column(String, default=RepeatType.NONE)
    is_completed = Column(Boolean, default=False)
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("user.id"))
    item_id = Column(Integer, ForeignKey("item.id"), nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="reminders")
    item = relationship("Item", back_populates="reminders")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 