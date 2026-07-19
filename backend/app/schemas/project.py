from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.user import UserResponse
from app.schemas.client import ClientResponse

class MilestoneBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    due_date: Optional[date] = None
    status: str = "Pending"

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    due_date: Optional[date] = None
    status: Optional[str] = None

class MilestoneResponse(MilestoneBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class ProjectMemberBase(BaseModel):
    user_id: UUID
    role: Optional[str] = Field(None, max_length=100)

class ProjectMemberCreate(ProjectMemberBase):
    pass

class ProjectMemberResponse(ProjectMemberBase):
    id: UUID
    project_id: UUID
    user: UserResponse
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class ProjectBase(BaseModel):
    organization_id: UUID
    client_id: UUID
    name: str = Field(..., max_length=255)
    project_code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    status: str = "Planning"
    priority: str = "Medium"
    budget: float = 0.0
    currency: str = "USD"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    estimated_hours: float = 0.0
    actual_hours: float = 0.0
    progress: int = 0
    health: str = "Good"
    project_manager_id: Optional[UUID] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    project_code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = None
    priority: Optional[str] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    progress: Optional[int] = None
    health: Optional[str] = None
    project_manager_id: Optional[UUID] = None
    client_id: Optional[UUID] = None

class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientResponse] = None
    project_manager: Optional[UserResponse] = None
    members: List[ProjectMemberResponse] = []
    milestones: List[MilestoneResponse] = []

    model_config = {
        "from_attributes": True
    }

class ProjectEnvelope(BaseModel):
    success: bool
    message: str
    data: ProjectResponse
    errors: Optional[dict] = None

class ProjectListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[ProjectResponse]
    errors: Optional[dict] = None

class ProjectMemberEnvelope(BaseModel):
    success: bool
    message: str
    data: ProjectMemberResponse
    errors: Optional[dict] = None

class ProjectMemberListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[ProjectMemberResponse]
    errors: Optional[dict] = None

class MilestoneEnvelope(BaseModel):
    success: bool
    message: str
    data: MilestoneResponse
    errors: Optional[dict] = None

class MilestoneListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[MilestoneResponse]
    errors: Optional[dict] = None
