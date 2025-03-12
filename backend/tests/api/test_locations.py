import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.location import Location
from app.models.user import User
from datetime import datetime, timezone


class TestLocationsEndpoints:
    def test_create_location(self, authenticated_client: TestClient):
        """测试创建位置"""
        location_data = {
            "name": "Test Location",
            "description": "This is a test location",
            "parent_id": None
        }
        
        response = authenticated_client.post("/api/v1/locations/", json=location_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == location_data["name"]
        assert data["description"] == location_data["description"]
        assert data["parent_id"] is None
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_sublocation(self, authenticated_client: TestClient, db: Session, test_user: User):
        """测试创建子位置"""
        # 先创建父位置
        parent_location = Location(
            name="Parent Location",
            description="This is a parent location",
            parent_id=None,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(parent_location)
        db.commit()
        db.refresh(parent_location)
        
        # 创建子位置
        location_data = {
            "name": "Child Location",
            "description": "This is a child location",
            "parent_id": parent_location.id
        }
        
        response = authenticated_client.post("/api/v1/locations/", json=location_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == location_data["name"]
        assert data["description"] == location_data["description"]
        assert data["parent_id"] == parent_location.id
    
    def test_get_locations(self, authenticated_client: TestClient, db: Session, test_user: User):
        """测试获取位置列表"""
        # 创建测试位置
        for i in range(3):
            location = Location(
                name=f"Test Location {i}",
                description=f"Test description {i}",
                parent_id=None,
                owner_id=test_user.id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(location)
        
        db.commit()
        
        response = authenticated_client.get("/api/v1/locations/")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 3
    
    def test_get_location(self, authenticated_client: TestClient, db: Session, test_user: User):
        """测试通过ID获取位置"""
        # 创建测试位置
        location = Location(
            name="Test Location",
            description="Test description",
            parent_id=None,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        
        # 测试获取特定位置
        response = authenticated_client.get(f"/api/v1/locations/{location.id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == location.id
        assert data["name"] == location.name
        assert data["description"] == location.description
    
    def test_get_location_tree(self, authenticated_client: TestClient, db: Session, test_user: User):
        """测试获取位置树"""
        # 创建父位置
        parent = Location(
            name="Parent Location",
            description="Parent description",
            parent_id=None,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(parent)
        db.commit()
        db.refresh(parent)
        
        # 创建子位置
        child = Location(
            name="Child Location",
            description="Child description",
            parent_id=parent.id,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(child)
        db.commit()
        
        # 获取位置树
        response = authenticated_client.get("/api/v1/locations/tree")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1
        
        # 查找父位置
        found_parent = None
        for location in data:
            if location["id"] == parent.id:
                found_parent = location
                break
        
        assert found_parent is not None
        assert "children" in found_parent
        assert len(found_parent["children"]) == 1
        assert found_parent["children"][0]["id"] == child.id
    
    def test_update_location(self, authenticated_client: TestClient, db: Session, test_user: User):
        """测试更新位置"""
        # 创建测试位置
        location = Location(
            name="Test Location",
            description="Test description",
            parent_id=None,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        
        # 测试更新位置
        update_data = {
            "name": "Updated Location",
            "description": "Updated description"
        }
        
        response = authenticated_client.put(f"/api/v1/locations/{location.id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["parent_id"] == location.parent_id  # 父位置应该保持不变
    
    def test_delete_location(self, authenticated_client: TestClient, db: Session, test_user: User):
        """测试删除位置"""
        # 创建测试位置
        location = Location(
            name="Test Location",
            description="Test description",
            parent_id=None,
            owner_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        
        # 测试删除位置
        response = authenticated_client.delete(f"/api/v1/locations/{location.id}")
        assert response.status_code == 200
        
        # 确认位置已被删除
        response = authenticated_client.get(f"/api/v1/locations/{location.id}")
        assert response.status_code == 404 