from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.dependencies.db import get_db
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.schemas.auth import LoginResponse, RefreshTokenRequest

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db=Depends(get_db),
):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    auth_service = AuthService(user_service)

    return await auth_service.login(
        form_data.username,
        form_data.password,
    )


@router.post("/refresh")
async def refresh_token(
    request: RefreshTokenRequest,
    db=Depends(get_db),
):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    auth_service = AuthService(user_service)

    return await auth_service.refresh_token(request.refresh_token)