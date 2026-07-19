from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.calendar import Meeting, CalendarEvent
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.calendar import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse,
    MeetingEnvelope,
    MeetingListEnvelope,
)

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.get("", response_model=MeetingListEnvelope)
async def list_meetings(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Meeting)
        .where(Meeting.organization_id == current_user.organization_id)
        .options(
            selectinload(Meeting.host),
            selectinload(Meeting.project)
        )
    )
    meetings = result.scalars().all()
    return {
        "success": True,
        "message": "Meetings retrieved successfully.",
        "data": [MeetingResponse.model_validate(m) for m in meetings],
        "errors": None
    }

@router.get("/{meeting_id}", response_model=MeetingEnvelope)
async def get_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(
            selectinload(Meeting.host),
            selectinload(Meeting.project)
        )
    )
    meeting = result.scalar()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    return {
        "success": True,
        "message": "Meeting retrieved successfully.",
        "data": MeetingResponse.model_validate(meeting),
        "errors": None
    }

@router.post("", response_model=MeetingEnvelope, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    payload: MeetingCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    meeting = Meeting(
        organization_id=payload.organization_id,
        title=payload.title,
        agenda=payload.agenda,
        description=payload.description,
        meeting_type=payload.meeting_type,
        host_id=payload.host_id,
        project_id=payload.project_id,
        meeting_link=payload.meeting_link,
        room=payload.room,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    
    # Auto-populate Calendar Event!
    calendar_event = CalendarEvent(
        organization_id=meeting.organization_id,
        title=meeting.title,
        description=meeting.description,
        event_type="Meeting",
        project_id=meeting.project_id,
        meeting_id=meeting.id,
        start_time=meeting.start_time,
        end_time=meeting.end_time,
        all_day=False,
        color="blue",
        location=meeting.meeting_link or meeting.room or "Online",
    )
    db.add(calendar_event)
    await db.commit()

    result = await db.execute(
        select(Meeting)
        .where(Meeting.id == meeting.id)
        .options(
            selectinload(Meeting.host),
            selectinload(Meeting.project)
        )
    )
    meeting = result.scalar()
    
    return {
        "success": True,
        "message": "Meeting created successfully.",
        "data": MeetingResponse.model_validate(meeting),
        "errors": None
    }

@router.patch("/{meeting_id}", response_model=MeetingEnvelope)
async def update_meeting(
    meeting_id: UUID,
    payload: MeetingUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(
            selectinload(Meeting.host),
            selectinload(Meeting.project)
        )
    )
    meeting = result.scalar()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(meeting, field, value)
        
    await db.commit()
    await db.refresh(meeting)

    cal_result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.meeting_id == meeting.id)
    )
    cal_event = cal_result.scalar()
    if cal_event:
        cal_event.title = meeting.title
        cal_event.description = meeting.description
        cal_event.start_time = meeting.start_time
        cal_event.end_time = meeting.end_time
        cal_event.project_id = meeting.project_id
        cal_event.location = meeting.meeting_link or meeting.room or "Online"
        await db.commit()
    
    return {
        "success": True,
        "message": "Meeting updated successfully.",
        "data": MeetingResponse.model_validate(meeting),
        "errors": None
    }

@router.delete("/{meeting_id}", response_model=MeetingEnvelope)
async def delete_meeting(
    meeting_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(
            selectinload(Meeting.host),
            selectinload(Meeting.project)
        )
    )
    meeting = result.scalar()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
        
    response_data = MeetingResponse.model_validate(meeting)
    await db.delete(meeting)
    await db.commit()
    
    return {
        "success": True,
        "message": "Meeting deleted successfully.",
        "data": response_data,
        "errors": None
    }
