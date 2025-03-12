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
    
    def test_search_by_name(self, db: Session, test_user, test_location):
        """测试按名称搜索物品"""
        # 创建不同名称的物品
        item_names = ["Laptop", "Phone", "Tablet", "Phone Charger"]
        for name in item_names:
            item_in = ItemCreate(
                name=name,
                description=f"A {name.lower()}",
                category="Electronics",
                quantity=1,
                price=100.0,
                location_id=test_location.id
            )
            crud_item.create(db, obj_in=item_in, owner_id=test_user.id)
        
        # 测试搜索包含"Phone"的物品
        items = crud_item.search_by_name(db, name="Phone", owner_id=test_user.id)
        assert len(items) == 2  # "Phone" 和 "Phone Charger"
        for item in items:
            assert "Phone" in item.name
        
        # 测试搜索包含"Laptop"的物品
        items = crud_item.search_by_name(db, name="Laptop", owner_id=test_user.id)
        assert len(items) == 1
        assert items[0].name == "Laptop"
    
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
        