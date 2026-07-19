from __future__ import annotations

from pydantic import BaseModel


class TokenPayload(BaseModel):
    """
    Validated shape of a decoded JWT payload's claims.
    `sub` holds the user's email (the token subject).
    """
    sub: str | None = None
    type: str | None = None
    exp: int | None = None
    iat: int | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserLoginResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_superuser: bool
    is_verified: bool
    is_active: bool


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: UserLoginResponse