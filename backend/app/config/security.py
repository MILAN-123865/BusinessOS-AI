"""
BusinessOS AI - Security Primitives
--------------------------------------------------------------------------
Low-level, dependency-free (of the rest of the app) security utilities:
password hashing/verification and JWT creation/decoding.

This module deliberately contains NO database access, NO HTTP concerns,
and NO business logic (e.g. "is this user allowed to log in") — it is
pure cryptographic/token machinery. Business rules built on top of these
primitives (login flow, token refresh flow, logout/blocklisting) belong
in `app/services/auth_service.py`; request-level wiring (extracting the
current user from a request) belongs in `app/dependencies/auth.py`.

Keeping this separation means the hashing algorithm or JWT library can be
swapped here, in one place, without touching services, routes, or
dependencies that merely consume the functions below.
--------------------------------------------------------------------------
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext

from app.config.settings import settings
from app.core.constants import TokenClaim, TokenType

# ----------------------------------------------------------------------
# Password hashing
# ----------------------------------------------------------------------
# bcrypt is used as the sole scheme: it is battle-tested, has a tunable
# work factor, and is still an industry-accepted standard for password
# storage. `deprecated="auto"` means if a stronger scheme is added to
# `schemes=[...]` in the future (e.g. argon2), passlib will automatically
# flag old bcrypt hashes as needing a re-hash on next successful login,
# enabling a zero-downtime migration path.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Hashes a plaintext password using bcrypt.

    Never store or log `plain_password` anywhere else in the codebase —
    this function's return value is the only form of the password that
    should ever reach the database.
    """
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a previously hashed value.

    Uses passlib's constant-time comparison internally, preventing
    timing-attack side channels that a naive `==` string comparison
    would be vulnerable to.
    """
    return _pwd_context.verify(plain_password, hashed_password)


def needs_rehash(hashed_password: str) -> bool:
    """
    Returns True if a stored hash was created with outdated parameters
    (e.g. a lower bcrypt work factor than currently configured).

    Intended to be checked in `auth_service.login()` immediately after a
    successful `verify_password` call: if True, re-hash the plaintext
    password (still available at that point in the request) and persist
    it, achieving a gradual, transparent security upgrade path without
    forcing a password reset on every user.
    """
    return _pwd_context.needs_update(hashed_password)


# ----------------------------------------------------------------------
# JWT errors
# ----------------------------------------------------------------------
class TokenError(Exception):
    """Base class for all token-related errors raised by this module."""


class TokenExpiredError(TokenError):
    """Raised when a token's `exp` claim is in the past."""


class InvalidTokenError(TokenError):
    """Raised when a token is malformed, has an invalid signature, or is
    otherwise unparseable."""


class InvalidTokenTypeError(TokenError):
    """Raised when a token is structurally valid but is not of the
    expected type (e.g. a refresh token presented where an access token
    is required)."""


# ----------------------------------------------------------------------
# JWT creation
# ----------------------------------------------------------------------
def _create_token(
    subject: str,
    token_type: TokenType,
    expires_delta: timedelta,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Internal helper that assembles and signs a JWT.

    Every token carries:
      - `sub`: the subject (typically the user's UUID as a string)
      - `type`: distinguishes access vs. refresh tokens
      - `iat` / `exp`: issued-at and expiry timestamps
      - `jti`: a unique token ID, enabling server-side revocation via a
        Redis blocklist (`CacheKeyPrefix.TOKEN_BLOCKLIST`) without
        needing to invalidate every token a user holds.
    """
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        TokenClaim.SUBJECT.value: subject,
        TokenClaim.TOKEN_TYPE.value: token_type.value,
        TokenClaim.ISSUED_AT.value: now,
        TokenClaim.EXPIRES_AT.value: now + expires_delta,
        TokenClaim.JWT_ID.value: str(uuid.uuid4()),
    }

    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(
    subject: str,
    tenant_id: Optional[str] = None,
    role: Optional[str] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Creates a short-lived access token for the given subject (user ID).

    `tenant_id` and `role` are embedded directly in the token so that
    `dependencies/auth.py` and `permissions/` can authorize a request
    without a database round-trip on every single call — at the cost of
    those claims being only as fresh as the token's lifetime, which is
    an accepted tradeoff given `ACCESS_TOKEN_EXPIRE_MINUTES` is short.
    """
    claims: Dict[str, Any] = dict(extra_claims or {})
    if tenant_id is not None:
        claims[TokenClaim.TENANT_ID.value] = tenant_id
    if role is not None:
        claims[TokenClaim.ROLE.value] = role

    return _create_token(
        subject=subject,
        token_type=TokenType.ACCESS,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims=claims,
    )


def create_refresh_token(subject: str) -> str:
    """
    Creates a long-lived refresh token for the given subject.

    Deliberately carries no `tenant_id`/`role` claims: its only purpose
    is to prove identity when requesting a new access token, at which
    point `auth_service.refresh()` re-fetches the user's current
    tenant/role from the database, so a role change takes effect on the
    very next refresh rather than waiting for every outstanding refresh
    token to expire.
    """
    return _create_token(
        subject=subject,
        token_type=TokenType.REFRESH,
        expires_delta=timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
    )


# ----------------------------------------------------------------------
# JWT decoding / verification
# ----------------------------------------------------------------------
def decode_token(token: str, expected_type: TokenType) -> Dict[str, Any]:
    """
    Decodes and validates a JWT, enforcing both signature/expiry
    validity and that the token's `type` claim matches `expected_type`.

    Raises:
        TokenExpiredError: the token's signature is valid but it has expired.
        InvalidTokenError: the token is malformed or has an invalid signature.
        InvalidTokenTypeError: the token is valid but of the wrong type
            (e.g. a refresh token passed to an endpoint expecting an
            access token).

    Callers (`dependencies/auth.py`) should catch these and translate
    them into the appropriate HTTP 401 response with the corresponding
    `ErrorCode.TOKEN_EXPIRED` / `ErrorCode.TOKEN_INVALID`.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenExpiredError("Token has expired.") from exc
    except jwt.PyJWTError as exc:
        raise InvalidTokenError("Token is malformed or has an invalid signature.") from exc

    token_type = payload.get(TokenClaim.TOKEN_TYPE.value)
    if token_type != expected_type.value:
        raise InvalidTokenTypeError(
            f"Expected token type '{expected_type.value}', got '{token_type}'."
        )

    return payload