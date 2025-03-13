#!/usr/bin/env python3
# 家庭物品管理系统 - 数据库种子脚本
# 用于快速生成开发环境测试数据

import sys
import os
import logging
from datetime import datetime, timedelta
import random
from pathlib import Path
from typing import List, Optional

# 确保能导入app包
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import User, Item, Location, Reminder
from app.models.reminder import RepeatType
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 测试数据
test_users = [
    {"username": "admin", "email": "admin@example.com", "password": "admin123", "first_name": "管理员", "last_name": "用户"},
    {"username": "test", "email": "test@example.com", "password": "test123", "first_name": "测试", "last_name": "用户"},
]

test_locations = [
    {"name": "客厅", "description": "客厅主要存放区域"},
    {"name": "厨房", "description": "厨房存储区域"},
    {"name": "主卧", "description": "主卧室"},
    {"name": "书房", "description": "书房和工作区"},
    {"name": "儿童房", "description": "儿童房间"},
    {"name": "衣柜", "description": "主卧衣柜", "parent_name": "主卧"},
    {"name": "书架", "description": "书房书架", "parent_name": "书房"},
    {"name": "橱柜", "description": "厨房橱柜", "parent_name": "厨房"},
]

test_categories = ["电器", "家具", "书籍", "衣物", "厨具", "文具", "玩具", "食品", "药品", "化妆品"]

test_items = [
    {"name": "电视", "description": "65寸智能电视", "category": "电器", "quantity": 1, "price": 4999.00, "location_name": "客厅"},
    {"name": "微波炉", "description": "小米微波炉", "category": "电器", "quantity": 1, "price": 599.00, "location_name": "厨房"},
    {"name": "衣架", "description": "木质衣架10个", "category": "家具", "quantity": 10, "price": 99.00, "location_name": "衣柜"},
    {"name": "Python编程", "description": "Python编程从入门到实践", "category": "书籍", "quantity": 1, "price": 79.00, "location_name": "书架"},
    {"name": "记事本", "description": "A5记事本3本", "category": "文具", "quantity": 3, "price": 45.00, "location_name": "书房"},
    {"name": "儿童积木", "description": "儿童积木玩具套装", "category": "玩具", "quantity": 1, "price": 199.00, "location_name": "儿童房"},
    {"name": "药箱", "description": "家庭药箱", "category": "药品", "quantity": 1, "price": 89.00, "location_name": "主卧"},
    {"name": "厨刀", "description": "德国厨刀", "category": "厨具", "quantity": 1, "price": 298.00, "location_name": "橱柜"},
]

test_reminders = [
    {"title": "更换电视滤网", "description": "每年更换一次电视滤网", "due_date_days": 30, "repeat_type": RepeatType.YEARLY, "item_name": "电视"},
    {"title": "清洁微波炉", "description": "每周清洁微波炉", "due_date_days": 7, "repeat_type": RepeatType.WEEKLY, "item_name": "微波炉"},
    {"title": "整理衣物", "description": "季节性整理衣物", "due_date_days": 90, "repeat_type": RepeatType.NONE, "item_name": "衣架"},
    {"title": "检查药箱过期药品", "description": "每月检查一次药箱，清理过期药品", "due_date_days": 15, "repeat_type": RepeatType.MONTHLY, "item_name": "药箱"},
]

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_location_by_name(db: Session, name: str) -> Optional[Location]:
    return db.query(Location).filter(Location.name == name).first()

def get_item_by_name(db: Session, name: str) -> Optional[Item]:
    return db.query(Item).filter(Item.name == name).first()

def create_test_users(db: Session) -> List[User]:
    """创建测试用户"""
    created_users = []
    for user_data in test_users:
        existing_user = get_user_by_username(db, user_data["username"])
        if existing_user:
            logger.info(f"用户 '{user_data['username']}' 已存在，跳过")
            created_users.append(existing_user)
            continue
            
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"已创建用户: {user.username}")
        created_users.append(user)
    return created_users

