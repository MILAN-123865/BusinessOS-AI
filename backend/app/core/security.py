from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using the recommended algorithm.
    """
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plaintext password against its hashed value.
    """
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    """
    Create a signed JWT access token.
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
    }

    if additional_claims:
        payload.update(additional_claims)

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return token


def decode_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate a JWT.
    Raises InvalidTokenError if invalid.
    """

    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )

    return payload


def create_refresh_token(
    subject: str,
) -> str:
    """
    Create a refresh token.
    """

    expire = timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    return create_access_token(
        subject=subject,
        expires_delta=expire,
        additional_claims={
            "type": "refresh",
        },
    )


def is_refresh_token(
    payload: dict[str, Any],
) -> bool:
    """
    Determine whether the decoded JWT is a refresh token.
    """

    return payload.get("type") == "refresh"