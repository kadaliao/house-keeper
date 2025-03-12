import os
import sys

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from typing import Generator
from sqlalchemy.pool import NullPool

from app.main import app
from app.db.base import Base
from app.api.deps import get_db
from app.core.settings import settings
from app.models.user import User
from app.crud.crud_user import user as crud_user
from app.core.security import get_password_hash
from datetime import datetime, timezone
from app.schemas.user import UserCreate

# 从环境变量获取测试数据库URL，如果没有则使用SQLite
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", 
    "sqlite:///:memory:"
)

# 根据环境变量选择数据库类型
is_postgres = TEST_DATABASE_URL.startswith("postgresql")

# 创建同步引擎，对于PostgreSQL不需要check_same_thread参数
if is_postgres:
    connect_args = {}
else:
    connect_args = {"check_same_thread": False}

# 每次测试运行重新创建引擎和连接
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args=connect_args,
    poolclass=NullPool,  # 禁用连接池以确保每次测试用独立连接
    echo=True,  # 启用SQL语句日志
)

# 创建测试会话工厂
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
    expire_on_commit=False,
)

# 重写依赖项以使用测试数据库
def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """创建测试数据库会话"""
    # 创建所有表
    with test_engine.begin() as conn:
        # 如果使用PostgreSQL，先删除所有表再创建
        if is_postgres:
            try:
                conn.execute(text("DROP SCHEMA public CASCADE"))
                conn.execute(text("CREATE SCHEMA public"))
                # 移除特定用户的GRANT语句，只保留公共权限
                conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
            except Exception as e:
                print(f"重置数据库架构时出错: {e}")
        
        # 创建所有表
        Base.metadata.create_all(bind=conn)
    
    # 创建会话
    db = TestingSessionLocal()
    
    try:
        # 测试连接
        db.execute(text("SELECT 1"))
        
        # 确保所有表已创建
        if is_postgres:
            print("使用PostgreSQL测试数据库")
            # 对于PostgreSQL，可以列出所有表进行调试
            with test_engine.connect() as conn:
                tables_result = conn.execute(text(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
                ))
                tables = [table[0] for table in tables_result.fetchall()]
                print(f"测试数据库中的表: {tables}")
        else:
            print("使用SQLite内存数据库")
            # 对于SQLite，使用sqlite_master表检查
            with test_engine.connect() as conn:
                tables_result = conn.execute(text(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                ))
                tables = [table[0] for table in tables_result.fetchall()]
                print(f"测试数据库中的表: {tables}")
                
        # 返回会话供测试使用
        yield db
    finally:
        # 关闭会话
        db.close()
        
        # 清理 - 如果是PostgreSQL则清空所有表数据
        with test_engine.begin() as conn:
            if is_postgres:
                # 对于PostgreSQL，清空所有表
                for table in reversed(Base.metadata.sorted_tables):
                    try:
                        conn.execute(text(f'TRUNCATE TABLE "{table.name}" CASCADE'))
                    except Exception as e:
                        print(f"清空表 {table.name} 时出错: {e}")
            else:
                # 对于SQLite，删除并重建所有表
                Base.metadata.drop_all(bind=conn)
                Base.metadata.create_all(bind=conn)


@pytest.fixture(scope="function")
def client() -> Generator[TestClient, None, None]:
    """创建测试客户端"""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function")
def test_user(db: Session) -> User:
    """创建测试用户"""
    user_in = UserCreate(
        username="testuser",
        email="test@example.com",
        password="testpassword",
        first_name="Test",
        last_name="User"
    )
    
    # 创建用户对象
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_active=True
    )
    
    # 添加用户到数据库
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@pytest.fixture(scope="function")
def authenticated_client(client: TestClient, test_user: User) -> TestClient:
    """创建已认证的测试客户端"""
    login_data = {"username": "testuser", "password": "testpassword"}
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    client.headers = {
        "Authorization": f"Bearer {token}",
        **client.headers
    }
    return client 