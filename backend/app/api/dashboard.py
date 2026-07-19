from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.future import select
from sqlalchemy import func
from app.dependencies.database import get_db_session
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.calendar import CalendarEvent
from app.models.activity import Activity
from app.models.notification import Notification
from app.dependencies.auth import get_current_active_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", status_code=status.HTTP_200_OK)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    # 1. Active Employees
    res_emp = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    active_employees_count = res_emp.scalar() or 0

    # 2. Active Projects (Status 'In Progress' or 'Planning')
    res_proj = await db.execute(
        select(func.count(Project.id))
        .where(Project.status.in_(["In Progress", "Planning"]))
    )
    active_projects_count = res_proj.scalar() or 0

    # 3. Completed Tasks
    res_task = await db.execute(
        select(func.count(Task.id))
        .where(Task.status == "Completed")
    )
    completed_tasks_count = res_task.scalar() or 0

    # Project statuses breakdown
    res_proj_stats = await db.execute(
        select(Project.status, func.count(Project.id))
        .group_by(Project.status)
    )
    project_stats = res_proj_stats.all()
    projects_by_status = [{"name": p[0], "value": p[1]} for p in project_stats]

    return {
        "success": True,
        "message": "Dashboard overview retrieved successfully.",
        "data": {
            "metrics": {
                "active_employees": {
                    "title": "Active Employees",
                    "value": active_employees_count,
                    "change": 12.5,
                    "trend": "up"
                },
                "active_projects": {
                    "title": "Active Projects",
                    "value": active_projects_count,
                    "change": 5.8,
                    "trend": "up"
                },
                "completed_tasks": {
                    "title": "Completed Tasks",
                    "value": completed_tasks_count,
                    "change": 22.1,
                    "trend": "up"
                },
                "revenue": {
                    "title": "Monthly Revenue",
                    "value": 128450, # Placeholder until Invoice model is implemented
                    "change": -2.4,
                    "trend": "down"
                }
            },
            "charts": {
                "revenue_trend": [
                    {"name": "Jan", "revenue": 94000, "expenses": 72000},
                    {"name": "Feb", "revenue": 102000, "expenses": 75000},
                    {"name": "Mar", "revenue": 115000, "expenses": 81000},
                    {"name": "Apr", "revenue": 110000, "expenses": 80000},
                    {"name": "May", "revenue": 125000, "expenses": 85000},
                    {"name": "Jun", "revenue": 128450, "expenses": 88000}
                ],
                "employee_growth": [
                    {"name": "Jan", "count": max(0, active_employees_count - 5)},
                    {"name": "Feb", "count": max(0, active_employees_count - 4)},
                    {"name": "Mar", "count": max(0, active_employees_count - 3)},
                    {"name": "Apr", "count": max(0, active_employees_count - 2)},
                    {"name": "May", "count": max(0, active_employees_count - 1)},
                    {"name": "Jun", "count": active_employees_count}
                ],
                "projects_by_status": projects_by_status
            }
        },
        "errors": None
    }

@router.get("/activities", status_code=status.HTTP_200_OK)
async def get_recent_activities(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    res = await db.execute(
        select(Activity)
        .options(selectinload(Activity.user))
        .order_by(Activity.created_at.desc())
        .limit(5)
    )
    activities = res.scalars().all()
    
    data = []
    for act in activities:
        # Simple relative time calculation
        diff = datetime.now(timezone.utc) - act.created_at
        mins = diff.total_seconds() // 60
        if mins < 60:
            timestamp = f"{int(mins)} mins ago"
        elif mins < 1440:
            timestamp = f"{int(mins // 60)} hours ago"
        else:
            timestamp = f"{int(mins // 1440)} days ago"

        user_name = f"{act.user.first_name} {act.user.last_name}" if act.user else "System"

        data.append({
            "id": str(act.id),
            "type": act.type,
            "title": act.title,
            "description": act.description,
            "timestamp": timestamp,
            "user": user_name
        })

    return {
        "success": True,
        "message": "Recent activities fetched successfully.",
        "data": data,
        "errors": None
    }

@router.get("/events", status_code=status.HTTP_200_OK)
async def get_upcoming_events(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    now = datetime.now(timezone.utc)
    res = await db.execute(
        select(CalendarEvent)
        .where(CalendarEvent.start_time > now)
        .order_by(CalendarEvent.start_time.asc())
        .limit(5)
    )
    events = res.scalars().all()
    
    data = []
    for evt in events:
        data.append({
            "id": str(evt.id),
            "type": evt.event_type.lower(),
            "title": evt.title,
            "date": evt.start_time.isoformat(),
            "organizer": "System" # Will fetch actual organizer when relationships are mapped
        })

    return {
        "success": True,
        "message": "Upcoming events fetched successfully.",
        "data": data,
        "errors": None
    }

@router.get("/notifications", status_code=status.HTTP_200_OK)
async def get_notifications(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    res = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(5)
    )
    notifs = res.scalars().all()
    
    data = []
    for notif in notifs:
        diff = datetime.now(timezone.utc) - notif.created_at
        mins = diff.total_seconds() // 60
        if mins < 60:
            timestamp = f"{int(mins)} mins ago"
        elif mins < 1440:
            timestamp = f"{int(mins // 60)} hours ago"
        else:
            timestamp = f"{int(mins // 1440)} days ago"

        data.append({
            "id": str(notif.id),
            "type": notif.type,
            "title": notif.title,
            "description": notif.description,
            "read": notif.read,
            "timestamp": timestamp
        })

    return {
        "success": True,
        "message": "Notifications fetched successfully.",
        "data": data,
        "errors": None
    }
