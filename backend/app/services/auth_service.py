from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    InvalidTokenError,
)
from app.services.user_service import UserService


class AuthService:
    """
    Enterprise Authentication Service.
    Responsible for login and JWT generation.
    """

    def __init__(self, user_service: UserService):
        self.user_service = user_service

    async def login(self, email: str, password: str):
        # Load user with roles & permissions
        user = await self.user_service.user_repo.get_with_auth_context(email)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive."
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        user.last_login_at = datetime.now(timezone.utc)

        # NOTE: setting the attribute alone never reaches the database —
        # it needs to be added back to the session and flushed, or the
        # timestamp silently vanishes at the end of the request.
        self.user_service.user_repo.db.add(user)
        await self.user_service.user_repo.db.flush()

        access_token = create_access_token(
            subject=user.email
        )

        refresh_token = create_refresh_token(
            subject=user.email
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_superuser": user.is_superuser,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
            }
        }

    async def refresh_token(self, token: str):
        try:
            payload = decode_refresh_token(token)
            email = payload.get("sub")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload."
                )
        except InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user = await self.user_service.user_repo.get_by_email(email)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )

        access_token = create_access_token(subject=user.email)
        return {
            "access_token": access_token,
            "token_type": "Bearer"
        }