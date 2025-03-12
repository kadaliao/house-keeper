import pytest
from sqlalchemy.orm import Session
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User
from app.core.security import verify_password
from datetime import datetime, timezone


class TestUserCRUD:
    def test_create_user(self, db: Session):
        """测试创建用户"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        user = crud_user.create(db, obj_in=user_in)
        
        assert user.username == user_in.username
        assert user.email == user_in.email
        assert verify_password("testpassword", user.hashed_password)
        assert user.first_name == user_in.first_name
        assert user.last_name == user_in.last_name
        
    def test_get_user(self, db: Session):
        """测试通过ID获取用户"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        user = crud_user.create(db, obj_in=user_in)
        
        stored_user = crud_user.get(db, id=user.id)
        assert stored_user
        assert stored_user.id == user.id
        assert stored_user.username == user.username
        assert stored_user.email == user.email
        
    def test_get_user_by_username(self, db: Session):
        """测试通过用户名获取用户"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        user = crud_user.create(db, obj_in=user_in)
        
        stored_user = crud_user.get_by_username(db, username=user.username)
        assert stored_user
        assert stored_user.id == user.id
        assert stored_user.username == user.username
        assert stored_user.email == user.email
        
    def test_get_user_by_email(self, db: Session):
        """测试通过邮箱获取用户"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User"
        )
        
        user = crud_user.create(db, obj_in=user_in)
        
        stored_user = crud_user.get_by_email(db, email=user.email)
        assert stored_user
        assert stored_user.id == user.id
        assert stored_user.username == user.username
        assert stored_user.email == user.email
        
    def test_update_user(self, db: Session):
        """测试更新用户"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User"
        )
        
        user = crud_user.create(db, obj_in=user_in)
        
        user_update = UserUpdate(
            email="updated@example.com",
            first_name="Updated",
            last_name="User"
        )
        
        updated_user = crud_user.update(db, db_obj=user, obj_in=user_update)
        
        assert updated_user.id == user.id
        assert updated_user.username == user.username  # 用户名不应该改变
        assert updated_user.email == user_update.email
        assert updated_user.first_name == user_update.first_name
        assert updated_user.last_name == user_update.last_name
        
    def test_update_user_password(self, db: Session):
        """测试更新用户密码"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User"
        )
        
        user = crud_user.create(db, obj_in=user_in)
        
        user_update = UserUpdate(
            password="newpassword"
        )
        
        updated_user = crud_user.update(db, db_obj=user, obj_in=user_update)
        
        assert updated_user.id == user.id
        assert verify_password("newpassword", updated_user.hashed_password)
        
    def test_authenticate_user(self, db: Session):
        """测试用户认证"""
        user_in = UserCreate(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User"
        )
        
        crud_user.create(db, obj_in=user_in)
        
        # 测试有效认证
        authenticated_user = crud_user.authenticate(
            db, username="testuser", password="testpassword"
        )
        assert authenticated_user
        assert authenticated_user.username == user_in.username
        
        # 测试无效认证
        invalid_auth = crud_user.authenticate(
            db, username="testuser", password="wrongpassword"
        )
        assert invalid_auth is None 