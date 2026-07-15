from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ==============================================================================
# BASE SCHEMA (Shared properties)
# ==============================================================================
class UserBase(BaseModel):
    email: EmailStr = Field(
        ..., 
        description="Primary unique email address used for login and notifications."
    )
    first_name: str = Field(
        ..., 
        min_length=1, 
        max_length=50, 
        description="User's legal first name."
    )
    last_name: str = Field(
        ..., 
        min_length=1, 
        max_length=50, 
        description="User's legal last name or surname."
    )
    phone_number: Optional[str] = Field(
        None, 
        max_length=20, 
        description="Optional contact number formatted in E.164."
    )
    is_active: bool = Field(
        True, 
        description="Determines whether the user has access to sign in."
    )
    organization_id: Optional[UUID] = Field(
        None, 
        description="Reference to the parent enterprise tenant organization."
    )
    department_id: Optional[UUID] = Field(
        None, 
        description="Reference to the specific department the user belongs to."
    )


# ==============================================================================
# REQUEST SCHEMAS (Write operations)
# ==============================================================================
class UserCreate(UserBase):
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=128, 
        description="Strong raw password value. Verified for policy complexity before storage."
    )

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Enforces enterprise password requirements before hashing."""
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one numerical digit.")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(char in "!@#$%^&*()_+-=[]{}|;':\",./<>?" for char in v):
            raise ValueError("Password must contain at least one special character.")
        return v


class UserUpdate(BaseModel):
    """
    Schema for partial updates (PATCH requests).
    Every field is optional to support clean delta-updates.
    """
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    organization_id: Optional[UUID] = None
    department_id: Optional[UUID] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one numerical digit.")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(char in "!@#$%^&*()_+-=[]{}|;':\",./<>?" for char in v):
            raise ValueError("Password must contain at least one special character.")
        return v


# ==============================================================================
# RESPONSE SCHEMAS (Read operations)
# ==============================================================================
class UserResponse(UserBase):
    """
    Schema returning comprehensive User record details.
    Leverages Pydantic's automatic ORM-model matching config.
    """
    id: UUID
    is_verified: bool = Field(
        ..., 
        description="Flag representing if the user has confirmed their registered email address."
    )
    created_at: datetime
    updated_at: datetime
    
    # Enable automatic compatibility parsing from SQLAlchemy model instances
    model_config = ConfigDict(from_attributes=True)


class UserWithRolesResponse(UserResponse):
    """
    Detailed response payload carrying role membership lists.
    Used for auth payloads and privilege authorization validation.
    """
    roles: List[str] = Field(
        default_factory=list,
        description="List of associated roles assigned to the user."
    )
    permissions: List[str] = Field(
        default_factory=list,
        description="Merged deduplicated flat string list of codenames representing structural access."
    )

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# SYSTEM RESPONSE CONTAINER (Matches Global Response JSON Standard)
# ==============================================================================
class UserEnvelope(BaseModel):
    success: bool = True
    message: str = "User operation executed successfully."
    data: UserResponse
    errors: Optional[dict] = None


class UserListEnvelope(BaseModel):
    success: bool = True
    message: str = "Users retrieved successfully."
    data: List[UserResponse]
    errors: Optional[dict] = None