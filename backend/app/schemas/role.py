from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.permission import PermissionResponse

class RoleBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_system: bool = False

class RoleCreate(RoleBase):
    permission_ids: Optional[List[UUID]] = None

class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    permission_ids: Optional[List[UUID]] = None

class RoleResponse(RoleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    permissions: List[PermissionResponse] = []
    user_count: int = 0

    model_config = {
        "from_attributes": True
    }

class RoleEnvelope(BaseModel):
    success: bool
    message: str
    data: RoleResponse
    errors: Optional[dict] = None

class RoleListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[RoleResponse]
    errors: Optional[dict] = None
