from __future__ import annotations

from typing import TYPE_CHECKING, List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.role_permission import RolePermission


class Permission(Base, BaseModel):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    role_permissions: Mapped[List["RolePermission"]] = relationship(
        "RolePermission",
        back_populates="permission",
        cascade="all, delete-orphan",
        lazy="selectin",
        foreign_keys="RolePermission.permission_id",
    )

    roles: Mapped[List["Role"]] = relationship(
        "Role",
        secondary="role_permissions",
        viewonly=True,
        lazy="selectin",
    )

    def __repr__(self):
        return f"<Permission(name={self.name})>"