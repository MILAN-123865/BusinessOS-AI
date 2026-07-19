import asyncio
import sys
from sqlalchemy import text

from app.config.database import Base, engine, get_session
from app.models.organization import Organization
from app.models.department import Department
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.user_role import UserRole
from app.models.role_permission import RolePermission
from app.models.client import Client, ClientContact
from app.models.project import Project, ProjectMember, ProjectMilestone
from app.models.task import Task, TaskComment, TaskSubtask
from app.models.calendar import Meeting, CalendarEvent
from app.core.security import get_password_hash

async def main():
    print("Registered tables in metadata:", list(Base.metadata.tables.keys()))
    
    try:
        print("Connecting to the database and creating tables...")
        async with engine.begin() as conn:
            # Create all tables defined in models
            await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully!")
    except Exception as e:
        print("Error during table creation:")
        import traceback
        traceback.print_exc()
        return

    print("Seeding default data...")
    try:
        async with get_session() as session:
            # Check if organization exists
            res = await session.execute(text("SELECT id FROM organizations LIMIT 1"))
            org_id = res.scalar()
            
            if not org_id:
                print("Creating default organization...")
                org = Organization(
                    name="Default Enterprise",
                    slug="default-enterprise",
                    description="Default seeded organization",
                    is_active=True
                )
                session.add(org)
                await session.flush()
                org_id = org.id
            else:
                print(f"Using existing organization ID: {org_id}")

            # Check if admin user exists
            res = await session.execute(text("SELECT id FROM users WHERE email = 'admin@example.com'"))
            admin_id = res.scalar()

            if not admin_id:
                print("Creating superuser admin@example.com...")
                admin_user = User(
                    organization_id=org_id,
                    email="admin@example.com",
                    hashed_password=get_password_hash("password123"),
                    first_name="Admin",
                    last_name="System",
                    is_active=True,
                    is_superuser=True
                )
                session.add(admin_user)
                await session.commit()
                print("Superuser created successfully!")
            else:
                print("Superuser admin@example.com already exists!")
    except Exception as e:
        print("Error during seeding default data:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
