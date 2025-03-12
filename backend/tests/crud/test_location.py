import pytest
from sqlalchemy.orm import Session
from app.crud.crud_location import location as crud_location
from app.crud.crud_user import user as crud_user
from app.schemas.location import LocationCreate, LocationUpdate
from app.schemas.user import UserCreate
from app.models.location import Location
from datetime import datetime, timezone


class TestLocationCRUD:
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
    
    def test_create_location(self, db: Session, test_user):
        """测试创建位置"""
        location_in = LocationCreate(
            name="Test Location",
            description="A test location"
        )
        
        location = crud_location.create(db, obj_in=location_in, owner_id=test_user.id)
        
        assert location.name == location_in.name
        assert location.description == location_in.description
        assert location.parent_id is None
        assert location.owner_id == test_user.id
    
    def test_create_sublocation(self, db: Session, test_user):
        """测试创建子位置"""
        # 创建父位置
        parent_location_in = LocationCreate(
            name="Parent Location",
            description="A parent location"
        )
        parent_location = crud_location.create(db, obj_in=parent_location_in, owner_id=test_user.id)
        
        # 创建子位置
        child_location_in = LocationCreate(
            name="Child Location",
            description="A child location",
            parent_id=parent_location.id
        )
        child_location = crud_location.create(db, obj_in=child_location_in, owner_id=test_user.id)
        
        assert child_location.name == child_location_in.name
        assert child_location.description == child_location_in.description
        assert child_location.parent_id == parent_location.id
        assert child_location.owner_id == test_user.id
    
    def test_get_location(self, db: Session, test_user):
        """测试通过ID获取位置"""
        location_in = LocationCreate(
            name="Test Location",
            description="A test location"
        )
        
        location = crud_location.create(db, obj_in=location_in, owner_id=test_user.id)
        
        stored_location = crud_location.get(db, id=location.id)
        assert stored_location
        assert stored_location.id == location.id
        assert stored_location.name == location.name
        assert stored_location.description == location.description
        assert stored_location.owner_id == test_user.id
    
    def test_get_multi_by_owner(self, db: Session, test_user):
        """测试获取用户的所有位置"""
        # 创建多个位置
        for i in range(3):
            location_in = LocationCreate(
                name=f"Test Location {i}",
                description=f"A test location {i}"
            )
            crud_location.create(db, obj_in=location_in, owner_id=test_user.id)
        
        locations = crud_location.get_multi_by_owner(db, owner_id=test_user.id)
        assert len(locations) == 3
        for location in locations:
            assert location.owner_id == test_user.id
            assert "Test Location" in location.name
    
    def test_get_multi_by_parent(self, db: Session, test_user):
        """测试获取特定父位置的子位置"""
        # 创建多个父位置
        parent_locations = []
        for i in range(2):
            parent_location_in = LocationCreate(
                name=f"Parent Location {i}",
                description=f"A parent location {i}"
            )
            parent_location = crud_location.create(db, obj_in=parent_location_in, owner_id=test_user.id)
            parent_locations.append(parent_location)
        
        # 创建根位置（没有父位置）
        root_location_in = LocationCreate(
            name="Root Location",
            description="A root location without parent"
        )
        crud_location.create(db, obj_in=root_location_in, owner_id=test_user.id)
        
        # 为每个父位置创建子位置
        for i, parent_location in enumerate(parent_locations):
            for j in range(2):  # 每个父位置创建2个子位置
                child_location_in = LocationCreate(
                    name=f"Child Location {i}-{j}",
                    description=f"A child location of parent {i}",
                    parent_id=parent_location.id
                )
                crud_location.create(db, obj_in=child_location_in, owner_id=test_user.id)
        
        # 测试获取第一个父位置的子位置
        children1 = crud_location.get_multi_by_parent(
            db, parent_id=parent_locations[0].id, owner_id=test_user.id
        )
        assert len(children1) == 2
        for child in children1:
            assert child.parent_id == parent_locations[0].id
            assert "Child Location 0-" in child.name
        
        # 测试获取第二个父位置的子位置
        children2 = crud_location.get_multi_by_parent(
            db, parent_id=parent_locations[1].id, owner_id=test_user.id
        )
        assert len(children2) == 2
        for child in children2:
            assert child.parent_id == parent_locations[1].id
            assert "Child Location 1-" in child.name
        
        # 测试获取根位置（无父位置的位置）
        root_locations = crud_location.get_multi_by_parent(
            db, parent_id=None, owner_id=test_user.id
        )
        assert len(root_locations) == 3  # 2个父位置 + 1个根位置
        for location in root_locations:
            assert location.parent_id is None
    
    def test_get_location_tree(self, db: Session, test_user):
        """测试获取位置树结构"""
        # 创建根位置
        root_location_in = LocationCreate(
            name="Root Location",
            description="A root location"
        )
        root_location = crud_location.create(db, obj_in=root_location_in, owner_id=test_user.id)
        
        # 创建子位置
        child_location_in = LocationCreate(
            name="Child Location",
            description="A child location",
            parent_id=root_location.id
        )
        child_location = crud_location.create(db, obj_in=child_location_in, owner_id=test_user.id)
        
        # 创建子位置的子位置
        grandchild_location_in = LocationCreate(
            name="Grandchild Location",
            description="A grandchild location",
            parent_id=child_location.id
        )
        crud_location.create(db, obj_in=grandchild_location_in, owner_id=test_user.id)
        
        # 测试获取位置树
        location_tree = crud_location.get_location_tree(db, owner_id=test_user.id)
        
        # 应该只有一个根节点
        assert len(location_tree) == 1
        assert location_tree[0].id == root_location.id
        assert location_tree[0].name == root_location.name
        
        # 根节点应该有一个子节点
        assert len(location_tree[0].children) == 1
        assert location_tree[0].children[0].id == child_location.id
        assert location_tree[0].children[0].name == child_location.name
        
        # 子节点应该有一个子节点（孙节点）
        assert len(location_tree[0].children[0].children) == 1
        assert location_tree[0].children[0].children[0].name == "Grandchild Location"
    
    def test_update_location(self, db: Session, test_user):
        """测试更新位置"""
        location_in = LocationCreate(
            name="Test Location",
            description="A test location"
        )
        
        location = crud_location.create(db, obj_in=location_in, owner_id=test_user.id)
        
        # 更新位置
        location_update = LocationUpdate(
            name="Updated Location",
            description="An updated location"
        )
        
        updated_location = crud_location.update(db, db_obj=location, obj_in=location_update)
        
        assert updated_location.id == location.id
        assert updated_location.name == location_update.name
        assert updated_location.description == location_update.description
        assert updated_location.parent_id == location.parent_id  # 父位置不应该改变
        assert updated_location.owner_id == location.owner_id  # 所有者不应该改变
    
    def test_update_location_parent(self, db: Session, test_user):
        """测试更新位置的父位置"""
        # 创建两个父位置
        parent1_in = LocationCreate(
            name="Parent Location 1",
            description="First parent location"
        )
        parent1 = crud_location.create(db, obj_in=parent1_in, owner_id=test_user.id)
        
        parent2_in = LocationCreate(
            name="Parent Location 2",
            description="Second parent location"
        )
        parent2 = crud_location.create(db, obj_in=parent2_in, owner_id=test_user.id)
        
        # 创建子位置，属于第一个父位置
        child_in = LocationCreate(
            name="Child Location",
            description="A child location",
            parent_id=parent1.id
        )
        child = crud_location.create(db, obj_in=child_in, owner_id=test_user.id)
        
        # 更新子位置，改变父位置
        child_update = LocationUpdate(
            parent_id=parent2.id
        )
        
        updated_child = crud_location.update(db, db_obj=child, obj_in=child_update)
        
        assert updated_child.id == child.id
        assert updated_child.name == child.name  # 名称不应该改变
        assert updated_child.parent_id == parent2.id  # 父位置应该更新
    
    def test_remove_location(self, db: Session, test_user):
        """测试删除位置"""
        location_in = LocationCreate(
            name="Test Location",
            description="A test location"
        )
        
        location = crud_location.create(db, obj_in=location_in, owner_id=test_user.id)
        
        # 删除位置
        removed_location = crud_location.remove(db, id=location.id)
        assert removed_location.id == location.id
        
        # 确认位置已被删除
        stored_location = crud_location.get(db, id=location.id)
        assert stored_location is None 