import asyncio
from sqlalchemy import select, func
from app.config.database import get_session
from app.models.user import User

async def main():
    try:
        async with get_session() as session:
            stmt = select(User).where(func.lower(User.email) == func.lower("admin@example.com"))
            result = await session.execute(stmt)
            user = result.scalars().first()
            if user:
                print(f"Success! Found user: {user.email}")
            else:
                print("No user found.")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
