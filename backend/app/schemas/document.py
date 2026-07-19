from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List

class DocumentBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    department_id: Optional[UUID] = None
    tags: List[str] = []
    visibility: str = "organization"

class DocumentCreate(DocumentBase):
    organization_id: Optional[UUID] = None
    project_id: Optional[UUID] = None

class DocumentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    department_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    visibility: Optional[str] = None

class DocumentVersionResponse(BaseModel):
    id: UUID
    document_id: UUID
    version: str
    size: int
    storage_path: str
    download_url: str
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: UUID
    name: str
    original_name: str
    extension: str
    mime_type: str
    size: int
    version: str
    owner_id: UUID
    uploaded_by_id: UUID
    organization_id: UUID
    project_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    tags: List[str] = []
    description: Optional[str] = None
    visibility: str = "organization"
    storage_path: str
    download_url: str
    preview_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    downloads: int = 0

    class Config:
        from_attributes = True

class DocumentEnvelope(BaseModel):
    success: bool
    message: str
    data: DocumentResponse
    errors: Optional[dict] = None

class DocumentListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[DocumentResponse]
    errors: Optional[dict] = None
