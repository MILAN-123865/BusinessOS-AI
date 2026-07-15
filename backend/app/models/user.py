"""
User model.

The central identity entity. Every authenticated principal in the system —
human staff members — is a row in this table. Users belong to exactly one
Organization, optionally belong to a Department, and are granted access via
one or more Roles (through the UserRole association entity).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.organization import Organization
    from app.models.user_role import UserRole


class User(Base, BaseModel):
    """
    A human user account.

    Attributes:
        organization_id: The tenant this user belongs to.
        department_id: Optional department within the organization.
        email: Globally unique login identifier.
        hashed_password: bcrypt hash — the plaintext password is never
            persisted or logged anywhere in the system.
        first_name / last_name: Display name components.
        phone_number: Optional contact number.
        avatar_url: Optional profile picture URL (e.g. S3/CDN link).
        is_active: Soft account-disable switch, independent of soft delete.
            An inactive user cannot authenticate but the row is preserved.
        is_verified: Whether the user has completed email verification.
        is_superuser: Platform-level administrative flag. Grants implicit
            bypass of permission checks; distinct from organization-scoped
            RBAC roles. Must be assigned manually, never via self-service.
        last_login_at: Timestamp of the most recent successful login,
            updated by the auth service on each successful token issuance.
    """

    __tablename__ = "users"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )

    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)

    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    phone_number: Mapped[str | None] = mapped_column(String(30), nullable=True)

    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # -----------------------------------------------------------------
    # Relationships
    # -----------------------------------------------------------------
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="users",
        foreign_keys=[organization_id],
        lazy="selectin",
    )

    department: Mapped["Department | None"] = relationship(
        "Department",
        back_populates="users",
        foreign_keys=[department_id],
        lazy="selectin",
    )

    # Explicit foreign_keys required: BaseModel also adds created_by/
    # updated_by self-referencing FKs to users.id, so SQLAlchemy cannot
    # infer which FK this relationship should join on without this hint.
    user_roles: Mapped[List["UserRole"]] = relationship(
        "UserRole",
        back_populates="user",
        foreign_keys="UserRole.user_id",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_users_organization_id", "organization_id"),
        Index("ix_users_department_id", "department_id"),
        Index("ix_users_organization_id_is_active", "organization_id", "is_active"),
    )

    @property
    def full_name(self) -> str:
        """Convenience computed property combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()

    def __repr__(self) -> str:  # pragma: no cover - debugging aid only
        return f"<User id={self.id} email={self.email!r}>"