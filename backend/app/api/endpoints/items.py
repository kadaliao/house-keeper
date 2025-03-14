from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Item])
def read_items(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    categories: Optional[str] = None,
    location_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve items.
    
    - **categories**: 可选，多个类别，用逗号分隔 (例如: "类别1,类别2,类别3")
    - **category**: 可选，单一类别 (兼容旧版接口)
    - **location_id**: 可选，位置ID
    - **search**: 可选，搜索关键词
    """
    # 处理多类别筛选（优先使用categories参数）
    if categories:
        categories_list = [cat.strip() for cat in categories.split(',')]
        if categories_list:
            items = crud.item.get_by_categories(
                db, categories=categories_list, owner_id=current_user.id, skip=skip, limit=limit
            )
            return items
    
    # 兼容旧版单类别筛选
    if category:
        items = crud.item.get_by_category(
            db, category=category, owner_id=current_user.id, skip=skip, limit=limit
        )
    elif location_id:
        items = crud.item.get_by_location(
            db, location_id=location_id, skip=skip, limit=limit
        )
    elif search:
        items = crud.item.search_by_name(
            db, name=search, owner_id=current_user.id, skip=skip, limit=limit
        )
    else:
        items = crud.item.get_multi_by_owner(
            db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return items


@router.post("/", response_model=schemas.Item)
def create_item(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.ItemCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new item.
    """
    item = crud.item.create(db=db, obj_in=item_in, owner_id=current_user.id)
    return item


@router.get("/{id}", response_model=schemas.Item)
def read_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get item by ID.
    """
    item = crud.item.get(db=db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return item


@router.put("/{id}", response_model=schemas.Item)
def update_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    item_in: schemas.ItemUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an item.
    """
    item = crud.item.get(db=db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.item.update(db=db, db_obj=item, obj_in=item_in)
    return item


@router.delete("/{id}", response_model=schemas.Item)
def delete_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an item.
    """
    item = crud.item.get(db=db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    item = crud.item.remove(db=db, id=id)
    return item 