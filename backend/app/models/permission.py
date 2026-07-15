import uuid
from typing import TYPE_CHECKING, List
from sqlalchemy import String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Assuming the declarative base class lives in app.db.base_class
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.role_permission import RolePermission


class Permission(Base):
    """
    Represents fine-grained, string-based capabilities within BusinessOS AI.
    Implements standard RBAC/PBAC permissions mapped across the organization.
    Inherits ID, audit logs, and soft-delete states from the Base class.
    """
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False, 
        comment="Human-readable name for the permission, e.g., 'Create Users'"
    )
    
    codename: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        nullable=False, 
        comment="System identifier for rule enforcement, e.g., 'user:create'"
    )
    
    description: Mapped[str | None] = mapped_column(
        String(255), 
        nullable=True, 
        comment="Contextual explanation of what capabilities this permission grants"
    )

    # Many-to-Many Relationship backing via intermediate association table
    roles: Mapped[List["Role"]] = relationship(
        "Role",
        secondary="role_permissions",
        back_populates="permissions",
        lazy="selectin"
    )

    # Direct access to the association model instances if required for historical logging
    role_permissions: Mapped[List["RolePermission"]] = relationship(
        "RolePermission",
        back_populates="permission",
        cascade="all, delete-orphan",
        lazy="raise"
    )

    __table_args__ = (
        Index(
            "ix_permissions_codename_active",
            "codename",
            postgresql_where="is_deleted = FALSE"
        ),
    )

    def __repr__(self) -> str:
        return f"<Permission(id={self.id}, codename='{self.codename}')>"