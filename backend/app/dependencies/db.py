from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_session() as session:
        yield session