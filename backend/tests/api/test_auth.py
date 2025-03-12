import pytest
import os
from fastapi.testclient import TestClient as StarletteTestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate
import json
from contextlib import contextmanager
from datetime import datetime, timezone
from app.db.base import Base  # 导入包含所有模型的Base
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.api.deps import get_db
from tests.conftest import test_engine, TestingSessionLocal, override_get_db

# 确保导入所有模型，以便在创建表时能够包含这些模型
from app.models.user import User
from app.models.item import Item
from app.models.location import Location
from app.models.reminder import Reminder

# 获取测试环境信息
is_postgres = os.environ.get("TEST_DATABASE_URL", "").startswith("postgresql")


# 准备测试数据库
def setup_database():
    """清理并重建数据库表结构"""
    print("设置测试数据库...")
    # 清理并重建表
    with test_engine.begin() as conn:
        # 先删除现有表
        if is_postgres:
            try:
                print("  > 删除现有模式...")
                conn.execute(text("DROP SCHEMA public CASCADE"))
                conn.execute(text("CREATE SCHEMA public"))
                # 移除特定用户的GRANT语句
                # 只保留公共权限
                conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
                print("  > 模式已重置")
            except Exception as e:
                print(f"  > 重置数据库架构时出错: {e}")
        else:
            print("  > 删除所有表...")
            # 对于SQLite:
            Base.metadata.drop_all(bind=conn)
            
        # 重新创建所有表
        print("  > 创建所有表...")
        Base.metadata.create_all(bind=conn)
        print("  > 所有表已创建")
        
        if is_postgres:
            # 列出所有创建的表 (PostgreSQL)
            tables_result = conn.execute(text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
            ))
            tables = [table[0] for table in tables_result.fetchall()]
            print(f"  > 数据库中的表: {tables}")
        else:
            # 列出所有创建的表 (SQLite)
            tables_result = conn.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ))
            tables = [table[0] for table in tables_result.fetchall()]
            print(f"  > 数据库中的表: {tables}")


# 创建测试客户端
def create_test_client():
    """创建FastAPI测试客户端"""
    # 设置测试数据库依赖覆盖
    app.dependency_overrides[get_db] = override_get_db
    # 重置测试数据库
    setup_database()
    # 返回测试客户端
    return StarletteTestClient(app)


