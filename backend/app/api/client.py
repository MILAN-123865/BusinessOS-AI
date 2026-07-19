from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.dependencies.database import get_db_session
from app.models.client import Client, ClientContact
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientEnvelope,
    ClientListEnvelope,
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    ContactEnvelope,
    ContactListEnvelope,
)

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("", response_model=ClientListEnvelope)
async def list_clients(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Client)
        .where(Client.organization_id == current_user.organization_id)
        .options(selectinload(Client.contacts))
    )
    clients = result.scalars().all()
    return {
        "success": True,
        "message": "Clients retrieved successfully.",
        "data": [ClientResponse.model_validate(c) for c in clients],
        "errors": None
    }

@router.get("/{client_id}", response_model=ClientEnvelope)
async def get_client(
    client_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Client)
        .where(Client.id == client_id)
        .options(selectinload(Client.contacts))
    )
    client = result.scalar()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")
    return {
        "success": True,
        "message": "Client retrieved successfully.",
        "data": ClientResponse.model_validate(client),
        "errors": None
    }

@router.post("", response_model=ClientEnvelope, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    client = Client(
        organization_id=payload.organization_id,
        company_name=payload.company_name,
        client_code=payload.client_code,
        industry=payload.industry,
        website=payload.website,
        email=payload.email,
        phone=payload.phone,
        status=payload.status,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        postal_code=payload.postal_code,
        tax_number=payload.tax_number,
        registration_number=payload.registration_number,
        notes=payload.notes,
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    
    result = await db.execute(
        select(Client).where(Client.id == client.id).options(selectinload(Client.contacts))
    )
    client = result.scalar()
    
    return {
        "success": True,
        "message": "Client created successfully.",
        "data": ClientResponse.model_validate(client),
        "errors": None
    }

@router.patch("/{client_id}", response_model=ClientEnvelope)
async def update_client(
    client_id: UUID,
    payload: ClientUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Client).where(Client.id == client_id).options(selectinload(Client.contacts))
    )
    client = result.scalar()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
        
    await db.commit()
    await db.refresh(client)
    
    return {
        "success": True,
        "message": "Client updated successfully.",
        "data": ClientResponse.model_validate(client),
        "errors": None
    }

@router.delete("/{client_id}", response_model=ClientEnvelope)
async def delete_client(
    client_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Client).where(Client.id == client_id).options(selectinload(Client.contacts))
    )
    client = result.scalar()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")
        
    response_data = ClientResponse.model_validate(client)
    await db.delete(client)
    await db.commit()
    
    return {
        "success": True,
        "message": "Client deleted successfully.",
        "data": response_data,
        "errors": None
    }

# Contacts management
@router.get("/{client_id}/contacts", response_model=ContactListEnvelope)
async def list_client_contacts(
    client_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(ClientContact).where(ClientContact.client_id == client_id))
    contacts = result.scalars().all()
    return {
        "success": True,
        "message": "Client contacts retrieved successfully.",
        "data": [ContactResponse.model_validate(c) for c in contacts],
        "errors": None
    }

@router.post("/{client_id}/contacts", response_model=ContactEnvelope, status_code=status.HTTP_201_CREATED)
async def create_client_contact(
    client_id: UUID,
    payload: ContactCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Client).where(Client.id == client_id))
    if not result.scalar():
        raise HTTPException(status_code=404, detail="Client not found.")
        
    if payload.is_primary:
        await db.execute(
            text("UPDATE client_contacts SET is_primary = false WHERE client_id = :client_id")
            .bindparams(client_id=client_id)
        )
        
    contact = ClientContact(
        client_id=client_id,
        name=payload.name,
        designation=payload.designation,
        email=payload.email,
        phone=payload.phone,
        is_primary=payload.is_primary,
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    
    return {
        "success": True,
        "message": "Client contact created successfully.",
        "data": ContactResponse.model_validate(contact),
        "errors": None
    }

@router.patch("/{client_id}/contacts/{contact_id}", response_model=ContactEnvelope)
async def update_client_contact(
    client_id: UUID,
    contact_id: UUID,
    payload: ContactUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ClientContact)
        .where(ClientContact.id == contact_id, ClientContact.client_id == client_id)
    )
    contact = result.scalar()
    if not contact:
        raise HTTPException(status_code=404, detail="Client contact not found.")
        
    if payload.is_primary:
        await db.execute(
            text("UPDATE client_contacts SET is_primary = false WHERE client_id = :client_id")
            .bindparams(client_id=client_id)
        )
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
        
    await db.commit()
    await db.refresh(contact)
    
    return {
        "success": True,
        "message": "Client contact updated successfully.",
        "data": ContactResponse.model_validate(contact),
        "errors": None
    }

@router.delete("/{client_id}/contacts/{contact_id}", response_model=ContactEnvelope)
async def delete_client_contact(
    client_id: UUID,
    contact_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(ClientContact)
        .where(ClientContact.id == contact_id, ClientContact.client_id == client_id)
    )
    contact = result.scalar()
    if not contact:
        raise HTTPException(status_code=404, detail="Client contact not found.")
        
    response_data = ContactResponse.model_validate(contact)
    await db.delete(contact)
    await db.commit()
    
    return {
        "success": True,
        "message": "Client contact deleted successfully.",
        "data": response_data,
        "errors": None
    }
