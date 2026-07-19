"""
Service-layer dependency factories.

Kept in their own module (separate from app/api/*.py and
app/dependencies/auth.py) specifically to avoid circular imports:
app/api/user.py needs get_user_service, and also needs
get_current_active_user / check_permissions from app/dependencies/auth.py.
If get_user_service lived inside app/api/user.py itself, and
app/dependencies/auth.py imported it from there, you'd get a circular
import (auth.py -> api/user.py -> auth.py) that fails at startup with
"cannot import name ... from partially initialized module". Routing
service factories through this neutral module breaks that cycle.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def get_user_service(db: AsyncSession = Depends(get_db_session)) -> UserService:
    """Builds a UserService wired to a request-scoped DB session."""
    return UserService(user_repository=UserRepository(db))