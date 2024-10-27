from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
import models
from database import SessionLocal, engine
import shutil
import os
from uuid import uuid4
from PIL import Image
from io import BytesIO
from sqlalchemy.orm import joinedload

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIRECTORY = "uploads"
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIRECTORY), name="uploads")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ItemBase(BaseModel):
    name: str
    current_location_id: int
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class ItemCreate(BaseModel):
    name: str
    current_location_id: int
    notes: Optional[str] = None
    type_ids: List[int] = []

class Item(ItemBase):
    id: int
    added_date: date
    types: List["ItemType"]

    class Config:
        orm_mode = True

class LocationBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        orm_mode = True

class ItemTypeBase(BaseModel):
    name: str

class ItemTypeCreate(ItemTypeBase):
    pass

class ItemType(ItemTypeBase):
    id: int

    class Config:
        orm_mode = True

class ItemTypeRelationCreate(BaseModel):
    parent_id: int
    child_id: int

def resize_and_crop(image, size):
    if image.size[0] < image.size[1]:
        ratio = size[0] / image.size[0]
        new_size = (size[0], int(image.size[1] * ratio))
    else:
        ratio = size[1] / image.size[1]
        new_size = (int(image.size[0] * ratio), size[1])
    image = image.resize(new_size, Image.LANCZOS)
    center = (image.size[0] // 2, image.size[1] // 2)
    left = center[0] - size[0] // 2
    top = center[1] - size[1] // 2
    right = center[0] + size[0] // 2
    bottom = center[1] + size[1] // 2
    return image.crop((left, top, right, bottom))

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    file_location = f"{UPLOAD_DIRECTORY}/{unique_filename}"
    
    image = Image.open(BytesIO(await file.read()))
    
    resized_image = resize_and_crop(image, (300, 300))
    
    resized_image.save(file_location)
    
    return {"filename": unique_filename}

@app.post("/item_types/", response_model=ItemType)
def create_item_type(item_type: ItemTypeCreate, db: Session = Depends(get_db)):
    db_item_type = models.ItemType(**item_type.dict())
    db.add(db_item_type)
    db.commit()
    db.refresh(db_item_type)
    return db_item_type

@app.get("/item_types/", response_model=List[ItemType])
def read_item_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    item_types = db.query(models.ItemType).offset(skip).limit(limit).all()
    return item_types

@app.post("/item_type_relations/", response_model=ItemTypeRelationCreate)
def create_item_type_relation(relation: ItemTypeRelationCreate, db: Session = Depends(get_db)):
    db_relation = models.ItemTypeRelation(**relation.dict())
    db.add(db_relation)
    db.commit()
    db.refresh(db_relation)
    return db_relation

@app.post("/items/", response_model=Item)
async def create_item(
    name: str = Form(...),
    current_location_id: int = Form(...),
    notes: Optional[str] = Form(None),
    type_ids: List[int] = Form([]),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    photo_url = None
    if photo:
        upload_result = await upload_image(photo)
        photo_url = f"/uploads/{upload_result['filename']}"

    db_item = models.Item(
        name=name,
        current_location_id=current_location_id,
        notes=notes,
        photo_url=photo_url,
        added_date=date.today()
    )
    db.add(db_item)
    db.flush()

    for type_id in type_ids:
        item_type = db.query(models.ItemType).filter(models.ItemType.id == type_id).first()
        if item_type:
            db_item.types.append(item_type)

    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/items/", response_model=List[Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Item).options(joinedload(models.Item.types)).offset(skip).limit(limit).all()
    return items

@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/items/{item_id}", response_model=Item)
async def update_item(
    item_id: int,
    name: str = Form(...),
    current_location_id: int = Form(...),
    notes: Optional[str] = Form(None),
    type_ids: List[int] = Form([]),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.name = name
    db_item.current_location_id = current_location_id
    db_item.notes = notes
    
    if photo:
        upload_result = await upload_image(photo)
        db_item.photo_url = f"/uploads/{upload_result['filename']}"

    db_item.types.clear()
    for type_id in type_ids:
        item_type = db.query(models.ItemType).filter(models.ItemType.id == type_id).first()
        if item_type:
            db_item.types.append(item_type)

    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/{item_id}", response_model=Item)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return db_item

@app.post("/locations/", response_model=Location)
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = models.Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.get("/locations/", response_model=List[Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = db.query(models.Location).offset(skip).limit(limit).all()
    return locations

@app.get("/locations/{location_id}", response_model=Location)
def read_location(location_id: int, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@app.put("/locations/{location_id}", response_model=Location)
def update_location(location_id: int, location: LocationCreate, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    for key, value in location.dict().items():
        setattr(db_location, key, value)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.delete("/locations/{location_id}", response_model=Location)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(db_location)
    db.commit()
    return db_location

def get_all_sub_locations(location_id: int, db: Session):
    """
    递归获取指定位置及其所有子位置的ID。
    """
    sub_locations = db.query(models.Location).filter(models.Location.parent_id == location_id).all()
    sub_location_ids = [location.id for location in sub_locations]
    for sub_location in sub_locations:
        sub_location_ids.extend(get_all_sub_locations(sub_location.id, db))
    return sub_location_ids

@app.get("/search/")
def search_items(query: str, location_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    根据关键词搜索物品，支持在指定位置及其子位置中搜索。
    """
    if location_id:
        # 获取指定位置及其所有子位置的ID
        sub_location_ids = get_all_sub_locations(location_id, db)
        sub_location_ids.append(location_id)
        
        # 在指定位置及其子位置中搜索物品
        items = db.query(models.Item).filter(
            models.Item.name.ilike(f"%{query}%"),
            models.Item.current_location_id.in_(sub_location_ids)
        ).all()
    else:
        # 全局搜索物品
        items = db.query(models.Item).filter(
            models.Item.name.ilike(f"%{query}%")
        ).all()
    
    return items

class ReminderCreate(BaseModel):
    item_id: int
    reminder_type: str
    reminder_date: date
    is_active: bool = True

class Reminder(ReminderCreate):
    id: int

    class Config:
        orm_mode = True

@app.post("/reminders/", response_model=Reminder)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    db_reminder = models.Reminder(**reminder.dict())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

@app.get("/reminders/", response_model=List[Reminder])
def read_reminders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reminders = db.query(models.Reminder).offset(skip).limit(limit).all()
    return reminders

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
