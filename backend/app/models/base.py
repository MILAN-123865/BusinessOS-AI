"""
Abstract base model mixin.

Every entity in the application inherits this mixin (alongside
`app.db.base_class.Base`) to get a consistent primary key strategy,
automatic timestamps, soft-delete support, and audit trail columns without
repeating boilerplate in every model file.

Usage:
    class Role(Base, BaseModel):
        __tablename__ = "roles"
        ...
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, declared_attr, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.user import User


class BaseModel:
    """
    Abstract mixin supplying common columns for all entities:

    - id: UUID v4 primary key (generated application-side).
    - created_at / updated_at: automatic timestamps managed by the database.
    - is_deleted / deleted_at: soft-delete support. Rows are never
      physically removed by default; repositories filter on
      `is_deleted == False` and a delete operation sets both fields instead
      of issuing a SQL DELETE.
    - created_by / updated_by: self-referencing audit trail pointing at the
      `users` table, nullable because the very first bootstrap user (and
      any system/automated process) has no creating user.

    This class is NOT a SQLAlchemy declarative base itself — it must always
    be combined with `app.db.base_class.Base` via multiple inheritance, and
    `__abstract__ = True` ensures SQLAlchemy does not try to map this class
    to its own table.
    """

    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
        index=True,
    )

    @declared_attr
    def created_by(cls) -> Mapped[uuid.UUID | None]:  # noqa: N805
        return mapped_column(
            UUID(as_uuid=True),
            ForeignKey("users.id", ondelete="SET NULL", use_alter=True),
            nullable=True,
        )

    @declared_attr
    def updated_by(cls) -> Mapped[uuid.UUID | None]:  # noqa: N805
        return mapped_column(
            UUID(as_uuid=True),
            ForeignKey("users.id", ondelete="SET NULL", use_alter=True),
            nullable=True,
        )

    @declared_attr
    def created_by_user(cls) -> Mapped["User | None"]:  # noqa: N805
        """The user who created this row (audit trail, read-only relationship)."""
        is_self_referential = cls.__name__ == "User"
        return relationship(
            "User",
            foreign_keys=f"[{cls.__name__}.created_by]",
            primaryjoin=f"{cls.__name__}.created_by == User.id",
            remote_side="User.id" if is_self_referential else None,
            viewonly=True,
            lazy="selectin",
        )

    @declared_attr
    def updated_by_user(cls) -> Mapped["User | None"]:  # noqa: N805
        """The user who last updated this row (audit trail, read-only relationship)."""
        is_self_referential = cls.__name__ == "User"
        return relationship(
            "User",
            foreign_keys=f"[{cls.__name__}.updated_by]",
            primaryjoin=f"{cls.__name__}.updated_by == User.id",
            remote_side="User.id" if is_self_referential else None,
            viewonly=True,
            lazy="selectin",
        )

    def soft_delete(self, deleted_by: uuid.UUID | None = None) -> None:
        """
        Mark this row as soft-deleted.

        Sets `is_deleted=True` and `deleted_at=now()`. Does NOT issue a SQL
        DELETE; the caller (repository layer) is still responsible for
        `session.flush()` / `session.commit()`.
        """
        self.is_deleted = True
        self.deleted_at = func.now()
        if deleted_by is not None:
            self.updated_by = deleted_by

    def restore(self) -> None:
        """Reverse a soft delete: clears `is_deleted` and `deleted_at`."""
        self.is_deleted = False
        self.deleted_at = None