"""
Role model.

Represents an organization-scoped role in the RBAC (Role Based Access
Control) system. A Role is a named collection of Permissions (via the
RolePermission association entity) that can be assigned to Users (via the
UserRole association entity).

Roles are scoped per-Organization so that two organizations can each define
a role called "Manager" with completely independent permission sets.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.base import BaseModel

if TYPE_CHECKING:
    # Imported only for static type checking to avoid circular imports at
    # runtime. Actual classes are resolved via the SQLAlchemy mapper
    # registry using the string names passed to relationship().
    from app.models.organization import Organization
    from app.models.role_permission import RolePermission
    from app.models.user_role import UserRole


class Role(Base, BaseModel):
    """
    An organization-scoped, assignable role.

    Attributes:
        organization_id: Owning organization (roles do not cross tenants).
        name: Human-readable display name, e.g. "Project Manager".
        slug: Machine-readable, URL/code-safe identifier, e.g. "project_manager".
        description: Optional longer explanation of the role's purpose.
        is_system_role: True for built-in roles (e.g. "Owner", "Admin") that
            are seeded automatically and cannot be deleted or renamed by
            end users, only have their permission set modified.
        is_active: Soft toggle to disable a role without deleting it.
    """

    __tablename__ = "roles"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    slug: Mapped[str] = mapped_column(String(100), nullable=False)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_system_role: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    # -----------------------------------------------------------------
    # Relationships
    # -----------------------------------------------------------------
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="roles",
        lazy="selectin",
    )

    role_permissions: Mapped[List["RolePermission"]] = relationship(
        "RolePermission",
        back_populates="role",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    user_roles: Mapped[List["UserRole"]] = relationship(
        "UserRole",
        back_populates="role",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint(
            "organization_id", "slug", name="uq_roles_organization_id_slug"
        ),
        Index("ix_roles_organization_id", "organization_id"),
        Index("ix_roles_slug", "slug"),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return (
            f"<Role id={self.id} slug={self.slug!r} "
            f"organization_id={self.organization_id}>"
        )