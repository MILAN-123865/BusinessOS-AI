from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import Optional
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.calendar import CalendarEvent
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.calendar import (
    CalendarEventCreate,
    CalendarEventUpdate,
    CalendarEventResponse,
    CalendarEventEnvelope,
    CalendarEventListEnvelope,
)

router = APIRouter(prefix="/calendar/events", tags=["Calendar Events"])

@router.get("", response_model=CalendarEventListEnvelope)
async def list_events(
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    event_type: Optional[str] = Query(None),
    project_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    query = select(CalendarEvent).where(CalendarEvent.organization_id == current_user.organization_id)
    
    if start:
        query = query.where(CalendarEvent.end_time >= start)
    if end:
        query = query.where(CalendarEvent.start_time <= end)
    if event_type:
        query = query.where(CalendarEvent.event_type.ilike(f"%{event_type}%"))
    if project_id:
        query = query.where(CalendarEvent.project_id == project_id)
    if search:
        query = query.where(
            or_(
                CalendarEvent.title.ilike(f"%{search}%"),
                CalendarEvent.description.ilike(f"%{search}%")
            )
        )
        
    query = query.order_by(CalendarEvent.start_time.asc())
    result = await db.execute(query)
    events = result.scalars().all()
    
    return {
        "success": True,
        "message": "Calendar events retrieved successfully.",
        "data": [CalendarEventResponse.model_validate(e) for e in events],
        "errors": None
    }

@router.get("/{event_id}", response_model=CalendarEventEnvelope)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {
        "success": True,
        "message": "Event retrieved successfully.",
        "data": CalendarEventResponse.model_validate(event),
        "errors": None
    }

@router.post("", response_model=CalendarEventEnvelope, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: CalendarEventCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    event = CalendarEvent(
        organization_id=current_user.organization_id or payload.organization_id,
        title=payload.title,
        description=payload.description,
        event_type=payload.event_type,
        project_id=payload.project_id,
        task_id=payload.task_id,
        meeting_id=payload.meeting_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        all_day=payload.all_day,
        color=payload.color,
        location=payload.location,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    return {
        "success": True,
        "message": "Event created successfully.",
        "data": CalendarEventResponse.model_validate(event),
        "errors": None
    }

@router.patch("/{event_id}", response_model=CalendarEventEnvelope)
async def update_event(
    event_id: UUID,
    payload: CalendarEventUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
        
    await db.commit()
    await db.refresh(event)
    
    return {
        "success": True,
        "message": "Event updated successfully.",
        "data": CalendarEventResponse.model_validate(event),
        "errors": None
    }

@router.delete("/{event_id}", response_model=CalendarEventEnvelope)
async def delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
        
    response_data = CalendarEventResponse.model_validate(event)
    await db.delete(event)
    await db.commit()
    
    return {
        "success": True,
        "message": "Event deleted successfully.",
        "data": response_data,
        "errors": None
    }
