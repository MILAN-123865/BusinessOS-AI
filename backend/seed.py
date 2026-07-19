import asyncio
import os
import sys
import uuid
import random
from datetime import datetime, timedelta, timezone, date
from faker import Faker

# Setup paths to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.config.settings import settings
from app.core.security import get_password_hash
from app.config.database import Base
from app.models.organization import Organization
from app.models.department import Department
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole
from app.models.client import Client
from app.models.project import Project
from app.models.task import Task
from app.models.activity import Activity
from app.models.notification import Notification
from app.models.calendar import CalendarEvent
from app.models.document import Document
from app.models.hr import LeaveRequest, Attendance
from app.models.finance import Invoice, Expense
from app.models.performance import PerformanceReview

fake = Faker()

# Generate deterministic data (optional, but requested "Nothing should be random after first seed")
fake.seed_instance(42)
random.seed(42)

engine = create_async_engine(str(settings.DATABASE_URL), echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def recreate_database():
    print("Dropping and recreating public schema...")
    async with engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.run_sync(Base.metadata.create_all)
    print("Tables recreated successfully.")

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("Starting Database Seeder...")

        # 1. Organization
        org_id = uuid.uuid4()
        org = Organization(
            id=org_id,
            name="Acme Enterprise Inc.",
            slug="acme-enterprise-inc",
            address=fake.address(),
            contact_phone=fake.phone_number(),
            website="https://acme.com",
            is_active=True
        )
        db.add(org)
        await db.flush()

        # 2. Permissions
        print("Seeding Permissions...")
        DEFAULT_PERMISSIONS = [
            ("dashboard.read", "Access to view dashboard overview metrics"),
            ("organization.read", "Access to view organization profile"),
            ("organization.manage", "Access to update organization details"),
            ("departments.read", "Access to view departments"),
            ("departments.manage", "Access to CRUD departments"),
            ("employees.read", "Access to view employees list"),
            ("employees.manage", "Access to CRUD employees"),
            ("roles.read", "Access to view roles"),
            ("roles.manage", "Access to CRUD roles"),
            ("permissions.read", "Access to view system permissions"),
            ("permissions.manage", "Access to configure system RBAC policies"),
            ("projects.read", "Access to view projects"),
            ("projects.manage", "Access to CRUD projects"),
            ("clients.read", "Access to view clients list"),
            ("clients.manage", "Access to CRUD clients"),
            ("documents.read", "Access to view documents list"),
            ("documents.manage", "Access to upload/delete documents"),
        ]
        
        perm_map = {}
        for name, desc in DEFAULT_PERMISSIONS:
            p = Permission(id=uuid.uuid4(), name=name, description=desc)
            db.add(p)
            perm_map[name] = p
        await db.flush()

        # 2b. Roles
        print("Seeding Roles...")
        roles = {}
        for role_name in ["Admin", "Manager", "HR", "Employee"]:
            role = Role(id=uuid.uuid4(), name=role_name, description=f"{role_name} Access", is_system=True)
            db.add(role)
            roles[role_name] = role
        await db.flush()

        # 2c. Role Permissions mappings
        # Admin gets all
        for p in perm_map.values():
            rp = RolePermission(role_id=roles["Admin"].id, permission_id=p.id)
            db.add(rp)
            
        # Manager permissions
        manager_perms = [
            "dashboard.read", "organization.read", "departments.read", 
            "employees.read", "projects.manage", "projects.read",
            "clients.manage", "clients.read", "documents.manage", "documents.read"
        ]
        for name in manager_perms:
            rp = RolePermission(role_id=roles["Manager"].id, permission_id=perm_map[name].id)
            db.add(rp)

        # HR permissions
        hr_perms = [
            "dashboard.read", "organization.read", "departments.read",
            "employees.manage", "employees.read", "roles.read"
        ]
        for name in hr_perms:
            rp = RolePermission(role_id=roles["HR"].id, permission_id=perm_map[name].id)
            db.add(rp)

        # Employee permissions
        employee_perms = [
            "dashboard.read", "organization.read", "departments.read",
            "projects.read", "documents.read"
        ]
        for name in employee_perms:
            rp = RolePermission(role_id=roles["Employee"].id, permission_id=perm_map[name].id)
            db.add(rp)
            
        await db.flush()

        # 3. Departments (12)
        print("Seeding Departments...")
        dept_names = ["Engineering", "Sales", "Marketing", "Human Resources", "Finance", 
                      "Operations", "Customer Support", "Legal", "Product", "Design", 
                      "IT & Security", "Research & Development"]
        departments = []
        for name in dept_names:
            dept = Department(
                id=uuid.uuid4(),
                organization_id=org_id,
                name=name,
                description=f"{name} department handles related operations."
            )
            db.add(dept)
            departments.append(dept)
        await db.flush()

        # 4. Users (5 Admins, 10 HR, 40 Managers, 95 Employees = 150 total)
        print("Seeding Users...")
        users = []
        hashed_pw = get_password_hash("Admin123!")

        def create_user(role_name, dept=None, is_super=False):
            u_id = uuid.uuid4()
            u = User(
                id=u_id,
                organization_id=org_id,
                department_id=dept.id if dept else random.choice(departments).id,
                email=fake.unique.company_email(),
                hashed_password=hashed_pw,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone_number=fake.phone_number(),
                is_active=True,
                is_superuser=is_super
            )
            db.add(u)
            db.add(UserRole(user_id=u_id, role_id=roles[role_name].id))
            users.append(u)
            return u

        # Admins
        super_admins = [create_user("Admin", is_super=True) for _ in range(5)]
        # Force one to be admin@example.com for easy login
        super_admins[0].email = "admin@example.com"
        
        hr_users = [create_user("HR", dept=departments[3]) for _ in range(10)]
        managers = [create_user("Manager") for _ in range(40)]
        employees = [create_user("Employee") for _ in range(95)]

        await db.flush()
        
        # All valid users
        all_users = super_admins + hr_users + managers + employees

        # 5. Clients (300)
        print("Seeding Clients...")
        clients = []
        for _ in range(300):
            client = Client(
                id=uuid.uuid4(),
                organization_id=org_id,
                company_name=fake.company(),
                email=fake.company_email(),
                phone=fake.phone_number(),
                industry=random.choice(["Tech", "Healthcare", "Finance", "Retail", "Manufacturing", "Education"]),
                address=fake.address(),
                status=random.choice(["Active", "Active", "Active", "Inactive"])
            )
            db.add(client)
            clients.append(client)
        await db.flush()

        # 6. Projects (250)
        print("Seeding Projects...")
        projects = []
        for _ in range(250):
            project = Project(
                id=uuid.uuid4(),
                organization_id=org_id,
                client_id=random.choice(clients).id,
                name=fake.catch_phrase(),
                description=fake.bs(),
                status=random.choice(["Planning", "In Progress", "In Progress", "Review", "Completed"]),
                start_date=fake.date_between(start_date="-1y", end_date="today"),
                end_date=fake.date_between(start_date="today", end_date="+1y"),
                budget=random.randint(10000, 500000),
                priority=random.choice(["Low", "Medium", "High"])
            )
            db.add(project)
            projects.append(project)
        await db.flush()

        # 7. Tasks (500)
        print("Seeding Tasks...")
        tasks = []
        for _ in range(500):
            task = Task(
                id=uuid.uuid4(),
                organization_id=org_id,
                project_id=random.choice(projects).id,
                assignee_id=random.choice(all_users).id,
                title=fake.sentence(nb_words=4),
                description=fake.text(),
                status=random.choice(["To Do", "In Progress", "Review", "Completed", "Completed"]),
                priority=random.choice(["Low", "Medium", "High"]),
                due_date=fake.date_between(start_date="-1m", end_date="+3m")
            )
            db.add(task)
            tasks.append(task)
        await db.flush()

        # 8. Notifications (1000) & Activities (700)
        print("Seeding Notifications & Activities...")
        for _ in range(1000):
            notif = Notification(
                id=uuid.uuid4(),
                user_id=random.choice(all_users).id,
                type=random.choice(["info", "success", "warning", "error"]),
                title=fake.sentence(nb_words=3),
                description=fake.sentence(),
                read=random.choice([True, False]),
                created_at=fake.date_time_between(start_date='-30d', end_date='now', tzinfo=timezone.utc)
            )
            db.add(notif)
            
        for _ in range(700):
            act = Activity(
                id=uuid.uuid4(),
                user_id=random.choice(all_users).id,
                organization_id=org_id,
                type=random.choice(["project", "task", "employee", "document"]),
                title=fake.sentence(nb_words=3),
                description=fake.sentence(),
                created_at=fake.date_time_between(start_date='-60d', end_date='now', tzinfo=timezone.utc)
            )
            db.add(act)

        # 9. Calendar Events (500)
        print("Seeding Calendar...")
        for _ in range(500):
            start_t = fake.date_time_between(start_date='-10d', end_date='+30d', tzinfo=timezone.utc)
            evt = CalendarEvent(
                id=uuid.uuid4(),
                organization_id=org_id,
                title=fake.sentence(nb_words=4),
                description=fake.text(),
                start_time=start_t,
                end_time=start_t + timedelta(hours=random.randint(1, 4)),
                event_type=random.choice(["Meeting", "Review", "Presentation", "Deadline"])
            )
            db.add(evt)

        # 10. Documents (400)
        print("Seeding Documents...")
        for _ in range(400):
            doc = Document(
                id=uuid.uuid4(),
                organization_id=org_id,
                owner_id=random.choice(all_users).id,
                title=fake.file_name(),
                file_url=f"https://storage.acme.com/{fake.file_name()}",
                file_type=random.choice(["pdf", "docx", "xlsx", "png"]),
                size_bytes=random.randint(1024, 1024 * 1024 * 50)
            )
            db.add(doc)

        # 11. Leave Requests (300)
        print("Seeding Leave Requests...")
        for _ in range(300):
            leave = LeaveRequest(
                id=uuid.uuid4(),
                organization_id=org_id,
                user_id=random.choice(all_users).id,
                leave_type=random.choice(["Sick", "Vacation", "Personal", "Maternity"]),
                start_date=fake.date_between(start_date="-60d", end_date="+30d"),
                end_date=fake.date_between(start_date="+31d", end_date="+40d"),
                status=random.choice(["Pending", "Approved", "Rejected"])
            )
            db.add(leave)

        # 12. Attendance (Recent 30 days for 50 random employees to save time)
        print("Seeding Attendance...")
        sample_users = random.sample(all_users, 50)
        today = date.today()
        for u in sample_users:
            for day_offset in range(30):
                att_date = today - timedelta(days=day_offset)
                # Skip weekends mostly
                if att_date.weekday() >= 5 and random.random() < 0.9:
                    continue
                att = Attendance(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    user_id=u.id,
                    date=att_date,
                    status=random.choice(["Present", "Present", "Present", "Absent", "Half Day"]),
                    check_in=datetime.combine(att_date, datetime.min.time()).replace(hour=9, minute=random.randint(0, 30), tzinfo=timezone.utc),
                    check_out=datetime.combine(att_date, datetime.min.time()).replace(hour=17, minute=random.randint(0, 59), tzinfo=timezone.utc)
                )
                db.add(att)

        # 13. Financials (Invoices and Expenses for past 12 months)
        print("Seeding Financials...")
        for month_offset in range(12):
            target_date = today - timedelta(days=month_offset * 30)
            # 10 Invoices per month
            for _ in range(10):
                inv = Invoice(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    client_id=random.choice(clients).id,
                    invoice_number=fake.unique.bothify(text='INV-####-????'),
                    amount=random.randint(5000, 50000),
                    status=random.choice(["Paid", "Paid", "Pending"]),
                    issue_date=target_date,
                    due_date=target_date + timedelta(days=30)
                )
                db.add(inv)
            
            # 20 Expenses per month
            for _ in range(20):
                exp = Expense(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    department_id=random.choice(departments).id,
                    amount=random.randint(500, 10000),
                    category=random.choice(["Software", "Travel", "Equipment", "Marketing"]),
                    expense_date=target_date
                )
                db.add(exp)

        print("Committing to database...")
        await db.commit()
        print("Seeding completed successfully!")

async def main():
    await recreate_database()
    await seed_data()

if __name__ == "__main__":
    asyncio.run(main())
