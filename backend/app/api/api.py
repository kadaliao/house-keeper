from fastapi import APIRouter

from app.api.endpoints import items, auth, locations, reminders, health, stats, uploads

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])

# 保留简单的健康检查端点，用于向后兼容
@api_router.get("/health", tags=["health"])
def health_check():
    """健康检查端点，用于监控系统状态"""
    return {"status": "ok"} 