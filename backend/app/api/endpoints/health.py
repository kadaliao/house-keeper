from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import text

from app.api import deps
from app.db.session import engine

router = APIRouter()


@router.get("/health", status_code=200)
def health_check():
    """
    健康检查端点，用于Docker容器健康检查
    """
    return {"status": "ok", "message": "服务正常运行"}


@router.get("/health/db", status_code=200)
def db_health_check(db: Session = Depends(deps.get_db)):
    """
    数据库连接健康检查
    """
    try:
        # 尝试执行一个简单的查询，使用text()函数显式声明SQL
        db.execute(text("SELECT 1"))
        return {
            "status": "ok", 
            "message": "数据库连接正常",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"status": "error", "message": f"数据库连接异常: {str(e)}"} 