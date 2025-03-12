from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.settings import settings

# 同步引擎和会话
engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 移除异步部分，只保留同步部分

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 