from uuid import UUID
from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime

class PermissionResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    code: str = ""
    module: str = ""
    action: str = ""
    category: str = ""
    is_system: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def compute_fields(cls, data):
        # Handle ORM objects
        if hasattr(data, "name"):
            name = data.name
        else:
            name = data.get("name", "")
            
        parts = name.split(".")
        module_val = parts[0] if len(parts) > 1 else "General"
        action_val = parts[1] if len(parts) > 1 else name
        
        # Build dictionary to validate
        res = {
            "id": getattr(data, "id", None) or data.get("id"),
            "name": name,
            "description": getattr(data, "description", None) or data.get("description"),
            "code": name,
            "module": module_val,
            "action": action_val,
            "category": module_val,
            "is_system": True,
            "created_at": getattr(data, "created_at", None),
            "updated_at": getattr(data, "updated_at", None),
        }
        return res

    model_config = {
        "from_attributes": True
    }

class PermissionCreate(BaseModel):
    name: str = Field(..., max_length=150)
    description: Optional[str] = Field(None, max_length=500)

class PermissionUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=500)

class PermissionEnvelope(BaseModel):
    success: bool
    message: str
    data: PermissionResponse
    errors: Optional[dict] = None

class PermissionListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[PermissionResponse]
    errors: Optional[dict] = None
