import pytest
from sqlalchemy.orm import Session
from app.crud.crud_reminder import reminder as crud_reminder
from app.crud.crud_user import user as crud_user
from app.crud.crud_item import item as crud_item
from app.crud.crud_location import location as crud_location
from app.schemas.reminder import ReminderCreate, ReminderUpdate
from app.schemas.user import UserCreate
from app.schemas.item import ItemCreate
from app.schemas.location import LocationCreate
from app.models.reminder import Reminder
from datetime import datetime, timezone, timedelta


class TestReminderCRUD:
    @pytest.fixture(scope="function")
    def test_user(self, db: Session):
        """创建测试用户"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        return crud_user.create(db, obj_in=user_in)
    
    @pytest.fixture(scope="function")
    def test_location(self, db: Session, test_user):
        """创建测试位置"""
        location_in = LocationCreate(
            name="Test Location",
            description="A test location"
        )
        return crud_location.create(db, obj_in=location_in, owner_id=test_user.id)
    
    @pytest.fixture(scope="function")
    def test_item(self, db: Session, test_user, test_location):
        """创建测试物品"""
        item_in = ItemCreate(
            name="Test Item",
            description="A test item",
            category="Test Category",
            quantity=1,
            price=100.0,
            location_id=test_location.id
        )
        return crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
    
    def test_create_with_owner(self, db: Session, test_user, test_item):
        """测试创建用户的提醒"""
        reminder_in = ReminderCreate(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            item_id=test_item.id
        )
        
        reminder = crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        assert reminder.title == reminder_in.title
        assert reminder.description == reminder_in.description
        assert reminder.due_date.strftime('%Y-%m-%d') == reminder_in.due_date.strftime('%Y-%m-%d')
        assert reminder.repeat_type == reminder_in.repeat_type
        assert reminder.item_id == reminder_in.item_id
        assert reminder.owner_id == test_user.id
        assert reminder.is_completed is False  # 默认为未完成
    
    def test_get_reminder(self, db: Session, test_user, test_item):
        """测试通过ID获取提醒"""
        reminder_in = ReminderCreate(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            item_id=test_item.id
        )
        
        reminder = crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        stored_reminder = crud_reminder.get(db, id=reminder.id)
        assert stored_reminder
        assert stored_reminder.id == reminder.id
        assert stored_reminder.title == reminder.title
        assert stored_reminder.description == reminder.description
        assert stored_reminder.owner_id == test_user.id
    
    def test_get_multi_by_owner(self, db: Session, test_user, test_item):
        """测试获取用户的所有提醒"""
        # 创建多个提醒
        for i in range(3):
            reminder_in = ReminderCreate(
                title=f"测试提醒 {i}",
                description=f"这是测试提醒 {i}",
                due_date=datetime.now(timezone.utc) + timedelta(days=i+1),
                repeat_type="once",
                item_id=test_item.id
            )
            crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        reminders = crud_reminder.get_multi_by_owner(db, owner_id=test_user.id)
        assert len(reminders) == 3
        for reminder in reminders:
            assert reminder.owner_id == test_user.id
            assert "测试提醒" in reminder.title
    
    def test_get_multi_by_item(self, db: Session, test_user, test_location):
        """测试获取特定物品的提醒"""
        # 创建两个物品
        items = []
        for i in range(2):
            item_in = ItemCreate(
                name=f"Test Item {i}",
                description=f"Test item {i}",
                category="Test Category",
                quantity=1,
                price=100.0,
                location_id=test_location.id
            )
            item = crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
            items.append(item)
        
        # 为第一个物品创建提醒
        for i in range(2):
            reminder_in = ReminderCreate(
                title=f"物品1提醒 {i}",
                description=f"物品1的提醒 {i}",
                due_date=datetime.now(timezone.utc) + timedelta(days=i+1),
                repeat_type="once",
                item_id=items[0].id
            )
            crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 为第二个物品创建提醒
        for i in range(3):
            reminder_in = ReminderCreate(
                title=f"物品2提醒 {i}",
                description=f"物品2的提醒 {i}",
                due_date=datetime.now(timezone.utc) + timedelta(days=i+1),
                repeat_type="once",
                item_id=items[1].id
            )
            crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 测试获取第一个物品的提醒
        reminders1 = crud_reminder.get_multi_by_item(db, item_id=items[0].id)
        assert len(reminders1) == 2
        for reminder in reminders1:
            assert reminder.item_id == items[0].id
            assert "物品1提醒" in reminder.title
        
        # 测试获取第二个物品的提醒
        reminders2 = crud_reminder.get_multi_by_item(db, item_id=items[1].id)
        assert len(reminders2) == 3
        for reminder in reminders2:
            assert reminder.item_id == items[1].id
            assert "物品2提醒" in reminder.title
        
        # 测试获取特定用户的物品提醒
        reminders_with_owner = crud_reminder.get_multi_by_item(db, item_id=items[0].id, owner_id=test_user.id)
        assert len(reminders_with_owner) == 2
        for reminder in reminders_with_owner:
            assert reminder.owner_id == test_user.id
    
    def test_get_due_reminders(self, db: Session, test_user, test_item):
        """测试获取已到期的提醒"""
        # 创建已到期的提醒
        for i in range(2):
            reminder_in = ReminderCreate(
                title=f"过期提醒 {i}",
                description=f"这是过期提醒 {i}",
                due_date=datetime.now(timezone.utc) - timedelta(days=i+1),  # 过去的日期
                repeat_type="once",
                item_id=test_item.id
            )
            crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 创建未到期的提醒
        for i in range(3):
            reminder_in = ReminderCreate(
                title=f"未来提醒 {i}",
                description=f"这是未来提醒 {i}",
                due_date=datetime.now(timezone.utc) + timedelta(days=i+1),  # 未来的日期
                repeat_type="once",
                item_id=test_item.id
            )
            crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 创建已到期但已完成的提醒
        reminder_completed_in = ReminderCreate(
            title="已完成提醒",
            description="这是已完成的提醒",
            due_date=datetime.now(timezone.utc) - timedelta(days=1),
            repeat_type="once",
            item_id=test_item.id
        )
        reminder_completed = crud_reminder.create_with_owner(db, obj_in=reminder_completed_in, owner_id=test_user.id)
        
        # 将提醒标记为已完成
        reminder_completed.is_completed = True
        db.add(reminder_completed)
        db.commit()
        db.refresh(reminder_completed)
        
        # 测试获取已到期且未完成的提醒
        due_reminders = crud_reminder.get_due_reminders(db, owner_id=test_user.id)
        assert len(due_reminders) == 2  # 只有2个过期且未完成的提醒
        for reminder in due_reminders:
            # 使用now()时添加时区信息，以匹配数据库中存储的时间格式
            current_time = datetime.now(timezone.utc)
            # 如果数据库中的时间没有时区信息，为其添加UTC时区
            reminder_due_date = reminder.due_date
            if reminder_due_date.tzinfo is None:
                reminder_due_date = reminder_due_date.replace(tzinfo=timezone.utc)
            assert reminder_due_date <= current_time
            assert reminder.is_completed is False
            assert "过期提醒" in reminder.title
    
    def test_get_upcoming_reminders(self, db: Session, test_user, test_item):
        """测试获取即将到期的提醒"""
        # 创建过期的提醒
        reminder_past_in = ReminderCreate(
            title="过期提醒",
            description="这是过期的提醒",
            due_date=datetime.now(timezone.utc) - timedelta(days=1),
            repeat_type="once",
            item_id=test_item.id
        )
        crud_reminder.create_with_owner(db, obj_in=reminder_past_in, owner_id=test_user.id)
        
        # 创建即将到期的提醒（3天内）
        for i in range(3):
            reminder_in = ReminderCreate(
                title=f"即将到期提醒 {i}",
                description=f"这是即将到期的提醒 {i}",
                due_date=datetime.now(timezone.utc) + timedelta(days=i+1),  # 1-3天后到期
                repeat_type="once",
                item_id=test_item.id
            )
            crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 创建远期提醒（10天后）
        reminder_future_in = ReminderCreate(
            title="远期提醒",
            description="这是远期的提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=10),
            repeat_type="once",
            item_id=test_item.id
        )
        crud_reminder.create_with_owner(db, obj_in=reminder_future_in, owner_id=test_user.id)
        
        # 创建即将到期但已完成的提醒
        reminder_completed_in = ReminderCreate(
            title="已完成提醒",
            description="这是已完成的提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=2),
            repeat_type="once",
            item_id=test_item.id
        )
        reminder_completed = crud_reminder.create_with_owner(db, obj_in=reminder_completed_in, owner_id=test_user.id)
        
        # 将提醒标记为已完成
        reminder_completed.is_completed = True
        db.add(reminder_completed)
        db.commit()
        db.refresh(reminder_completed)
        
        # 测试获取即将到期（3天内）且未完成的提醒
        upcoming_reminders = crud_reminder.get_upcoming_reminders(db, owner_id=test_user.id, days=3)
        assert len(upcoming_reminders) == 3  # 只有3个即将到期且未完成的提醒
        
        for reminder in upcoming_reminders:
            now = datetime.now(timezone.utc)
            # 如果数据库中的时间没有时区信息，为其添加UTC时区
            reminder_due_date = reminder.due_date
            if reminder_due_date.tzinfo is None:
                reminder_due_date = reminder_due_date.replace(tzinfo=timezone.utc)
            
            assert reminder_due_date > now
            assert reminder_due_date <= now + timedelta(days=3)
            assert reminder.is_completed is False
            assert "即将到期提醒" in reminder.title
    
    def test_mark_completed(self, db: Session, test_user, test_item):
        """测试标记提醒为已完成"""
        reminder_in = ReminderCreate(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            item_id=test_item.id
        )
        
        reminder = crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        assert reminder.is_completed is False  # 初始状态为未完成
        
        # 标记为已完成
        completed_reminder = crud_reminder.mark_completed(db, reminder_id=reminder.id, owner_id=test_user.id)
        assert completed_reminder.id == reminder.id
        assert completed_reminder.is_completed is True
        
        # 从数据库获取，确认已标记为完成
        stored_reminder = crud_reminder.get(db, id=reminder.id)
        assert stored_reminder.is_completed is True
    
    def test_update_reminder(self, db: Session, test_user, test_item):
        """测试更新提醒"""
        reminder_in = ReminderCreate(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            item_id=test_item.id
        )
        
        reminder = crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 更新提醒
        new_due_date = datetime.now(timezone.utc) + timedelta(days=14)
        reminder_update = ReminderUpdate(
            title="更新后的提醒",
            description="更新后的描述",
            due_date=new_due_date,
            repeat_type="weekly"
        )
        
        updated_reminder = crud_reminder.update(db, db_obj=reminder, obj_in=reminder_update)
        
        assert updated_reminder.id == reminder.id
        assert updated_reminder.title == reminder_update.title
        assert updated_reminder.description == reminder_update.description
        assert updated_reminder.due_date.strftime('%Y-%m-%d') == new_due_date.strftime('%Y-%m-%d')
        assert updated_reminder.repeat_type == reminder_update.repeat_type
        assert updated_reminder.item_id == reminder.item_id  # 物品ID不应该改变
        assert updated_reminder.owner_id == reminder.owner_id  # 所有者不应该改变
    
    def test_remove_reminder(self, db: Session, test_user, test_item):
        """测试删除提醒"""
        reminder_in = ReminderCreate(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            item_id=test_item.id
        )
        
        reminder = crud_reminder.create_with_owner(db, obj_in=reminder_in, owner_id=test_user.id)
        
        # 删除提醒
        removed_reminder = crud_reminder.remove(db, id=reminder.id)
        assert removed_reminder.id == reminder.id
        
        # 确认提醒已被删除
        stored_reminder = crud_reminder.get(db, id=reminder.id)
        assert stored_reminder is None 