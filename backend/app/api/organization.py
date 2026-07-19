from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.organization import Organization
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationEnvelope,
    OrganizationListEnvelope,
    OrganizationResponse
)

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("", response_model=OrganizationListEnvelope)
async def list_organizations(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Organization))
    orgs = result.scalars().all()
    return {
        "success": True,
        "message": "Organizations retrieved successfully.",
        "data": [OrganizationResponse.model_validate(o) for o in orgs],
        "errors": None
    }

@router.get("/current", response_model=OrganizationEnvelope)
async def get_current_organization(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The current user is not associated with any organization."
        )
    result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    org = result.scalar()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current user's organization not found."
        )
    return {
        "success": True,
        "message": "Current organization retrieved successfully.",
        "data": OrganizationResponse.model_validate(org),
        "errors": None
    }

@router.get("/{org_id}", response_model=OrganizationEnvelope)
async def get_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found."
        )
    return {
        "success": True,
        "message": "Organization retrieved successfully.",
        "data": OrganizationResponse.model_validate(org),
        "errors": None
    }

@router.post("", response_model=OrganizationEnvelope, status_code=status.HTTP_201_CREATED)
async def create_organization(
    payload: OrganizationCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    org = Organization(**payload.model_dump())
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return {
        "success": True,
        "message": "Organization created successfully.",
        "data": OrganizationResponse.model_validate(org),
        "errors": None
    }

@router.patch("/current", response_model=OrganizationEnvelope)
async def update_current_organization(
    payload: OrganizationUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The current user is not associated with any organization."
        )
    result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    org = result.scalar()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current user's organization not found."
        )
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)
    await db.commit()
    await db.refresh(org)
    return {
        "success": True,
        "message": "Current organization updated successfully.",
        "data": OrganizationResponse.model_validate(org),
        "errors": None
    }

@router.patch("/{org_id}", response_model=OrganizationEnvelope)
async def update_organization(
    org_id: UUID,
    payload: OrganizationUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found."
        )
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)
    await db.commit()
    await db.refresh(org)
    return {
        "success": True,
        "message": "Organization updated successfully.",
        "data": OrganizationResponse.model_validate(org),
        "errors": None
    }

@router.delete("/{org_id}", response_model=OrganizationEnvelope)
async def delete_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found."
        )
    response_data = OrganizationResponse.model_validate(org)
    await db.delete(org)
    await db.commit()
    return {
        "success": True,
        "message": "Organization deleted successfully.",
        "data": response_data,
        "errors": None
    }
