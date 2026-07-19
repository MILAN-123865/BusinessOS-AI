from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.department import Department
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentEnvelope,
    DepartmentListEnvelope,
    DepartmentResponse
)
from app.schemas.user import UserResponse, UserListEnvelope

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=DepartmentListEnvelope)
async def list_departments(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Department)
        .options(selectinload(Department.manager))
    )
    deps = result.scalars().all()
    return {
        "success": True,
        "message": "Departments retrieved successfully.",
        "data": [DepartmentResponse.model_validate(d) for d in deps],
        "errors": None
    }

@router.get("/{dep_id}", response_model=DepartmentEnvelope)
async def get_department(
    dep_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Department)
        .where(Department.id == dep_id)
        .options(selectinload(Department.manager))
    )
    dep = result.scalar()
    if not dep:
        raise HTTPException(status_code=404, detail="Department not found.")
    return {
        "success": True,
        "message": "Department retrieved successfully.",
        "data": DepartmentResponse.model_validate(dep),
        "errors": None
    }

@router.post("", response_model=DepartmentEnvelope, status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: DepartmentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    dep = Department(**payload.model_dump())
    db.add(dep)
    await db.commit()
    
    # Reload with relation
    result = await db.execute(
        select(Department)
        .where(Department.id == dep.id)
        .options(selectinload(Department.manager))
    )
    loaded_dep = result.scalar()
    
    return {
        "success": True,
        "message": "Department created successfully.",
        "data": DepartmentResponse.model_validate(loaded_dep),
        "errors": None
    }

@router.patch("/{dep_id}", response_model=DepartmentEnvelope)
async def update_department(
    dep_id: UUID,
    payload: DepartmentUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Department)
        .where(Department.id == dep_id)
        .options(selectinload(Department.manager))
    )
    dep = result.scalar()
    if not dep:
        raise HTTPException(status_code=404, detail="Department not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dep, key, value)
    
    await db.commit()
    await db.refresh(dep)
    return {
        "success": True,
        "message": "Department updated successfully.",
        "data": DepartmentResponse.model_validate(dep),
        "errors": None
    }

@router.delete("/{dep_id}", response_model=DepartmentEnvelope)
async def delete_department(
    dep_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Department)
        .where(Department.id == dep_id)
        .options(selectinload(Department.users))
    )
    dep = result.scalar()
    if not dep:
        raise HTTPException(status_code=404, detail="Department not found.")
    
    if len(dep.users) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete department containing active employees. Reassign employees first."
        )
        
    response_data = DepartmentResponse.model_validate(dep)
    await db.delete(dep)
    await db.commit()
    return {
        "success": True,
        "message": "Department deleted successfully.",
        "data": response_data,
        "errors": None
    }

@router.get("/{dep_id}/employees", response_model=UserListEnvelope)
async def get_department_employees(
    dep_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(User)
        .where(User.department_id == dep_id)
    )
    users = result.scalars().all()
    return {
        "success": True,
        "message": "Department employees fetched successfully.",
        "data": [UserResponse.model_validate(u) for u in users],
        "errors": None
    }

@router.get("/organization/{org_id}", response_model=DepartmentListEnvelope)
async def get_organization_departments(
    org_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Department)
        .where(Department.organization_id == org_id)
        .options(selectinload(Department.manager))
    )
    deps = result.scalars().all()
    return {
        "success": True,
        "message": "Organization departments fetched successfully.",
        "data": [DepartmentResponse.model_validate(d) for d in deps],
        "errors": None
    }
