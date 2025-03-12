import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.item import Item
from app.models.user import User
from app.models.location import Location
from datetime import datetime, timezone


class TestItemsEndpoints:
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

    def test_create_item(self, authenticated_client: TestClient, test_location: Location):
        """测试创建物品"""
        item_data = {
            "name": "New Item",
            "description": "A new test item",
            "category": "Test Category",
            "quantity": 1,
            "price": 100.0,
            "location_id": test_location.id
        }
        
        response = authenticated_client.post("/api/v1/items/", json=item_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == item_data["name"]
        assert data["description"] == item_data["description"]
        assert data["price"] == item_data["price"]
    
    def test_get_items(self, authenticated_client: TestClient, db: Session, test_user: User, test_location: Location):
        """测试获取物品列表"""
        # 创建测试物品
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
        
        # 测试获取物品列表
        response = authenticated_client.get("/api/v1/items/")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        found = False
        for item_data in data:
            if item_data["name"] == "Test Item":
                found = True
                break
        
        assert found, "未找到刚创建的物品"
    
    def test_get_item(self, authenticated_client: TestClient, db: Session, test_user: User, test_location: Location):
        """测试获取单个物品"""
        # 创建测试物品
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
        
        # 测试获取物品详情
        response = authenticated_client.get(f"/api/v1/items/{item.id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == item.id
        assert data["name"] == item.name
        assert data["description"] == item.description
        assert data["category"] == item.category
        assert data["quantity"] == item.quantity
        assert data["location_id"] == item.location_id
    
    def test_update_item(self, authenticated_client: TestClient, db: Session, test_user: User, test_location: Location):
        """测试更新物品"""
        # 创建测试物品
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
        
        # 更新数据
        update_data = {
            "name": "Updated Item",
            "description": "Updated description",
            "category": "Updated Category",
            "quantity": 2,
            "price": 200.0
        }
        
        # 发送更新请求
        response = authenticated_client.put(f"/api/v1/items/{item.id}", json=update_data)
        
        # 验证响应
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["name"] == update_data["name"]
        assert response_data["description"] == update_data["description"]
        assert response_data["price"] == update_data["price"]
        
        # 验证数据库中的更新
        db.refresh(item)
        assert item.name == update_data["name"]
        assert item.description == update_data["description"]
        assert item.price == update_data["price"]
    
    def test_delete_item(self, authenticated_client: TestClient, db: Session, test_user: User, test_location: Location):
        """测试删除物品"""
        # 创建测试物品
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
        
        # 测试删除物品
        response = authenticated_client.delete(f"/api/v1/items/{item.id}")
        assert response.status_code == 200
        
        # 验证物品已删除
        deleted_item = db.query(Item).filter(Item.id == item.id).first()
        assert deleted_item is None 