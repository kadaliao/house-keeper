from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Table
from sqlalchemy.orm import relationship

from database import Base

# 物品和类型的多对多关系表
item_type_association = Table('item_type_association', Base.metadata,
    Column('item_id', Integer, ForeignKey('items.id')),
    Column('item_type_id', Integer, ForeignKey('item_types.id'))
)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    current_location_id = Column(Integer, ForeignKey("locations.id"))
    added_date = Column(Date)
    notes = Column(String)
    photo_url = Column(String)

    current_location = relationship("Location", back_populates="items")
    types = relationship("ItemType", secondary=item_type_association, back_populates="items")

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    parent_id = Column(Integer, ForeignKey("locations.id"))

    items = relationship("Item", back_populates="current_location")
    parent = relationship("Location", remote_side=[id])

class LocationHistory(Base):
    __tablename__ = "location_history"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    from_location_id = Column(Integer, ForeignKey("locations.id"))
    to_location_id = Column(Integer, ForeignKey("locations.id"))
    change_date = Column(DateTime)
    reason = Column(String)

class SpecialItemInfo(Base):
    __tablename__ = "special_item_info"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    key = Column(String)
    value = Column(String)

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    reminder_type = Column(String)
    reminder_date = Column(Date)
    is_active = Column(Boolean, default=True)

class ItemType(Base):
    __tablename__ = "item_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)

    items = relationship("Item", secondary=item_type_association, back_populates="types")
    children = relationship("ItemTypeRelation", back_populates="parent", foreign_keys="ItemTypeRelation.parent_id")
    parents = relationship("ItemTypeRelation", back_populates="child", foreign_keys="ItemTypeRelation.child_id")

class ItemTypeRelation(Base):
    __tablename__ = "item_type_relations"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("item_types.id"))
    child_id = Column(Integer, ForeignKey("item_types.id"))

    parent = relationship("ItemType", back_populates="children", foreign_keys=[parent_id])
    child = relationship("ItemType", back_populates="parents", foreign_keys=[child_id])
