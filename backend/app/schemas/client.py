from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List

class ContactBase(BaseModel):
    name: str = Field(..., max_length=255)
    designation: Optional[str] = Field(None, max_length=100)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    is_primary: bool = False

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    designation: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    is_primary: Optional[bool] = None

class ContactResponse(ContactBase):
    id: UUID
    client_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class ClientBase(BaseModel):
    organization_id: UUID
    company_name: str = Field(..., max_length=255)
    client_code: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    status: str = "Active"
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    tax_number: Optional[str] = Field(None, max_length=100)
    registration_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=1000)

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    company_name: Optional[str] = Field(None, max_length=255)
    client_code: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = None
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    tax_number: Optional[str] = Field(None, max_length=100)
    registration_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=1000)

class ClientResponse(ClientBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    contacts: List[ContactResponse] = []

    model_config = {
        "from_attributes": True
    }

class ClientEnvelope(BaseModel):
    success: bool
    message: str
    data: ClientResponse
    errors: Optional[dict] = None

class ClientListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[ClientResponse]
    errors: Optional[dict] = None

class ContactEnvelope(BaseModel):
    success: bool
    message: str
    data: ContactResponse
    errors: Optional[dict] = None

class ContactListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[ContactResponse]
    errors: Optional[dict] = None
