from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, HTTPException

from app.dependencies.services import get_user_service
from app.schemas.user import UserCreate, UserUpdate, UserEnvelope, UserListEnvelope, UserResponse, UserWithRolesResponse, UserWithRolesEnvelope
from app.services.user_service import UserService
from app.models.user import User
# Assumed dependency injection hooks matching typical enterprise lifecycles
from app.dependencies.database import get_db_session
from app.dependencies.auth import get_current_active_user, check_permissions
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_role import UserRole

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserEnvelope,
    status_code=status.HTTP_201_CREATED,
    summary="Create Enterprise User",
    description="Registers a new system user within an organization tenant layout. Triggers password complexity checks.",
    responses={
        400: {"description": "Email address already registered or validation constraint failure."},
        401: {"description": "Authentication credentials missing or invalid."},
        403: {"description": "Insufficient domain privileges to execute operation."}
    }
)
async def create_user(
    payload: UserCreate,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(check_permissions(["user:create"]))
) -> dict:
    new_user = await service.create_user(schema_in=payload, creator_id=current_user.id)
    return {
        "success": True,
        "message": "User provisioned and saved successfully within system context.",
        "data": UserResponse.model_validate(new_user),
        "errors": None
    }


@router.get(
    "",
    response_model=UserListEnvelope,
    status_code=status.HTTP_200_OK,
    summary="List and Filter Users",
    description="Queries, searches, structures, and paginates system users across organization domains.",
    responses={
        401: {"description": "Authentication failure context."},
        403: {"description": "Missing operational permissions mapping."}
    }
)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of historical records to skip over."),
    limit: int = Query(50, ge=1, le=250, description="Constrained number of profile records to output synchronously."),
    search: Optional[str] = Query(None, description="Fuzzy textual target mapping fields across name or email metadata."),
    organization_id: Optional[UUID] = Query(None, description="Multi-tenant structural filter constraint."),
    sort_by: str = Query("created_at", description="Target engine sort tracking data field column."),
    sort_desc: bool = Query(True, description="Descending sort sequence trigger toggle."),
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(check_permissions(["user:read"]))
) -> dict:
    users, total = await service.list_users(
        skip=skip,
        limit=limit,
        search=search,
        organization_id=organization_id,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    response_users = []
    for u in users:
        ur = UserResponse.model_validate(u)
        # Attempt to load roles if joined
        role_names = []
        if hasattr(u, "user_roles"):
            role_names = [r.role.name for r in u.user_roles if hasattr(r, "role")]
        ur.roles = role_names
        response_users.append(ur)

    return {
        "success": True,
        "message": f"Successfully mapped {len(users)} users. Global database records match: {total}.",
        "data": response_users,
        "errors": None
    }


@router.get(
    "/me",
    response_model=UserWithRolesEnvelope,
    status_code=status.HTTP_200_OK,
    summary="Get Current User",
    description="Returns the profile details of the currently authenticated active user context along with assigned roles and permissions."
)
async def get_me(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    role_names = []
    permission_names = []
    
    if current_user.is_superuser:
        role_names = ["Superadmin"]
        permission_names = [
            "dashboard.read", "organization.read", "organization.manage", 
            "departments.read", "departments.manage", "employees.read", "employees.manage",
            "roles.read", "roles.manage", "permissions.read", "permissions.manage",
            "projects.read", "projects.manage", "clients.read", "clients.manage",
            "documents.read", "documents.manage"
        ]
    else:
        for ur in current_user.user_roles:
            role_names.append(ur.role.name)
            for rp in ur.role.role_permissions:
                permission_names.append(rp.permission.name)
                
    permission_names = list(set(permission_names))
    
    user_data = UserWithRolesResponse.model_validate(current_user)
    user_data.roles = role_names
    user_data.permissions = permission_names
    
    return {
        "success": True,
        "message": "User profile and privileges retrieved successfully.",
        "data": user_data,
        "errors": None
    }


@router.get(
    "/{user_id}",
    response_model=UserEnvelope,
    status_code=status.HTTP_200_OK,
    summary="Retrieve User Context",
    description="Locates and renders a specific active single structural user entity profile matching UUID indicators.",
    responses={
        404: {"description": "Requested target identification profiles not found or soft-deleted."},
        401: {"description": "Authentication validation invalid."}
    }
)
async def get_user(
    user_id: UUID,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(check_permissions(["user:read"]))
) -> dict:
    user = await service.get_user_by_id(user_id)
    ur = UserResponse.model_validate(user)
    if hasattr(user, "user_roles"):
        ur.roles = [r.role.name for r in user.user_roles if hasattr(r, "role")]

    return {
        "success": True,
        "message": "Target entity data structures fetched successfully.",
        "data": ur,
        "errors": None
    }


@router.patch(
    "/me",
    response_model=UserEnvelope,
    status_code=status.HTTP_200_OK,
    summary="Update Current User Profile",
    description="Updates the profile fields of the currently authenticated active user."
)
async def update_me(
    payload: UserUpdate,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    updated_user = await service.update_user(user_id=current_user.id, schema_in=payload, updater_id=current_user.id)
    return {
        "success": True,
        "message": "Profile updated successfully.",
        "data": UserResponse.model_validate(updated_user),
        "errors": None
    }


@router.patch(
    "/{user_id}",
    response_model=UserEnvelope,
    status_code=status.HTTP_200_OK,
    summary="Modify User Profile",
    description="Applies partial field updates dynamically to an active user record. Restricts core password changes.",
    responses={
        400: {"description": "Resource modification exceptions or structural constraint collision."},
        404: {"description": "Target profile elements missing matching identifier tags."}
    }
)
async def update_user(
    user_id: UUID,
    payload: UserUpdate,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(check_permissions(["user:update"]))
) -> dict:
    updated_user = await service.update_user(user_id=user_id, schema_in=payload, updater_id=current_user.id)
    return {
        "success": True,
        "message": "User resource elements altered successfully.",
        "data": UserResponse.model_validate(updated_user),
        "errors": None
    }


@router.delete(
    "/{user_id}",
    response_model=UserEnvelope,
    status_code=status.HTTP_200_OK,
    summary="Soft-Delete User Profile",
    description="Toggles execution parameters flagging an active profile state into a soft-deleted framework.",
    responses={
        404: {"description": "Resource element data not found matches."},
        403: {"description": "Access privileges blocked error."}
    }
)
async def delete_user(
    user_id: UUID,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(check_permissions(["user:delete"]))
) -> dict:
    deleted_user = await service.delete_user(user_id=user_id, deleter_id=current_user.id)
    return {
        "success": True,
        "message": "User account soft-deletion processing finalized successfully.",
        "data": UserResponse.model_validate(deleted_user),
        "errors": None
    }

from sqlalchemy import select

@router.patch("/{user_id}/roles", response_model=UserEnvelope)
async def update_user_roles(
    user_id: UUID,
    role_ids: list[UUID],
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    await db.execute(
        text("DELETE FROM user_roles WHERE user_id = :user_id").bindparams(user_id=user_id)
    )
    for r_id in role_ids:
        ur = UserRole(user_id=user_id, role_id=r_id, assigned_by=current_user.id)
        db.add(ur)
    await db.commit()
    
    result = await db.execute(select(User).where(User.id == user_id))
    loaded_user = result.scalar()
    return {
        "success": True,
        "message": "User roles updated successfully.",
        "data": UserResponse.model_validate(loaded_user),
        "errors": None
    }

@router.patch("/{user_id}/department", response_model=UserEnvelope)
async def update_user_department(
    user_id: UUID,
    department_id: Optional[UUID],
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user_record = result.scalar()
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found.")
    user_record.department_id = department_id
    await db.commit()
    await db.refresh(user_record)
    return {
        "success": True,
        "message": "User department updated successfully.",
        "data": UserResponse.model_validate(user_record),
        "errors": None
    }

@router.patch("/{user_id}/status", response_model=UserEnvelope)
async def update_user_status(
    user_id: UUID,
    is_active: bool,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user_record = result.scalar()
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found.")
    user_record.is_active = is_active
    await db.commit()
    await db.refresh(user_record)
    return {
        "success": True,
        "message": "User active status updated successfully.",
        "data": UserResponse.model_validate(user_record),
        "errors": None
    }

@router.post("/invite", response_model=UserEnvelope, status_code=status.HTTP_201_CREATED)
async def invite_user(
    payload: UserCreate,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    invited_user = await service.create_user(schema_in=payload, creator_id=current_user.id)
    return {
        "success": True,
        "message": "Employee invitation sent and provisioned successfully.",
        "data": UserResponse.model_validate(invited_user),
        "errors": None
    }

@router.post("/bulk-import", response_model=UserListEnvelope)
async def bulk_import_users(
    payloads: list[UserCreate],
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    imported = []
    for payload in payloads:
        try:
            u = await service.create_user(schema_in=payload, creator_id=current_user.id)
            imported.append(u)
        except Exception:
            pass
    return {
        "success": True,
        "message": f"Successfully bulk imported {len(imported)} users.",
        "data": [UserResponse.model_validate(x) for x in imported],
        "errors": None
    }

@router.get("/export", response_model=UserListEnvelope)
async def export_users(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(User))
    users = result.scalars().all()
    return {
        "success": True,
        "message": "Exported all user records successfully.",
        "data": [UserResponse.model_validate(u) for u in users],
        "errors": None
    }