"""
BusinessOS AI - Application Constants
--------------------------------------------------------------------------
Centralized, immutable constants shared across the entire codebase:
enumerations for roles/permissions/token types, pagination defaults,
cache key conventions, HTTP header names, and validation patterns.

Rule of thumb: if a "magic string" or "magic number" (a role name, a
header key, a page size limit, a regex) is used in more than one place,
it belongs here — not re-typed inline in a repository, service, or route.
This prevents drift where, e.g., one file checks `"admin"` and another
checks `"Admin"`.

This module has NO dependencies on the rest of the app (no imports from
`config`, `models`, `services`, etc.), so it can be safely imported from
anywhere — including low-level modules like `models/` and `core/security.py`
— without any risk of circular imports.
--------------------------------------------------------------------------
"""

from enum import Enum
from typing import Final


# ----------------------------------------------------------------------
# Authentication / JWT
# ----------------------------------------------------------------------
class TokenType(str, Enum):
    """
    Distinguishes JWT token purposes.

    Encoded into the token payload's "type" claim so `core/security.py`
    can reject, e.g., a refresh token presented where an access token
    is required — closing a common auth vulnerability where token types
    are interchangeable.
    """

    ACCESS = "access"
    REFRESH = "refresh"


class TokenClaim(str, Enum):
    """
    Canonical names of custom JWT payload claims used across the app,
    so encoding (`core/security.py`) and decoding (`dependencies/auth.py`)
    never drift from each other due to a typo in a raw string literal.
    """

    SUBJECT = "sub"
    TOKEN_TYPE = "type"
    EXPIRES_AT = "exp"
    ISSUED_AT = "iat"
    JWT_ID = "jti"
    TENANT_ID = "tenant_id"
    ROLE = "role"


AUTHORIZATION_HEADER: Final[str] = "Authorization"
BEARER_SCHEME: Final[str] = "Bearer"


# ----------------------------------------------------------------------
# Roles & Permissions (RBAC)
# ----------------------------------------------------------------------
class UserRole(str, Enum):
    """
    Platform-wide role hierarchy used by `app/permissions/` for
    authorization checks. Defined as a str Enum so it serializes cleanly
    in Pydantic schemas, JWT claims, and JSON API responses without a
    custom encoder.
    """

    SUPER_ADMIN = "super_admin"   # Cross-tenant platform administrator
    ADMIN = "admin"               # Full control within their own tenant
    MANAGER = "manager"           # Elevated access within their own tenant
    MEMBER = "member"             # Standard authenticated user
    GUEST = "guest"               # Read-only / limited access


class PermissionAction(str, Enum):
    """
    CRUD-style actions used to compose fine-grained permissions
    (e.g. "invoice:create") in `app/permissions/`.
    """

    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LIST = "list"


# ----------------------------------------------------------------------
# Pagination
# ----------------------------------------------------------------------
DEFAULT_PAGE: Final[int] = 1
DEFAULT_PAGE_SIZE: Final[int] = 20
MAX_PAGE_SIZE: Final[int] = 100
MIN_PAGE_SIZE: Final[int] = 1


# ----------------------------------------------------------------------
# Caching (Redis)
# ----------------------------------------------------------------------
class CacheKeyPrefix(str, Enum):
    """
    Namespacing prefixes for Redis keys, preventing collisions between
    unrelated features sharing the same Redis instance/database
    (e.g. a "user:1" cache key vs. a "user:1" rate-limit counter).

    Usage: f"{CacheKeyPrefix.USER_SESSION}:{user_id}"
    """

    USER_SESSION = "session"
    USER_PROFILE = "user_profile"
    RATE_LIMIT = "rate_limit"
    TOKEN_BLOCKLIST = "token_blocklist"
    IDEMPOTENCY_KEY = "idempotency"


# Default time-to-live values, in seconds, for cached entries.
CACHE_TTL_SHORT: Final[int] = 60            # 1 minute
CACHE_TTL_MEDIUM: Final[int] = 60 * 15      # 15 minutes
CACHE_TTL_LONG: Final[int] = 60 * 60 * 24   # 24 hours


# ----------------------------------------------------------------------
# HTTP / Request tracing
# ----------------------------------------------------------------------
CORRELATION_ID_HEADER: Final[str] = "X-Correlation-ID"
REQUEST_ID_HEADER: Final[str] = "X-Request-ID"
IDEMPOTENCY_KEY_HEADER: Final[str] = "Idempotency-Key"


# ----------------------------------------------------------------------
# Validation patterns
# ----------------------------------------------------------------------
# Requires: 1 lowercase, 1 uppercase, 1 digit, 1 special character, 12+
# length. Enforced in Pydantic schemas (`schemas/auth.py`) rather than
# duplicated ad hoc across multiple request models.
PASSWORD_PATTERN: Final[str] = (
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$"
)

# RFC 5322-informed, pragmatic email pattern suitable for input
# validation (not full RFC compliance, which Pydantic's EmailStr with
# `email-validator` already handles more rigorously — this exists for
# contexts, such as bulk CSV import validation, that need a fast regex
# pre-filter before the heavier EmailStr validation runs).
EMAIL_PATTERN: Final[str] = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# E.164 international phone number format, e.g. "+14155552671".
PHONE_PATTERN: Final[str] = r"^\+[1-9]\d{7,14}$"

# Slug format used for tenant/organization identifiers in URLs
# (lowercase letters, numbers, hyphens; no leading/trailing hyphen).
SLUG_PATTERN: Final[str] = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


# ----------------------------------------------------------------------
# Standardized API error codes
# ----------------------------------------------------------------------
class ErrorCode(str, Enum):
    """
    Machine-readable error codes returned in API error response bodies
    (alongside a human-readable message), letting frontend/API consumers
    branch on `error.code` instead of parsing free-text messages, which
    are subject to change and localization.
    """

    VALIDATION_ERROR = "validation_error"
    NOT_FOUND = "not_found"
    ALREADY_EXISTS = "already_exists"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    TOKEN_EXPIRED = "token_expired"
    TOKEN_INVALID = "token_invalid"
    RATE_LIMITED = "rate_limited"
    CONFLICT = "conflict"
    INTERNAL_ERROR = "internal_error"
    SERVICE_UNAVAILABLE = "service_unavailable"