"""
UserRole association model.

Explicit many-to-many association entity between User and Role. Modeled as
its own mapped class (rather than a plain Table passed to `secondary=`)
so it can carry its own audit columns (who assigned this role, and when) —
something a bare secondary association table cannot do.

Referenced by:
    - app/models/user.py        (User.user_roles, back_populates="user")
    - app/models/role.py        (Role.user_roles, back_populates="role")
    - app/repositories/user_repository.py (selectinload chain)
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.user import User


class UserRole(Base, BaseModel):
    """
    Associates a single User with a single Role.

    Attributes:
        user_id: The user being granted the role.
        role_id: The role being granted.
        assigned_at: When this grant was created.
        assigned_by: The user (typically an admin) who performed the grant,
            nullable for system/seed-time assignments with no human actor.
    """

    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    assigned_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # -----------------------------------------------------------------
    # Relationships
    # -----------------------------------------------------------------
    # NOTE: foreign_keys must be given explicitly on both sides — this
    # table has three FKs into users.id (user_id, assigned_by, plus
    # BaseModel's created_by/updated_by), so SQLAlchemy cannot infer
    # which column each relationship should join on.
    user: Mapped["User"] = relationship(
        "User",
        back_populates="user_roles",
        foreign_keys=[user_id],
        lazy="selectin",
    )

    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="user_roles",
        foreign_keys=[role_id],
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_roles_user_id_role_id"),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<UserRole user_id={self.user_id} role_id={self.role_id}>"