def create_test_locations(db: Session, owner: User) -> List[Location]:
    """创建测试位置"""
    created_locations = []
    
    # 首先创建没有父位置的位置
    for location_data in [l for l in test_locations if "parent_name" not in l]:
        existing_location = get_location_by_name(db, location_data["name"])
        if existing_location:
            logger.info(f"位置 '{location_data['name']}' 已存在，跳过")
            created_locations.append(existing_location)
            continue
            
        location = Location(
            name=location_data["name"],
            description=location_data["description"],
            owner_id=owner.id
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        logger.info(f"已创建位置: {location.name}")
        created_locations.append(location)
    
    # 然后创建有父位置的位置
    for location_data in [l for l in test_locations if "parent_name" in l]:
        existing_location = get_location_by_name(db, location_data["name"])
        if existing_location:
            logger.info(f"位置 '{location_data['name']}' 已存在，跳过")
            created_locations.append(existing_location)
            continue
            
        parent_location = get_location_by_name(db, location_data["parent_name"])
        if not parent_location:
            logger.warning(f"找不到父位置 '{location_data['parent_name']}'，跳过创建 '{location_data['name']}'")
            continue
            
        location = Location(
            name=location_data["name"],
            description=location_data["description"],
            owner_id=owner.id,
            parent_id=parent_location.id
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        logger.info(f"已创建位置: {location.name}，父位置: {parent_location.name}")
        created_locations.append(location)
        
    return created_locations

def create_test_items(db: Session, owner: User) -> List[Item]:
    """创建测试物品"""
    created_items = []
    for item_data in test_items:
        existing_item = get_item_by_name(db, item_data["name"])
        if existing_item:
            logger.info(f"物品 '{item_data['name']}' 已存在，跳过")
            created_items.append(existing_item)
            continue
            
        location = get_location_by_name(db, item_data["location_name"])
        if not location:
            logger.warning(f"找不到位置 '{item_data['location_name']}'，物品 '{item_data['name']}' 将没有位置")
            location_id = None
        else:
            location_id = location.id
            
        # 随机设置购买日期和过期日期
        purchase_date = datetime.utcnow() - timedelta(days=random.randint(1, 365))
        expiry_date = None
        if random.random() > 0.5:  # 50%的物品有过期日期
            expiry_date = datetime.utcnow() + timedelta(days=random.randint(30, 730))
            
        item = Item(
            name=item_data["name"],
            description=item_data["description"],
            category=item_data["category"],
            quantity=item_data["quantity"],
            price=item_data["price"],
            purchase_date=purchase_date,
            expiry_date=expiry_date,
            owner_id=owner.id,
            location_id=location_id
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        logger.info(f"已创建物品: {item.name}")
        created_items.append(item)
    return created_items

def create_test_reminders(db: Session, owner: User) -> List[Reminder]:
    """创建测试提醒"""
    created_reminders = []
    for reminder_data in test_reminders:
        item = get_item_by_name(db, reminder_data["item_name"])
        if not item:
            logger.warning(f"找不到物品 '{reminder_data['item_name']}'，提醒 '{reminder_data['title']}' 将没有关联物品")
            item_id = None
        else:
            item_id = item.id
            
        due_date = datetime.utcnow() + timedelta(days=reminder_data["due_date_days"])
        
        reminder = Reminder(
            title=reminder_data["title"],
            description=reminder_data["description"],
            due_date=due_date,
            repeat_type=reminder_data["repeat_type"],
            is_completed=False,
            owner_id=owner.id,
            item_id=item_id
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        logger.info(f"已创建提醒: {reminder.title}")
        created_reminders.append(reminder)
    return created_reminders

def seed_db():
    """主函数，用于填充数据库"""
    db = SessionLocal()
    try:
        # 创建用户
        users = create_test_users(db)
        if not users:
            logger.error("创建用户失败，终止数据填充")
            return
            
        # 使用第一个用户作为测试数据的所有者
        owner = users[0]
        
        # 创建位置
        locations = create_test_locations(db, owner)
        
        # 创建物品
        items = create_test_items(db, owner)
        
        # 创建提醒
        reminders = create_test_reminders(db, owner)
        
        logger.info("数据库填充完成!")
        logger.info(f"创建了 {len(users)} 个用户")
        logger.info(f"创建了 {len(locations)} 个位置")
        logger.info(f"创建了 {len(items)} 个物品")
        logger.info(f"创建了 {len(reminders)} 个提醒")
        
    except Exception as e:
        logger.error(f"数据填充过程中发生错误: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("开始填充数据库...")
    seed_db() 