class TestSingleUserRegistration:
    """测试单个用户注册功能"""
    
    def test_register_user(self):
        """测试用户注册成功"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword",
            "first_name": "Test",
            "last_name": "User"
        }
        
        # 执行测试
        response = client.post(
            "/api/v1/auth/register",
            json=user_data
        )
        
        # 验证结果
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert data["first_name"] == user_data["first_name"]
        assert data["last_name"] == user_data["last_name"]
        assert "id" in data
        assert "hashed_password" not in data
        
        # 验证数据库中是否正确保存用户
        db = TestingSessionLocal()
        try:
            db_user = db.query(User).filter(User.email == user_data["email"]).first()
            assert db_user is not None
            assert db_user.username == user_data["username"]
            assert verify_password(user_data["password"], db_user.hashed_password)
        finally:
            db.close()
    
    def test_register_duplicate_username(self):
        """测试注册重复用户名"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据 - 先创建一个用户
        db = TestingSessionLocal()
        try:
            existing_user = User(
                username="testuser",
                email="existing@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Existing",
                last_name="User",
                is_active=True
            )
            db.add(existing_user)
            db.commit()
        finally:
            db.close()
        
        # 尝试用相同用户名注册
        duplicate_user_data = {
            "username": "testuser",  # 已存在的用户名
            "email": "different@example.com",
            "password": "newpassword",
            "first_name": "New",
            "last_name": "User"
        }
        
        # 执行测试
        response = client.post(
            "/api/v1/auth/register",
            json=duplicate_user_data
        )
        
        # 验证结果
        assert response.status_code == 400
        data = response.json()
        assert "username already exists" in data["detail"].lower()
        
        # 验证数据库中没有创建新用户
        db = TestingSessionLocal()
        try:
            count = db.query(User).count()
            assert count == 1  # 只有一个用户 (之前创建的)
        finally:
            db.close()
    
    def test_register_duplicate_email(self):
        """测试注册重复邮箱"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据 - 先创建一个用户
        db = TestingSessionLocal()
        try:
            existing_user = User(
                username="existinguser",
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Existing",
                last_name="User",
                is_active=True
            )
            db.add(existing_user)
            db.commit()
        finally:
            db.close()
        
        # 尝试用相同邮箱注册
        duplicate_user_data = {
            "username": "newuser",
            "email": "test@example.com",  # 已存在的邮箱
            "password": "newpassword",
            "first_name": "New",
            "last_name": "User"
        }
        
        # 执行测试
        response = client.post(
            "/api/v1/auth/register",
            json=duplicate_user_data
        )
        
        # 验证结果
        assert response.status_code == 400
        data = response.json()
        assert "email already exists" in data["detail"].lower()
        
        # 验证数据库中没有创建新用户
        db = TestingSessionLocal()
        try:
            count = db.query(User).count()
            assert count == 1  # 只有一个用户 (之前创建的)
        finally:
            db.close()


class TestLogin:
    """测试登录功能"""
    
    def test_login_success(self):
        """测试登录成功"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据 - 先创建一个用户
        db = TestingSessionLocal()
        try:
            user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Test",
                last_name="User",
                is_active=True
            )
            db.add(user)
            db.commit()
        finally:
            db.close()
        
        # 执行测试
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser", "password": "testpassword"}
        )
        
        # 验证结果
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
        # 验证用户信息
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        user_response = client.get("/api/v1/auth/me", headers=headers)
        assert user_response.status_code == 200
        user_data = user_response.json()
        assert user_data["username"] == "testuser"
        assert user_data["email"] == "test@example.com"
        assert user_data["first_name"] == "Test"
        assert user_data["last_name"] == "User"
    
    def test_login_wrong_password(self):
        """测试错误密码登录"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据 - 先创建一个用户
        db = TestingSessionLocal()
        try:
            user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Test",
                last_name="User",
                is_active=True
            )
            db.add(user)
            db.commit()
        finally:
            db.close()
        
        # 执行测试 - 使用错误密码
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser", "password": "wrongpassword"}
        )
        
        # 验证结果
        assert response.status_code == 400
        data = response.json()
        assert "incorrect username or password" in data["detail"].lower()


class TestUserProfile:
    """测试用户资料功能"""
    
    def test_get_current_user(self):
        """测试获取当前用户信息"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据 - 先创建一个用户并登录
        db = TestingSessionLocal()
        try:
            user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Test",
                last_name="User",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            user_id = user.id
        finally:
            db.close()
        
        # 登录获取token
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser", "password": "testpassword"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 执行测试
        response = client.get("/api/v1/auth/me", headers=headers)
        
        # 验证结果
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["first_name"] == "Test"
        assert data["last_name"] == "User"
        assert data["is_active"] == True
        assert "hashed_password" not in data
    
    def test_update_user(self):
        """测试更新用户信息"""
        # 设置测试环境
        client = create_test_client()
        
        # 准备测试数据 - 先创建一个用户并登录
        db = TestingSessionLocal()
        try:
            user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                first_name="Test",
                last_name="User",
                is_active=True
            )
            db.add(user)
            db.commit()
        finally:
            db.close()
        
        # 登录获取token
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser", "password": "testpassword"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 准备更新数据
        update_data = {
            "email": "updated@example.com",
            "password": "newpassword",
            "full_name": "Updated User"
        }
        
        # 执行测试
        response = client.put(
            "/api/v1/auth/me",
            json=update_data,
            headers=headers
        )
        
        # 验证结果
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == update_data["email"]
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "User"
        
        # 验证数据库中的更新
        db = TestingSessionLocal()
        try:
            updated_user = db.query(User).filter(User.username == "testuser").first()
            assert updated_user.email == update_data["email"]
            assert updated_user.first_name == "Updated"
            assert updated_user.last_name == "User"
            # 验证密码已更新
            assert verify_password("newpassword", updated_user.hashed_password)
        finally:
            db.close()
        
        # 尝试用新密码登录
        new_login_response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser", "password": "newpassword"}
        )
        assert new_login_response.status_code == 200 