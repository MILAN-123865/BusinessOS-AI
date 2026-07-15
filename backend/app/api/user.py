from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, HTTPException

from app.schemas.user import UserCreate, UserUpdate, UserEnvelope, UserListEnvelope, UserResponse
from app.services.user_service import UserService
from app.models.user import User
# Assumed dependency injection hooks matching typical enterprise lifecycles
from app.dependencies.database import get_db_session
from app.dependencies.auth import get_current_active_user, check_permissions

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service(db=Depends(get_db_session)) -> UserService:
    """Local dependency provider factory yielding an initialized user domain engine."""
    from app.repositories.user_repository import UserRepository
    return UserService(UserRepository(db))


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
    return {
        "success": True,
        "message": f"Successfully mapped {len(users)} users. Global database records match: {total}.",
        "data": [UserResponse.model_validate(u) for u in users],
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
    return {
        "success": True,
        "message": "Target entity data structures fetched successfully.",
        "data": UserResponse.model_validate(user),
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