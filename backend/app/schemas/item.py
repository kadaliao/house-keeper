from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# Shared properties
class ItemBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = 1
    price: Optional[float] = None
    purchase_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    image_url: Optional[str] = None
    location_id: Optional[int] = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    name: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    pass


# Properties shared by models stored in DB
class ItemInDBBase(ItemBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Properties to return to client
class Item(ItemInDBBase):
    pass


# Properties stored in DB
class ItemInDB(ItemInDBBase):
    pass 