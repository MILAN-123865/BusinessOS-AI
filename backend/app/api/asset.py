from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.models.asset import Asset, AssetCategory
from app.models.user import User
from app.dependencies.auth import get_current_active_user

router = APIRouter(tags=["Assets"])


@router.get("/asset-categories")
async def list_asset_categories(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(AssetCategory))
    categories = result.scalars().all()
    return {"success": True, "data": categories}


@router.post("/asset-categories", status_code=status.HTTP_201_CREATED)
async def create_asset_category(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    cat = AssetCategory(
        name=payload.get("name", "New Category"),
        description=payload.get("description", "")
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"success": True, "data": cat}


@router.get("/assets")
async def list_assets(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Asset).options(
        selectinload(Asset.category),
        selectinload(Asset.assigned_employee),
        selectinload(Asset.assigned_department),
        selectinload(Asset.assigned_project)
    )
    if current_user.organization_id:
        query = query.where(Asset.organization_id == current_user.organization_id)
    result = await db.execute(query)
    assets = result.scalars().all()
    return {"success": True, "data": assets}


@router.post("/assets", status_code=status.HTTP_201_CREATED)
async def create_asset(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    asset = Asset(
        organization_id=current_user.organization_id,
        asset_code=payload.get("asset_code", f"AST-{int(datetime.now().timestamp())}"),
        name=payload.get("name", "Hardware Asset"),
        description=payload.get("description"),
        category_id=payload.get("category_id"),
        brand=payload.get("brand"),
        model=payload.get("model"),
        serial_number=payload.get("serial_number"),
        purchase_price=payload.get("purchase_price", 0.0),
        vendor=payload.get("vendor"),
        status=payload.get("status", "Available"),
        condition=payload.get("condition", "Good"),
        location=payload.get("location"),
        notes=payload.get("notes")
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return {"success": True, "data": asset}


@router.get("/assets/{asset_id}")
async def get_asset(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Asset)
        .options(
            selectinload(Asset.category),
            selectinload(Asset.assigned_employee),
            selectinload(Asset.assigned_department),
            selectinload(Asset.assigned_project)
        )
        .where(Asset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    return {"success": True, "data": asset}


@router.patch("/assets/{asset_id}")
async def update_asset(
    asset_id: UUID,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    for key, val in payload.items():
        if hasattr(asset, key) and val is not None:
            setattr(asset, key, val)
    await db.commit()
    await db.refresh(asset)
    return {"success": True, "data": asset}


@router.delete("/assets/{asset_id}")
async def delete_asset(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    await db.delete(asset)
    await db.commit()
    return {"success": True, "message": "Asset deleted successfully."}


@router.get("/assets/{asset_id}/history")
async def get_asset_history(asset_id: UUID):
    return {"success": True, "data": []}


@router.get("/assets/{asset_id}/maintenance")
async def get_asset_maintenance(asset_id: UUID):
    return {"success": True, "data": []}


@router.post("/assets/{asset_id}/maintenance")
async def create_asset_maintenance(asset_id: UUID, payload: Dict[str, Any]):
    return {"success": True, "data": payload}
