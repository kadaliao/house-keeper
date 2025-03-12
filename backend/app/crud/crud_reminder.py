from typing import List, Optional
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate, ReminderUpdate


class CRUDReminder(CRUDBase[Reminder, ReminderCreate, ReminderUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: ReminderCreate, owner_id: int
    ) -> Reminder:
        """
        创建一个属于特定用户的提醒
        """
        obj_in_data = obj_in.dict()
        db_obj = Reminder(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Reminder]:
        """
        获取特定用户的所有提醒
        """
        return (
            db.query(self.model)
            .filter(Reminder.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_by_item(
        self, db: Session, *, item_id: int, owner_id: Optional[int] = None, skip: int = 0, limit: int = 100
    ) -> List[Reminder]:
        """
        根据物品ID获取提醒列表
        """
        query = db.query(self.model).filter(Reminder.item_id == item_id)
        if owner_id is not None:
            query = query.filter(Reminder.owner_id == owner_id)
        return query.offset(skip).limit(limit).all()
    
    def get_due_reminders(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Reminder]:
        """
        获取当前已到期但未完成的提醒
        """
        now = datetime.now(timezone.utc)
        return (
            db.query(self.model)
            .filter(Reminder.owner_id == owner_id)
            .filter(Reminder.due_date <= now)
            .filter(Reminder.is_completed == False)
            .order_by(Reminder.due_date)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_upcoming_reminders(
        self, db: Session, *, owner_id: int, days: int = 7, skip: int = 0, limit: int = 100
    ) -> List[Reminder]:
        """
        获取即将到期的提醒（未来n天内到期且未完成）
        """
        now = datetime.now(timezone.utc)
        future = now + timedelta(days=days)
        return (
            db.query(self.model)
            .filter(Reminder.owner_id == owner_id)
            .filter(Reminder.due_date > now)
            .filter(Reminder.due_date <= future)
            .filter(Reminder.is_completed == False)
            .order_by(Reminder.due_date)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def mark_completed(
        self, db: Session, *, reminder_id: int, owner_id: int
    ) -> Reminder:
        """
        将提醒标记为已完成
        """
        reminder = db.query(self.model).filter(
            Reminder.id == reminder_id,
            Reminder.owner_id == owner_id
        ).first()
        
        if reminder:
            reminder.is_completed = True
            db.add(reminder)
            db.commit()
            db.refresh(reminder)
        
        return reminder


reminder = CRUDReminder(Reminder) 