from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
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
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(CalendarEvent)
        .where(CalendarEvent.organization_id == current_user.organization_id)
        .options(
            selectinload(CalendarEvent.project),
            selectinload(CalendarEvent.task),
            selectinload(CalendarEvent.meeting).selectinload(CalendarEvent.meeting.host)
        )
    )
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
        select(CalendarEvent)
        .where(CalendarEvent.id == event_id)
        .options(
            selectinload(CalendarEvent.project),
            selectinload(CalendarEvent.task),
            selectinload(CalendarEvent.meeting).selectinload(CalendarEvent.meeting.host)
        )
    )
    event = result.scalar()
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
        organization_id=payload.organization_id,
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
    
    result = await db.execute(
        select(CalendarEvent)
        .where(CalendarEvent.id == event.id)
        .options(
            selectinload(CalendarEvent.project),
            selectinload(CalendarEvent.task),
            selectinload(CalendarEvent.meeting).selectinload(CalendarEvent.meeting.host)
        )
    )
    event = result.scalar()
    
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
        select(CalendarEvent)
        .where(CalendarEvent.id == event_id)
        .options(
            selectinload(CalendarEvent.project),
            selectinload(CalendarEvent.task),
            selectinload(CalendarEvent.meeting).selectinload(CalendarEvent.meeting.host)
        )
    )
    event = result.scalar()
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
        select(CalendarEvent)
        .where(CalendarEvent.id == event_id)
        .options(
            selectinload(CalendarEvent.project),
            selectinload(CalendarEvent.task),
            selectinload(CalendarEvent.meeting).selectinload(CalendarEvent.meeting.host)
        )
    )
    event = result.scalar()
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
