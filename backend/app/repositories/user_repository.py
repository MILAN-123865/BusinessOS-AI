from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.models.permission import Permission
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    """
    Enterprise Repository handling async persistence operations for the User model.
    Implements soft-delete filters, granular pagination, structural search, and full joins.
    """
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: UUID, include_deleted: bool = False) -> Optional[User]:
        """Fetches a single user record by its UUID primary key."""
        stmt = select(User).where(User.id == user_id)
        if not include_deleted:
            stmt = stmt.where(User.is_deleted == False)

        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_email(self, email: str, include_deleted: bool = False) -> Optional[User]:
        """Fetches a single user via case-insensitive email matching."""
        stmt = select(User).where(func.lower(User.email) == func.lower(email))
        if not include_deleted:
            stmt = stmt.where(User.is_deleted == False)

        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_with_auth_context(self, email: str) -> Optional[User]:
        """
        Retrieves a user mapped fully with their complete security graphs.
        Eagerly loads related structural roles and permission contexts for RBAC evaluation.
        """
        stmt = (
            select(User)
            .where(func.lower(User.email) == func.lower(email))
            .where(User.is_deleted == False)
            .options(
                # NOTE: the previous version only loaded `User.user_roles`
                # (the raw association rows) and never reached down to the
                # actual Role / Permission objects. Since PermissionChecker
                # walks `current_user.roles -> role.permissions`, that data
                # needs to be eagerly loaded here too, or accessing it later
                # (outside the request's session) would fail with a
                # MissingGreenlet / DetachedInstanceError under async
                # SQLAlchemy. Every model in this chain also declares
                # lazy="selectin" itself, so this explicit chain is a
                # belt-and-suspenders safeguard, not strictly required.
                selectinload(User.user_roles)
                .selectinload(UserRole.role)
                .selectinload(Role.permissions)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        organization_id: Optional[UUID] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Tuple[List[User], int]:
        """
        Fetches structured query lists supporting search filters, indexing, sorting, and pagination.
        Returns a tuple containing the page items list and the global total records count.
        """
        # Base query configurations
        base_stmt = select(User).where(User.is_deleted == False)

        # Apply specific multi-tenant scope isolation
        if organization_id:
            base_stmt = base_stmt.where(User.organization_id == organization_id)

        # Apply fuzzy filtering matching text elements
        if search:
            search_filter = f"%{search}%"
            base_stmt = base_stmt.where(
                or_(
                    User.first_name.ilike(search_filter),
                    User.last_name.ilike(search_filter),
                    User.email.ilike(search_filter)
                )
            )

        # Execution of Count metadata calculation
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total_count = count_result.scalar_one()

        # Build dynamic sorting attributes safely
        sort_attr = getattr(User, sort_by, User.created_at)
        order_clause = sort_attr.desc() if sort_desc else sort_attr.asc()

        # Build fully loaded pagination statements
        query_stmt = base_stmt.order_by(order_clause).offset(skip).limit(limit)
        query_result = await self.db.execute(query_stmt)
        users = list(query_result.scalars().all())

        return users, total_count

    async def create(self, obj_in: UserCreate, hashed_password: str, creator_id: Optional[UUID] = None) -> User:
        """Instantiates and commits a new validated User model entity inside the architecture."""
        db_obj = User(
            email=obj_in.email,
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            phone_number=obj_in.phone_number,
            organization_id=obj_in.organization_id,
            department_id=obj_in.department_id,
            hashed_password=hashed_password,
            is_active=obj_in.is_active,
            created_by=creator_id,
            updated_by=creator_id
        )
        self.db.add(db_obj)
        await self.db.flush()  # Populates UUID and server defaults
        return db_obj

    async def update(self, db_obj: User, obj_in: UserUpdate, updater_id: Optional[UUID] = None) -> User:
        """
        Updates database state attributes using schema updates.
        Saves updates incrementally using transaction tracking states.
        """
        update_data = obj_in.model_dump(exclude_unset=True)

        # Intercept specific fields if they represent special security updates
        if "password" in update_data:
            raise ValueError("Directly updating passwords through generic user update vectors is restricted.")

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        if updater_id:
            db_obj.updated_by = updater_id

        self.db.add(db_obj)
        await self.db.flush()
        return db_obj

    async def soft_delete(self, db_obj: User, deleter_id: Optional[UUID] = None) -> User:
        """Executes systematic enterprise soft deletion by toggling state filters."""
        db_obj.is_deleted = True
        db_obj.deleted_at = func.now()
        if deleter_id:
            db_obj.updated_by = deleter_id

        self.db.add(db_obj)
        await self.db.flush()
        return db_obj