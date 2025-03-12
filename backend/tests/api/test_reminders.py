import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from app.models.user import User
from app.models.item import Item
from app.models.location import Location
from datetime import datetime, timezone, timedelta


class TestRemindersEndpoints:
    @pytest.fixture(scope="function")
    def test_location(self, db: Session, test_user: User) -> Location:
        """创建测试位置"""
        location = Location(
            name="Test Location",
            description="A test location",
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        return location

    @pytest.fixture(scope="function")
    def test_item(self, db: Session, test_user: User, test_location: Location) -> Item:
        """创建测试物品"""
        item = Item(
            name="Test Item",
            description="A test item",
            category="Test Category",
            quantity=1,
            purchase_date=datetime.now(timezone.utc),
            price=100.0,
            location_id=test_location.id,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def test_create_reminder(self, authenticated_client: TestClient, test_item: Item):
        """测试创建提醒"""
        reminder_data = {
            "title": "测试提醒",
            "description": "这是一个测试提醒",
            "due_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "repeat_type": "once",
            "item_id": test_item.id
        }
        
        response = authenticated_client.post("/api/v1/reminders/", json=reminder_data)
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == reminder_data["title"]
        assert data["description"] == reminder_data["description"]
        assert data["item_id"] == reminder_data["item_id"]
    
    def test_get_reminders(self, authenticated_client: TestClient, db: Session, test_user: User, test_item: Item):
        """测试获取提醒列表"""
        # 创建测试提醒
        reminder = Reminder(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            is_completed=False,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(reminder)
        db.commit()
        
        # 获取提醒列表
        response = authenticated_client.get("/api/v1/reminders/")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        found = False
        for reminder_data in data:
            if reminder_data["title"] == "测试提醒":
                found = True
                break
        
        assert found, "未找到刚创建的提醒"
    
    def test_get_active_reminders(self, authenticated_client: TestClient, db: Session, test_user: User, test_item: Item):
        """测试获取活跃提醒"""
        # 创建测试提醒（已过期）
        past_reminder = Reminder(
            title="过期提醒",
            description="这是一个过期的提醒",
            due_date=datetime.now(timezone.utc) - timedelta(days=1),
            repeat_type="once",
            is_completed=False,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # 创建测试提醒（即将到期）
        future_reminder = Reminder(
            title="未来提醒",
            description="这是一个未来的提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=1),
            repeat_type="once",
            is_completed=False,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # 创建测试提醒（已完成）
        completed_reminder = Reminder(
            title="已完成提醒",
            description="这是一个已完成的提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=1),
            repeat_type="once",
            is_completed=True,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        db.add_all([past_reminder, future_reminder, completed_reminder])
        db.commit()
        
        # 获取活跃提醒（未完成且未过期）
        response = authenticated_client.get("/api/v1/reminders/?due=true")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # 应该只包含过期提醒
        past_reminder_found = False
        future_reminder_found = False
        completed_reminder_found = False
        
        for reminder_data in data:
            if reminder_data["title"] == "过期提醒":
                past_reminder_found = True
            if reminder_data["title"] == "未来提醒":
                future_reminder_found = True
            if reminder_data["title"] == "已完成提醒":
                completed_reminder_found = True
        
        assert past_reminder_found, "未找到过期提醒"
        assert not future_reminder_found, "找到了未来提醒，但不应该"
        assert not completed_reminder_found, "找到了已完成提醒，但不应该"
    
    def test_get_reminder(self, authenticated_client: TestClient, db: Session, test_user: User, test_item: Item):
        """测试获取单个提醒"""
        # 创建测试提醒
        reminder = Reminder(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            is_completed=False,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        
        # 获取单个提醒
        response = authenticated_client.get(f"/api/v1/reminders/{reminder.id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == reminder.id
        assert data["title"] == reminder.title
        assert data["description"] == reminder.description
        assert data["repeat_type"] == reminder.repeat_type
        assert data["is_completed"] == reminder.is_completed
    
    def test_update_reminder(self, authenticated_client: TestClient, db: Session, test_user: User, test_item: Item):
        """测试更新提醒"""
        # 创建测试提醒
        reminder = Reminder(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            is_completed=False,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        
        # 更新数据
        update_data = {
            "title": "已更新的提醒",
            "description": "这是一个已更新的提醒",
            "is_completed": True
        }
        
        # 发送更新请求
        response = authenticated_client.put(f"/api/v1/reminders/{reminder.id}", json=update_data)
        
        # 验证响应
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["description"] == update_data["description"]
        assert data["is_completed"] == update_data["is_completed"]
        
        # 验证数据库中的更新
        db.refresh(reminder)
        assert reminder.title == update_data["title"]
        assert reminder.description == update_data["description"]
        assert reminder.is_completed == update_data["is_completed"]
    
    def test_delete_reminder(self, authenticated_client: TestClient, db: Session, test_user: User, test_item: Item):
        """测试删除提醒"""
        # 创建测试提醒
        reminder = Reminder(
            title="测试提醒",
            description="这是一个测试提醒",
            due_date=datetime.now(timezone.utc) + timedelta(days=7),
            repeat_type="once",
            is_completed=False,
            owner_id=test_user.id,
            item_id=test_item.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        
        # 删除提醒
        response = authenticated_client.delete(f"/api/v1/reminders/{reminder.id}")
        assert response.status_code == 200
        
        # 验证提醒已删除
        deleted_reminder = db.query(Reminder).filter(Reminder.id == reminder.id).first()
        assert deleted_reminder is None 