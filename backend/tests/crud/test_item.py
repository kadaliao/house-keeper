import pytest
from sqlalchemy.orm import Session
from app.crud.crud_item import item as crud_item
from app.crud.crud_user import user as crud_user
from app.crud.crud_location import location as crud_location
from app.schemas.item import ItemCreate, ItemUpdate
from app.schemas.user import UserCreate
from app.schemas.location import LocationCreate
from app.models.item import Item
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import or_


class TestItemCRUD:
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
    
    def test_create_item(self, db: Session, test_user, test_location):
        """测试创建物品"""
        item_in = ItemCreate(
            name="Test Item",
            description="A test item",
            category="Test Category",
            quantity=1,
            price=100.0,
            location_id=test_location.id
        )
        
        item = crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        assert item.name == item_in.name
        assert item.description == item_in.description
        assert item.category == item_in.category
        assert item.quantity == item_in.quantity
        assert item.price == item_in.price
        assert item.location_id == item_in.location_id
        assert item.owner_id == test_user.id
    
    def test_get_item(self, db: Session, test_user, test_location):
        """测试通过ID获取物品"""
        item_in = ItemCreate(
            name="Test Item",
            description="A test item",
            category="Test Category",
            quantity=1,
            price=100.0,
            location_id=test_location.id
        )
        
        item = crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        stored_item = crud_item.get(db, id=item.id)
        assert stored_item
        assert stored_item.id == item.id
        assert stored_item.name == item.name
        assert stored_item.description == item.description
        assert stored_item.owner_id == test_user.id
    
    def test_get_multi_by_owner(self, db: Session, test_user, test_location):
        """测试获取用户的所有物品"""
        # 创建多个物品
        for i in range(3):
            item_in = ItemCreate(
                name=f"Test Item {i}",
                description=f"A test item {i}",
                category="Test Category",
                quantity=i+1,
                price=100.0 * (i+1),
                location_id=test_location.id
            )
            crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        items = crud_item.get_multi_by_owner(db, owner_id=test_user.id)
        assert len(items) == 3
        for item in items:
            assert item.owner_id == test_user.id
    
    def test_get_by_location(self, db: Session, test_user, test_location):
        """测试获取特定位置的物品"""
        # 创建第二个位置
        location2_in = LocationCreate(
            name="Test Location 2",
            description="A second test location"
        )
        location2 = crud_location.create(db, obj_in=location2_in, owner_id=test_user.id)
        
        # 在第一个位置创建物品
        for i in range(2):
            item_in = ItemCreate(
                name=f"Location 1 Item {i}",
                description=f"An item in location 1",
                category="Test Category",
                quantity=i+1,
                price=100.0,
                location_id=test_location.id
            )
            crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 在第二个位置创建物品
        for i in range(3):
            item_in = ItemCreate(
                name=f"Location 2 Item {i}",
                description=f"An item in location 2",
                category="Test Category",
                quantity=i+1,
                price=200.0,
                location_id=location2.id
            )
            crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 测试获取第一个位置的物品
        items1 = crud_item.get_by_location(db, location_id=test_location.id)
        assert len(items1) == 2
        for item in items1:
            assert item.location_id == test_location.id
            assert "Location 1 Item" in item.name
        
        # 测试获取第二个位置的物品
        items2 = crud_item.get_by_location(db, location_id=location2.id)
        assert len(items2) == 3
        for item in items2:
            assert item.location_id == location2.id
            assert "Location 2 Item" in item.name
    
    def test_get_by_category(self, db: Session, test_user, test_location):
        """测试获取特定类别的物品"""
        # 创建不同类别的物品
        categories = ["Food", "Electronics", "Clothing"]
        for i, category in enumerate(categories):
            for j in range(2):
                item_in = ItemCreate(
                    name=f"{category} Item {j}",
                    description=f"A {category} item",
                    category=category,
                    quantity=j+1,
                    price=100.0 * (j+1),
                    location_id=test_location.id
                )
                crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 测试获取每个类别的物品
        for category in categories:
            items = crud_item.get_by_category(db, category=category, owner_id=test_user.id)
            assert len(items) == 2
            for item in items:
                assert item.category == category
                assert f"{category} Item" in item.name
    
    def test_get_by_categories(self, db: Session, test_user, test_location):
        """测试获取多个类别的物品"""
        # 创建不同类别的物品
        categories = ["Food", "Electronics", "Clothing", "Books", "Tools"]
        for i, category in enumerate(categories):
            for j in range(2):
                item_in = ItemCreate(
                    name=f"{category} Item {j}",
                    description=f"A {category} item",
                    category=category,
                    quantity=j+1,
                    price=100.0 * (j+1),
                    location_id=test_location.id
                )
                crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 测试获取多个类别的物品
        selected_categories = ["Food", "Electronics", "Books"]
        items = crud_item.get_by_categories(db, categories=selected_categories, owner_id=test_user.id)
        
        # 应该返回 3 个类别，每个类别 2 个物品，总共 6 个物品
        assert len(items) == 6
        
        # 验证返回的物品类别是否正确
        item_categories = [item.category for item in items]
        for category in selected_categories:
            assert item_categories.count(category) == 2
        
        # 验证未选择的类别物品没有返回
        for category in ["Clothing", "Tools"]:
            assert category not in item_categories
    
    def test_search_by_name(self, db: Session, test_user, test_location):
        """测试按名称和描述搜索物品"""
        # 创建不同名称和描述的物品
        test_items = [
            {"name": "Laptop", "description": "A portable computer"},
            {"name": "Phone", "description": "A mobile device"},
            {"name": "Tablet", "description": "A touchscreen device"},
            {"name": "Phone Charger", "description": "Charger for mobile phones"},
            {"name": "Computer Mouse", "description": "Wireless mouse for laptop"}
        ]
        
        for item_data in test_items:
            item_in = ItemCreate(
                name=item_data["name"],
                description=item_data["description"],
                category="Electronics",
                quantity=1,
                price=100.0,
                location_id=test_location.id
            )
            crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 测试按名称搜索包含"Phone"的物品
        items = crud_item.search_by_name(db, name="Phone", owner_id=test_user.id)
        assert len(items) == 2  # "Phone" 和 "Phone Charger"
        for item in items:
            assert "Phone" in item.name
        
        # 测试按名称搜索包含"Laptop"的物品
        items = crud_item.search_by_name(db, name="Laptop", owner_id=test_user.id)
        assert len(items) == 2  # "Laptop"和"Computer Mouse"(其描述包含"laptop")
        laptop_items = {item.name for item in items}
        assert "Laptop" in laptop_items
        assert "Computer Mouse" in laptop_items
        
        # 测试按描述搜索包含"computer"的物品 - 新增测试
        items = crud_item.search_by_name(db, name="computer", owner_id=test_user.id)
        assert len(items) == 2  # 包含"Laptop"和"Computer Mouse"
        computer_items = {item.name for item in items}
        assert "Laptop" in computer_items
        assert "Computer Mouse" in computer_items
        
        # 测试按描述搜索包含"mobile"的物品 - 新增测试
        items = crud_item.search_by_name(db, name="mobile", owner_id=test_user.id)
        assert len(items) == 2  # 包含"Phone"和"Phone Charger"
        mobile_items = {item.name for item in items}
        assert "Phone" in mobile_items
        assert "Phone Charger" in mobile_items
    
    def test_update_item(self, db: Session, test_user, test_location):
        """测试更新物品"""
        item_in = ItemCreate(
            name="Test Item",
            description="A test item",
            category="Test Category",
            quantity=1,
            price=100.0,
            location_id=test_location.id
        )
        
        item = crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 更新物品
        item_update = ItemUpdate(
            name="Updated Item",
            description="An updated item",
            category="Updated Category",
            quantity=2,
            price=200.0
        )
        
        updated_item = crud_item.update(db, db_obj=item, obj_in=item_update)
        
        assert updated_item.id == item.id
        assert updated_item.name == item_update.name
        assert updated_item.description == item_update.description
        assert updated_item.category == item_update.category
        assert updated_item.quantity == item_update.quantity
        assert updated_item.price == item_update.price
        assert updated_item.location_id == item.location_id  # 位置不应该改变
        assert updated_item.owner_id == item.owner_id  # 所有者不应该改变
    
    def test_remove_item(self, db: Session, test_user, test_location):
        """测试删除物品"""
        item_in = ItemCreate(
            name="Test Item",
            description="A test item",
            category="Test Category",
            quantity=1,
            price=100.0,
            location_id=test_location.id
        )
        
        item = crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 删除物品
        removed_item = crud_item.remove(db, id=item.id)
        assert removed_item.id == item.id
        
        # 确认物品已被删除
        stored_item = crud_item.get(db, id=item.id)
        assert stored_item is None 
        