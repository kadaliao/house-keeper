from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.reminder import RepeatType


# Shared properties
class ReminderBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    repeat_type: Optional[str] = RepeatType.NONE
    is_completed: Optional[bool] = False
    item_id: Optional[int] = None


# Properties to receive on reminder creation
class ReminderCreate(ReminderBase):
    title: str
    due_date: datetime


# Properties to receive on reminder update
class ReminderUpdate(ReminderBase):
    pass


# Properties shared by models stored in DB
class ReminderInDBBase(ReminderBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Properties to return to client
class Reminder(ReminderInDBBase):
    pass


# Properties stored in DB
class ReminderInDB(ReminderInDBBase):
    pass 