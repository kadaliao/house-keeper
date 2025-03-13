from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app import crud, models, schemas
from app.api import deps
from app.db.session import engine

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取仪表盘所需的统计数据
    """
    # 获取物品、位置和提醒的基础数据
    items = crud.item.get_multi_by_owner(db, owner_id=current_user.id)
    locations = crud.location.get_multi_by_owner(db, owner_id=current_user.id)
    due_reminders = crud.reminder.get_due_reminders(db, owner_id=current_user.id)
    upcoming_reminders = crud.reminder.get_upcoming_reminders(db, owner_id=current_user.id)

    # 计算物品分类统计
    categories = {}
    for item in items:
        category = item.category or "未分类"
        categories[category] = categories.get(category, 0) + 1
    
    category_stats = [{"name": k, "value": v} for k, v in categories.items()]

    # 使用SQL聚合查询直接获取热门位置统计
    popular_locations_query = (
        db.query(
            models.Location.id,
            models.Location.name,
            func.count(models.Item.id).label("item_count")
        )
        .join(models.Item, models.Location.id == models.Item.location_id)
        .filter(models.Location.owner_id == current_user.id)
        .group_by(models.Location.id, models.Location.name)
        .order_by(desc("item_count"))
        .limit(5)
    )
    
    location_stats = [
        {"name": loc.name, "count": loc.item_count, "id": loc.id}
        for loc in popular_locations_query.all()
    ]

    # 创建返回的统计数据
    stats = {
        "counts": {
            "items": len(items),
            "locations": len(locations),
            "due_reminders": len(due_reminders),
            "upcoming_reminders": len(upcoming_reminders)
        },
        "category_distribution": category_stats,
        "location_stats": location_stats,
        # 其他可能的统计数据
    }

    return stats 

@router.get("/popular-locations", response_model=List[Dict[str, Any]])
def get_popular_locations(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    limit: int = 5
) -> Any:
    """
    获取热门位置统计（物品数量最多的位置）
    """
    popular_locations_query = (
        db.query(
            models.Location.id,
            models.Location.name,
            func.count(models.Item.id).label("item_count")
        )
        .join(models.Item, models.Location.id == models.Item.location_id)
        .filter(models.Location.owner_id == current_user.id)
        .group_by(models.Location.id, models.Location.name)
        .order_by(desc("item_count"))
        .limit(limit)
    )
    
    location_stats = [
        {"name": loc.name, "count": loc.item_count, "id": loc.id}
        for loc in popular_locations_query.all()
    ]
    
    return location_stats 