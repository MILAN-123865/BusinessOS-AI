from typing import List, Optional, Tuple
from uuid import UUID
from fastapi import HTTPException, status

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User
# NOTE: core/security.py defines `get_password_hash`, not `hash_password`.
from app.core.security import get_password_hash


class UserService:
    """
    Enterprise-grade Service orchestrator managing Business logic for User resources.
    Implements separation of concerns by delegating actual queries to UserRepository.
    """
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repo = user_repository

    async def get_user_by_id(self, user_id: UUID) -> User:
        """Retrieves a single user, raising an 404 Exception if the resource is missing or soft-deleted."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The requested user record does not exist or has been deleted."
            )
        return user

    async def get_user_by_email(self, email: str) -> User:
        """Retrieves a single user by their email address."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user profile associated with this email address was found."
            )
        return user

    async def list_users(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        organization_id: Optional[UUID] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Tuple[List[User], int]:
        """Provides dynamic pagination, filtering, structural search, and multi-tenant scoping."""
        return await self.user_repo.get_multi(
            skip=skip,
            limit=limit,
            search=search,
            organization_id=organization_id,
            sort_by=sort_by,
            sort_desc=sort_desc
        )

    async def create_user(self, schema_in: UserCreate, creator_id: Optional[UUID] = None) -> User:
        """
        Registers a new user inside the organization context.
        Validates unique business constraints (email uniqueness) and hashes credentials securely.
        """
        existing_user = await self.user_repo.get_by_email(schema_in.email, include_deleted=True)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user profile with this email address is already registered in the system."
            )

        # Hash plain text password using the recommended password-hashing algorithm
        # prior to database serialization.
        hashed_pw = get_password_hash(schema_in.password)

        return await self.user_repo.create(
            obj_in=schema_in,
            hashed_password=hashed_pw,
            creator_id=creator_id
        )

    async def update_user(self, user_id: UUID, schema_in: UserUpdate, updater_id: Optional[UUID] = None) -> User:
        """
        Updates user attributes incrementally.
        Blocks raw/direct password modifications through this channel to prevent security exposure.
        """
        db_user = await self.get_user_by_id(user_id)

        # Check for email collision changes
        if schema_in.email and schema_in.email != db_user.email:
            existing_user = await self.user_repo.get_by_email(schema_in.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already taken by another registered profile."
                )

        # Check if the client is attempting to bypass secure channels to change a password
        if schema_in.password is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Direct password updates are not permitted here. Please use the designated secure reset route."
            )

        return await self.user_repo.update(db_obj=db_user, obj_in=schema_in, updater_id=updater_id)

    async def delete_user(self, user_id: UUID, deleter_id: Optional[UUID] = None) -> User:
        """Marks a user as soft-deleted inside the database to protect operational referential integrity."""
        db_user = await self.get_user_by_id(user_id)
        return await self.user_repo.soft_delete(db_obj=db_user, deleter_id=deleter_id)