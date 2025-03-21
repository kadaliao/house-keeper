from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class CRUDItem(CRUDBase[Item, ItemCreate, ItemUpdate]):
    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Item]:
        return (
            db.query(self.model)
            .filter(Item.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_location(
        self, db: Session, *, location_id: int, skip: int = 0, limit: int = 100, owner_id: Optional[int] = None
    ) -> List[Item]:
        query = db.query(self.model).filter(Item.location_id == location_id)
        
        if owner_id is not None:
            query = query.filter(Item.owner_id == owner_id)
            
        return query.offset(skip).limit(limit).all()
    
    def get_by_category(
        self, db: Session, *, category: str, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Item]:
        return (
            db.query(self.model)
            .filter(Item.category == category, Item.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_categories(
        self, db: Session, *, categories: List[str], owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Item]:
        """
        获取属于多个类别之一的物品
        """
        # 使用 OR 条件组合多个类别查询
        category_filters = [Item.category == category for category in categories]
        return (
            db.query(self.model)
            .filter(or_(*category_filters), Item.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search_by_name(
        self, db: Session, *, name: str, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Item]:
        """
        通过名称或描述搜索物品
        """
        search_term = f"%{name.lower()}%"
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.name.ilike(search_term),
                    self.model.description.ilike(search_term)
                ),
                self.model.owner_id == owner_id
            )
            .offset(skip)
            .limit(limit)
            .all()
        )


item = CRUDItem(Item) 