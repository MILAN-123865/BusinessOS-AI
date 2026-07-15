"""
BusinessOS AI - Database Engine & Session Management
--------------------------------------------------------------------------
Configures the SQLAlchemy 2.0 async engine, session factory, and the
declarative base class that all ORM models inherit from.

This module owns the *connection lifecycle* only. It does not contain
business logic, ORM models, or route-level dependency functions
(`get_db` for FastAPI route injection lives in `app/dependencies/db.py`
and simply wraps `get_session` defined here) — keeping this separation
respects the Single Responsibility Principle and avoids circular imports
between `config`, `models`, and `dependencies`.
--------------------------------------------------------------------------
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config.settings import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """
    Shared declarative base for all SQLAlchemy ORM models.

    Every model in `app/models/` must inherit from this class, e.g.:

        class User(Base):
            __tablename__ = "users"
            ...

    Centralizing this here (rather than in `app/models/__init__.py`)
    means both `app/models/` and Alembic's `env.py` can import the same
    `Base` without either depending on the other, avoiding circular
    imports between the models package and the migrations tooling.
    """

    pass


def _build_engine() -> AsyncEngine:
    """
    Constructs the async SQLAlchemy engine from application settings.

    Pool configuration is environment-aware:
      - In "test" environments we use NullPool so each test gets a fresh,
        isolated connection with no pooling side effects between tests.
      - In all other environments we use SQLAlchemy's default
        (QueuePool-based) async pool, sized from settings, which is
        appropriate for long-running API server processes.
    """
    engine_kwargs: dict = {
        "url": str(settings.POSTGRES_URL),
        # Recycle connections before typical firewall/DB idle-timeout
        # windows close them silently underneath us.
        "pool_recycle": 1800,
        # Verifies a connection is alive before handing it out, preventing
        # "server closed the connection unexpectedly" errors under load.
        "pool_pre_ping": True,
        # SQL echo should only ever be tied to DEBUG, never hardcoded on,
        # since it is verbose and can leak sensitive query parameters
        # into logs.
        "echo": settings.DEBUG,
        "future": True,
    }

    if settings.ENVIRONMENT == "test":
        engine_kwargs["poolclass"] = NullPool
    else:
        engine_kwargs["pool_size"] = settings.POSTGRES_POOL_SIZE
        engine_kwargs["max_overflow"] = settings.POSTGRES_MAX_OVERFLOW

    return create_async_engine(**engine_kwargs)


# Module-level singleton engine. Created once per process and reused by
# every session — engines are designed to be long-lived and thread/task
# safe; creating a new one per request would exhaust the database's
# connection limit almost immediately.
engine: AsyncEngine = _build_engine()

# Session factory bound to the engine above.
#   - expire_on_commit=False: ORM objects remain usable (e.g. serialized
#     into a Pydantic schema) after commit, without triggering a lazy
#     "refresh" query that would fail outside of an active session/request.
#   - autoflush=True: pending changes are flushed before queries within
#     the same session, so reads reflect writes made earlier in the same
#     unit of work.
AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,
    autocommit=False,
)


@asynccontextmanager
async def get_session() -> AsyncIterator[AsyncSession]:
    """
    Provides a transactional async session as a context manager.

    This is the single choke point for session lifecycle: it guarantees
    that every session is committed on success, rolled back on failure,
    and closed in all cases — callers (repositories, services, FastAPI
    dependencies, background jobs, Alembic scripts) never manage this
    lifecycle themselves.

    Usage:
        async with get_session() as session:
            result = await session.execute(select(User))
    """
    session = AsyncSessionFactory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        logger.exception("Database session rolled back due to an exception.")
        raise
    finally:
        await session.close()


async def init_db_connection() -> None:
    """
    Verifies database connectivity at application startup.

    Intended to be called once from the FastAPI lifespan startup hook in
    `app/main.py`. This does NOT create tables or run migrations — schema
    management is Alembic's responsibility exclusively, keeping runtime
    application code and schema evolution cleanly separated. Its only
    purpose is to fail fast (loudly, at boot) if the database is
    unreachable, rather than surfacing that failure later as a confusing
    500 error on the first incoming request.
    """
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
    logger.info("Database connection established successfully.")


async def close_db_connection() -> None:
    """
    Disposes of the engine's connection pool at application shutdown.

    Intended to be called once from the FastAPI lifespan shutdown hook in
    `app/main.py`, ensuring all pooled connections are released cleanly
    instead of being dropped abruptly when the process exits.
    """
    await engine.dispose()
    logger.info("Database connections disposed.")