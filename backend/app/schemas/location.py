from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


# Shared properties
class LocationBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None


# Properties to receive on location creation
class LocationCreate(LocationBase):
    name: str


# Properties to receive on location update
class LocationUpdate(LocationBase):
    pass


# Properties shared by models stored in DB
class LocationInDBBase(LocationBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Properties to return to client
class Location(LocationInDBBase):
    pass


# Properties stored in DB
class LocationInDB(LocationInDBBase):
    pass


# Recursive model for location tree
class LocationTree(LocationInDBBase):
    children: List["LocationTree"] = []


LocationTree.model_rebuild() 