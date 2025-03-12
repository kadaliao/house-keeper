from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate, LocationTree


class CRUDLocation(CRUDBase[Location, LocationCreate, LocationUpdate]):
    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Location]:
        return (
            db.query(self.model)
            .filter(Location.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_by_parent(
        self, db: Session, *, parent_id: Optional[int], owner_id: int
    ) -> List[Location]:
        if parent_id is None:
            # Get root locations (without parent)
            return (
                db.query(self.model)
                .filter(Location.parent_id.is_(None), Location.owner_id == owner_id)
                .all()
            )
        else:
            return (
                db.query(self.model)
                .filter(Location.parent_id == parent_id, Location.owner_id == owner_id)
                .all()
            )
    
    def get_location_tree(
        self, db: Session, *, owner_id: int
    ) -> List[LocationTree]:
        # Get root locations
        root_locations = self.get_multi_by_parent(db, parent_id=None, owner_id=owner_id)
        result = []
        
        for location in root_locations:
            location_tree = LocationTree.model_validate(location)
            location_tree.children = self._get_children_recursive(db, location.id, owner_id)
            result.append(location_tree)
        
        return result
    
    def _get_children_recursive(
        self, db: Session, parent_id: int, owner_id: int
    ) -> List[LocationTree]:
        children = self.get_multi_by_parent(db, parent_id=parent_id, owner_id=owner_id)
        result = []
        
        for child in children:
            child_tree = LocationTree.model_validate(child)
            child_tree.children = self._get_children_recursive(db, child.id, owner_id)
            result.append(child_tree)
        
        return result


location = CRUDLocation(Location) 