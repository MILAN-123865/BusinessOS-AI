from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.user import UserResponse
from app.schemas.project import ProjectResponse
from app.schemas.task import TaskResponse

class MeetingBase(BaseModel):
    organization_id: UUID
    title: str = Field(..., max_length=255)
    agenda: Optional[str] = Field(None, max_length=1000)
    description: Optional[str] = Field(None, max_length=1000)
    meeting_type: str = "Online"
    host_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    meeting_link: Optional[str] = Field(None, max_length=500)
    room: Optional[str] = Field(None, max_length=100)
    start_time: datetime
    end_time: datetime
    status: str = "Scheduled"
    notes: Optional[str] = Field(None, max_length=1000)

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    agenda: Optional[str] = Field(None, max_length=1000)
    description: Optional[str] = Field(None, max_length=1000)
    meeting_type: Optional[str] = None
    host_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    meeting_link: Optional[str] = Field(None, max_length=500)
    room: Optional[str] = Field(None, max_length=100)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1000)

class MeetingResponse(MeetingBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    host: Optional[UserResponse] = None
    project: Optional[ProjectResponse] = None

    model_config = {
        "from_attributes": True
    }

class MeetingEnvelope(BaseModel):
    success: bool
    message: str
    data: MeetingResponse
    errors: Optional[dict] = None

class MeetingListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[MeetingResponse]
    errors: Optional[dict] = None


class CalendarEventBase(BaseModel):
    organization_id: UUID
    title: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    event_type: str = "Meeting"
    project_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    meeting_id: Optional[UUID] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    color: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=255)

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    event_type: Optional[str] = None
    project_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    meeting_id: Optional[UUID] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    color: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=255)

class CalendarEventResponse(CalendarEventBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    project: Optional[ProjectResponse] = None
    task: Optional[TaskResponse] = None
    meeting: Optional[MeetingResponse] = None

    model_config = {
        "from_attributes": True
    }

class CalendarEventEnvelope(BaseModel):
    success: bool
    message: str
    data: CalendarEventResponse
    errors: Optional[dict] = None

class CalendarEventListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[CalendarEventResponse]
    errors: Optional[dict] = None
