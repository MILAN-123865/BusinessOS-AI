from typing import Callable, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError

from app.config.settings import settings
from app.core.security import decode_token, InvalidTokenError
from app.schemas.auth import TokenPayload
from app.models.user import User
from app.services.user_service import UserService
from app.dependencies.services import get_user_service

# Declare OAuth2 scheme token URL mapping to match enterprise deployment targets.
# NOTE: settings.py exposes API_V1_PREFIX — there is no API_V1_STR attribute.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service)
) -> User:
    """
    Decodes, cryptographically validates, and verifies incoming Bearer JWT tokens.
    Resolves the associated database User context containing fully hydrated relationship matrices.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Access token is missing, expired, or malformed.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        token_data = TokenPayload(**payload)
        if token_data.sub is None:
            raise credentials_exception
    except (InvalidTokenError, ValidationError):
        raise credentials_exception

    # get_with_auth_context eager loads user roles and sub-permissions inside the repository mapping
    user = await user_service.user_repo.get_with_auth_context(email=token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account associated with this token does not exist."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been disabled by administration parameters."
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Convenience dependency layer targeting active identity authorization exclusively."""
    return current_user


class PermissionChecker:
    """
    Dynamic Closure Factory supporting granular string capability evaluation (PBAC).
    Intercepts user execution scopes against dynamic permission strings mapped in active models.
    """
    def __init__(self, required_permissions: List[str]) -> None:
        self.required_permissions = required_permissions

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        # Extract flat deduped permission codenames across all user-assigned roles
        user_permissions = {
            perm.codename
            for role in current_user.roles
            for perm in role.permissions
            if not role.is_deleted and not perm.is_deleted
        }

        # Validate if the user claims contain all strictly mandatory route execution tokens
        missing_permissions = [perm for perm in self.required_permissions if perm not in user_permissions]

        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Access Denied. You possess insufficient operational capabilities to invoke this vector.",
                    "missing_permissions": missing_permissions
                }
            )

        return current_user


# Expressive structural dependency alias matching standard functional endpoints mapping signatures
def check_permissions(required_permissions: List[str]) -> Callable:
    return PermissionChecker(required_permissions)