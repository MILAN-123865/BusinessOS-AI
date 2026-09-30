from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt import InvalidTokenError
import bcrypt

from app.config.settings import settings


def get_password_hash(password: str) -> str:
    """
    Hash a plaintext password using bcrypt algorithm.
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plaintext password against its hashed value.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def _encode_token(payload: dict[str, Any], secret_key: str) -> str:
    """Internal helper: signs a payload with the given secret key."""
    return jwt.encode(
        payload,
        secret_key,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    """
    Create a signed JWT access token, signed with JWT_SECRET_KEY.
    """

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expire = datetime.now(timezone.utc) + expires_delta

    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }

    if additional_claims:
        payload.update(additional_claims)

    return _encode_token(payload, settings.JWT_SECRET_KEY)


def create_refresh_token(
    subject: str,
) -> str:
    """
    Create a refresh token, signed with its own JWT_REFRESH_SECRET_KEY so a
    leaked access-token secret can never be used to mint refresh tokens.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
    }

    return _encode_token(payload, settings.JWT_REFRESH_SECRET_KEY)


def decode_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate an access-token JWT.
    Raises InvalidTokenError (or a subclass, e.g. ExpiredSignatureError) if invalid.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


def decode_refresh_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate a refresh-token JWT (signed with the separate
    refresh secret). Raises InvalidTokenError if invalid.
    """
    return jwt.decode(
        token,
        settings.JWT_REFRESH_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


def is_refresh_token(
    payload: dict[str, Any],
) -> bool:
    """
    Determine whether the decoded JWT is a refresh token.
    """
    return payload.get("type") == "refresh"


__all__ = [
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "decode_refresh_token",
    "is_refresh_token",
    "InvalidTokenError",
]