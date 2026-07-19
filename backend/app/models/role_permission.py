"""
RolePermission association model.

Explicit many-to-many association entity between Role and Permission.
Modeled as its own mapped class (rather than a plain Table passed to
`secondary=`) so it can carry its own audit columns — the `secondary=`
relationships on Role.permissions / Permission.roles are viewonly reads
through this table; all writes go through this model directly.

Referenced by:
    - app/models/role.py       (Role.role_permissions, back_populates="role")
    - app/models/permission.py (Permission.role_permissions, back_populates="permission")
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
    from app.models.permission import Permission
    from app.models.role import Role


class RolePermission(Base, BaseModel):
    """
    Associates a single Role with a single Permission.

    Attributes:
        role_id: The role being granted the permission.
        permission_id: The permission being granted.
        granted_at: When this grant was created.
        granted_by: The user (typically an admin) who performed the grant,
            nullable for system/seed-time assignments with no human actor.
    """

    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )

    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        nullable=False,
    )

    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    granted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # -----------------------------------------------------------------
    # Relationships
    # -----------------------------------------------------------------
    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="role_permissions",
        foreign_keys=[role_id],
        lazy="selectin",
    )

    permission: Mapped["Permission"] = relationship(
        "Permission",
        back_populates="role_permissions",
        foreign_keys=[permission_id],
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint(
            "role_id", "permission_id", name="uq_role_permissions_role_id_permission_id"
        ),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<RolePermission role_id={self.role_id} permission_id={self.permission_id}>"