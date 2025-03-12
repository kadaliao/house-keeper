from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Location])
def read_locations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    parent_id: Optional[int] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve locations.
    """
    if parent_id is not None:
        locations = crud.location.get_multi_by_parent(
            db, parent_id=parent_id, owner_id=current_user.id
        )
    else:
        locations = crud.location.get_multi_by_owner(
            db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return locations


@router.get("/tree", response_model=List[schemas.LocationTree])
def read_location_tree(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve location tree.
    """
    return crud.location.get_location_tree(db, owner_id=current_user.id)


@router.post("/", response_model=schemas.Location)
def create_location(
    *,
    db: Session = Depends(deps.get_db),
    location_in: schemas.LocationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new location.
    """
    location = crud.location.create(db=db, obj_in=location_in, owner_id=current_user.id)
    return location


@router.get("/{id}", response_model=schemas.Location)
def read_location(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get location by ID.
    """
    location = crud.location.get(db=db, id=id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return location


@router.put("/{id}", response_model=schemas.Location)
def update_location(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    location_in: schemas.LocationUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a location.
    """
    location = crud.location.get(db=db, id=id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    location = crud.location.update(db=db, db_obj=location, obj_in=location_in)
    return location


@router.delete("/{id}", response_model=schemas.Location)
def delete_location(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a location.
    """
    location = crud.location.get(db=db, id=id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if location has items
    items = crud.item.get_by_location(db, location_id=id)
    if items:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete location with items. Move or delete items first."
        )
    
    # Check if location has children
    children = crud.location.get_multi_by_parent(db, parent_id=id, owner_id=current_user.id)
    if children:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete location with sub-locations. Delete sub-locations first."
        )
    
    location = crud.location.remove(db=db, id=id)
    return location 