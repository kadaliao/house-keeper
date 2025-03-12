from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Reminder])
def read_reminders(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    item_id: Optional[int] = None,
    due: bool = False,
    upcoming: bool = False,
    days: int = 7,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve reminders.
    """
    if item_id:
        reminders = crud.reminder.get_multi_by_item(
            db, item_id=item_id, owner_id=current_user.id, skip=skip, limit=limit
        )
    elif due:
        reminders = crud.reminder.get_due_reminders(
            db, owner_id=current_user.id, skip=skip, limit=limit
        )
    elif upcoming:
        reminders = crud.reminder.get_upcoming_reminders(
            db, owner_id=current_user.id, days=days, skip=skip, limit=limit
        )
    else:
        reminders = crud.reminder.get_multi_by_owner(
            db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return reminders


@router.post("/", response_model=schemas.Reminder)
def create_reminder(
    *,
    db: Session = Depends(deps.get_db),
    reminder_in: schemas.ReminderCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new reminder.
    """
    reminder = crud.reminder.create(db=db, obj_in=reminder_in, owner_id=current_user.id)
    return reminder


@router.get("/{id}", response_model=schemas.Reminder)
def read_reminder(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get reminder by ID.
    """
    reminder = crud.reminder.get(db=db, id=id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return reminder


@router.put("/{id}", response_model=schemas.Reminder)
def update_reminder(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    reminder_in: schemas.ReminderUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a reminder.
    """
    reminder = crud.reminder.get(db=db, id=id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    reminder = crud.reminder.update(db=db, db_obj=reminder, obj_in=reminder_in)
    return reminder


@router.delete("/{id}", response_model=schemas.Reminder)
def delete_reminder(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a reminder.
    """
    reminder = crud.reminder.get(db=db, id=id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    reminder = crud.reminder.remove(db=db, id=id)
    return reminder


@router.post("/{id}/complete", response_model=schemas.Reminder)
def complete_reminder(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a reminder as completed.
    """
    reminder = crud.reminder.get(db=db, id=id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    reminder = crud.reminder.mark_completed(db=db, reminder_id=id, owner_id=current_user.id)
    return reminder 