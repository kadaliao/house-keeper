import pytest
from sqlalchemy.orm import Session
from app.utils.seed_db import (
    get_user_by_username, 
    get_location_by_name, 
    get_item_by_name,
    create_test_users,
    create_test_locations,
    create_test_items,
    create_test_reminders
)
from app.models import User, Location, Item, Reminder


class TestSeedDB:
    def test_get_user_by_username(self, db: Session, test_user: User):
        """测试通过用户名获取用户的函数"""
        # 已存在的用户
        user = get_user_by_username(db, "testuser")
        assert user is not None
        assert user.username == "testuser"
        
        # 不存在的用户
        non_exist_user = get_user_by_username(db, "nonexist")
        assert non_exist_user is None

    def test_get_location_by_name(self, db: Session):
        """测试通过名称获取位置的函数"""
        # 创建测试位置
        location = Location(name="测试位置", description="测试描述")
        db.add(location)
        db.commit()
        
        # 测试获取
        found_location = get_location_by_name(db, "测试位置")
        assert found_location is not None
        assert found_location.name == "测试位置"
        
        # 不存在的位置
        non_exist_location = get_location_by_name(db, "不存在的位置")
        assert non_exist_location is None

    def test_get_item_by_name(self, db: Session):
        """测试通过名称获取物品的函数"""
        # 创建测试物品
        item = Item(name="测试物品", description="测试描述", category="测试")
        db.add(item)
        db.commit()
        
        # 测试获取
        found_item = get_item_by_name(db, "测试物品")
        assert found_item is not None
        assert found_item.name == "测试物品"
        
        # 不存在的物品
        non_exist_item = get_item_by_name(db, "不存在的物品")
        assert non_exist_item is None

    def test_create_test_users(self, db: Session):
        """测试创建测试用户的函数"""
        users = create_test_users(db)
        assert len(users) > 0
        
        # 检查是否实际插入到数据库
        db_users = db.query(User).filter(User.email.like("%@example.com")).all()
        assert len(db_users) >= len(users)
        
        # 测试用户名和邮箱
        assert any(user.username == "admin" for user in users)
        assert any(user.email == "admin@example.com" for user in users)

    def test_create_test_locations(self, db: Session, test_user: User):
        """测试创建测试位置的函数"""
        locations = create_test_locations(db, test_user)
        assert len(locations) > 0
        
        # 检查是否实际插入到数据库
        db_locations = db.query(Location).filter(Location.owner_id == test_user.id).all()
        assert len(db_locations) >= len(locations)
        
        # 测试位置结构（包含父子关系）
        parent_locations = [loc for loc in locations if loc.parent_id is None]
        assert len(parent_locations) > 0
        
        # 至少应该有一些子位置
        child_locations = [loc for loc in locations if loc.parent_id is not None]
        assert len(child_locations) > 0

    def test_create_test_items(self, db: Session, test_user: User):
        """测试创建测试物品的函数"""
        # 首先创建测试位置
        locations = create_test_locations(db, test_user)
        
        # 创建测试物品
        items = create_test_items(db, test_user)
        assert len(items) > 0
        
        # 检查是否实际插入到数据库
        db_items = db.query(Item).filter(Item.owner_id == test_user.id).all()
        assert len(db_items) >= len(items)
        
        # 检查物品是否有位置
        items_with_location = [item for item in items if item.location_id is not None]
        assert len(items_with_location) > 0

    def test_create_test_reminders(self, db: Session, test_user: User):
        """测试创建测试提醒的函数"""
        # 创建测试提醒
        reminders = create_test_reminders(db, test_user)
        assert len(reminders) > 0
        
        # 检查是否实际插入到数据库
        db_reminders = db.query(Reminder).filter(Reminder.owner_id == test_user.id).all()
        assert len(db_reminders) >= len(reminders)
        
        # 检查提醒类型
        reminder_types = set(reminder.repeat_type for reminder in reminders)
        assert len(reminder_types) > 1  # 应该有多种提醒类型 