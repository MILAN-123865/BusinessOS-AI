"""
SQLAlchemy declarative base.

This module defines the single `Base` class that every ORM model in the
application must inherit from (alongside `app.models.base.BaseModel`, which
supplies the common columns).

A naming convention is attached to the metadata so that Alembic autogenerate
produces deterministic, human-readable names for indexes, unique
constraints, foreign keys, and check constraints instead of PostgreSQL's
default auto-generated (and non-portable) names. This is essential for
reliable `alembic revision --autogenerate` diffs and for being able to
`DROP CONSTRAINT <name>` by hand when needed.
"""

from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Naming convention reference: https://alembic.sqlalchemy.org/en/latest/naming.html
NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_N_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """
    Shared declarative base for all ORM models.

    All models must inherit from both this class and
    `app.models.base.BaseModel`, e.g.:

        class Role(Base, BaseModel):
            __tablename__ = "roles"
            ...

    `Base` supplies the SQLAlchemy declarative machinery and metadata;
    `BaseModel` supplies the common audit/soft-delete columns.
    """

    metadata = MetaData(naming_convention=NAMING_CONVENTION)