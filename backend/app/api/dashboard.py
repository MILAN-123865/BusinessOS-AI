from fastapi import APIRouter, Depends, status
from sqlalchemy.future import select
from sqlalchemy import func
from app.dependencies.database import get_db_session
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", status_code=status.HTTP_200_OK)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    # Query database to count active users dynamically
    result = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    active_employees_count = result.scalar() or 0

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
                    "value": 18,
                    "change": 5.8,
                    "trend": "up"
                },
                "completed_tasks": {
                    "title": "Completed Tasks",
                    "value": 142,
                    "change": 22.1,
                    "trend": "up"
                },
                "revenue": {
                    "title": "Monthly Revenue",
                    "value": 128450,
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
                "projects_by_status": [
                    {"name": "Planning", "value": 4},
                    {"name": "In Progress", "value": 10},
                    {"name": "Review", "value": 3},
                    {"name": "Completed", "value": 5}
                ]
            }
        },
        "errors": None
    }

@router.get("/activities", status_code=status.HTTP_200_OK)
async def get_recent_activities(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    return {
        "success": True,
        "message": "Recent activities fetched successfully.",
        "data": [
            {
                "id": "act-1",
                "type": "project",
                "title": "New project initiated",
                "description": "Project 'Core OS Integration' was initialized by HR Division.",
                "timestamp": "10 minutes ago",
                "user": "Sarah Connor"
            },
            {
                "id": "act-2",
                "type": "employee",
                "title": "New employee onboarded",
                "description": "David Miller joined the Frontend Dev Team.",
                "timestamp": "2 hours ago",
                "user": "Admin System"
            },
            {
                "id": "act-3",
                "type": "task",
                "title": "Milestone completed",
                "description": "Task 'Sprint 4 Deployment' was marked completed.",
                "timestamp": "5 hours ago",
                "user": "Alex Mercer"
            }
        ],
        "errors": None
    }

@router.get("/events", status_code=status.HTTP_200_OK)
async def get_upcoming_events(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    return {
        "success": True,
        "message": "Upcoming events fetched successfully.",
        "data": [
            {
                "id": "evt-1",
                "type": "meeting",
                "title": "Q3 Planning Session",
                "date": "2026-07-20T10:00:00",
                "organizer": "Jane Doe"
            },
            {
                "id": "evt-2",
                "type": "review",
                "title": "Performance Reviews",
                "date": "2026-07-22T14:00:00",
                "organizer": "HR Department"
            },
            {
                "id": "evt-3",
                "type": "presentation",
                "title": "AI Assistant Demo",
                "date": "2026-07-25T11:00:00",
                "organizer": "Product Team"
            }
        ],
        "errors": None
    }

@router.get("/notifications", status_code=status.HTTP_200_OK)
async def get_notifications(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    return {
        "success": True,
        "message": "Notifications fetched successfully.",
        "data": [
            {
                "id": "notif-1",
                "type": "success",
                "title": "Deployment Successful",
                "description": "Production environment v1.0.2 is live.",
                "read": False,
                "timestamp": "15 mins ago"
            },
            {
                "id": "notif-2",
                "type": "warning",
                "title": "Pending Invitations",
                "description": "3 pending invitations require review.",
                "read": False,
                "timestamp": "1 hour ago"
            },
            {
                "id": "notif-3",
                "type": "info",
                "title": "System Alert",
                "description": "Daily snapshot backup completed successfully.",
                "read": True,
                "timestamp": "Yesterday"
            }
        ],
        "errors": None
    }
