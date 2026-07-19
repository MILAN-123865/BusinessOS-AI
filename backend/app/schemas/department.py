from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.user import UserResponse

class DepartmentBase(BaseModel):
    organization_id: UUID
    name: str = Field(..., max_length=255)
    code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    manager_id: Optional[UUID] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    manager_id: Optional[UUID] = None
    is_active: Optional[bool] = None

class DepartmentResponse(DepartmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    manager: Optional[UserResponse] = None

    model_config = {
        "from_attributes": True
    }

class DepartmentEnvelope(BaseModel):
    success: bool
    message: str
    data: DepartmentResponse
    errors: Optional[dict] = None

class DepartmentListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[DepartmentResponse]
    errors: Optional[dict] = None
