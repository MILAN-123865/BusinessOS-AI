from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.user import UserResponse
from app.schemas.project import ProjectResponse

class SubtaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    is_completed: bool = False

class SubtaskCreate(SubtaskBase):
    pass

class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    is_completed: Optional[bool] = None

class SubtaskResponse(SubtaskBase):
    id: UUID
    task_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class CommentBase(BaseModel):
    content: str = Field(..., max_length=1000)

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: UUID
    task_id: UUID
    user_id: UUID
    user: UserResponse
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class TaskBase(BaseModel):
    organization_id: UUID
    project_id: UUID
    task_code: Optional[str] = Field(None, max_length=100)
    title: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    assignee_id: Optional[UUID] = None
    status: str = "Todo"
    priority: str = "Medium"
    estimated_hours: float = 0.0
    actual_hours: float = 0.0
    progress: int = 0
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    project_id: Optional[UUID] = None
    task_code: Optional[str] = Field(None, max_length=100)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    assignee_id: Optional[UUID] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    progress: Optional[int] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    project: Optional[ProjectResponse] = None
    assignee: Optional[UserResponse] = None
    comments: List[CommentResponse] = []
    subtasks: List[SubtaskResponse] = []

    model_config = {
        "from_attributes": True
    }

class TaskEnvelope(BaseModel):
    success: bool
    message: str
    data: TaskResponse
    errors: Optional[dict] = None

class TaskListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[TaskResponse]
    errors: Optional[dict] = None

class CommentEnvelope(BaseModel):
    success: bool
    message: str
    data: CommentResponse
    errors: Optional[dict] = None

class CommentListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[CommentResponse]
    errors: Optional[dict] = None

class SubtaskEnvelope(BaseModel):
    success: bool
    message: str
    data: SubtaskResponse
    errors: Optional[dict] = None

class SubtaskListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[SubtaskResponse]
    errors: Optional[dict] = None
