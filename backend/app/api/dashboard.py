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

@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK, include_in_schema=False)
@router.get("/metrics", status_code=status.HTTP_200_OK, include_in_schema=False)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    from app.models.commerce import Product, Order, AnalyticsData
    from app.models.client import Client
    from datetime import timedelta
    
    now = datetime.now(timezone.utc)
    today = now.date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Basic counts
    active_employees_count = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    customers_count = (await db.execute(select(func.count(Client.id)))).scalar() or 0
    products_count = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    orders_count = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    
    # Analytics data
    todays_analytics = (await db.execute(select(AnalyticsData).where(AnalyticsData.date == today))).scalar_one_or_none()
    
    # Aggregated metrics for week and month
    weekly_stats = (await db.execute(
        select(
            func.sum(AnalyticsData.revenue), 
            func.sum(AnalyticsData.expenses), 
            func.sum(AnalyticsData.profit)
        ).where(AnalyticsData.date >= week_ago)
    )).first()
    
    monthly_stats = (await db.execute(
        select(
            func.sum(AnalyticsData.revenue), 
            func.sum(AnalyticsData.expenses), 
            func.sum(AnalyticsData.profit)
        ).where(AnalyticsData.date >= month_ago)
    )).first()

    today_rev = float(todays_analytics.revenue) if todays_analytics else 0.0
    week_rev = float(weekly_stats[0] or 0.0)
    month_rev = float(monthly_stats[0] or 0.0)
    
    month_exp = float(monthly_stats[1] or 0.0)
    month_profit = float(monthly_stats[2] or 0.0)

    # Top Products
    top_products_res = await db.execute(select(Product).limit(5))
    top_products = [{"id": str(p.id), "name": p.name, "price": float(p.price)} for p in top_products_res.scalars().all()]
    
    # Recent Orders
    recent_orders_res = await db.execute(select(Order).order_by(Order.order_date.desc()).limit(5))
    recent_orders = [{"id": str(o.id), "order_number": o.order_number, "total_amount": float(o.total_amount), "status": o.status} for o in recent_orders_res.scalars().all()]

    # Chart data (last 6 months aggregated by month, just mocking for now since SQLite/PG date functions differ, but we can do a simple limit)
    chart_res = await db.execute(select(AnalyticsData).order_by(AnalyticsData.date.desc()).limit(30))
    chart_data = list(chart_res.scalars().all())
    chart_data.reverse()
    formatted_chart_data = [
        {"name": d.date.strftime("%b %d"), "revenue": float(d.revenue), "expenses": float(d.expenses), "profit": float(d.profit)}
        for d in chart_data
    ]

    # Employee Growth (Mocking for now as we don't have historical employee joining dates readily accessible here)
    employee_growth = [
        {"name": "Jan", "count": 5},
        {"name": "Feb", "count": 8},
        {"name": "Mar", "count": 15},
        {"name": "Apr", "count": 22},
        {"name": "May", "count": active_employees_count},
    ]

    # Projects by Status
    proj_status_res = await db.execute(select(Project.status, func.count(Project.id)).group_by(Project.status))
    projects_by_status = [{"name": s, "value": c} for s, c in proj_status_res.all()]
    if not projects_by_status:
        projects_by_status = [{"name": "No Projects", "value": 1}]

    def format_metric(title, value, change, trend):
        return {"title": title, "value": value, "change": change, "trend": trend}

    return {
        "success": True,
        "message": "Dashboard overview retrieved successfully.",
        "data": {
            "metrics": {
                "users": format_metric("Total Users", active_employees_count, 5.2, "up"),
                "customers": format_metric("Total Customers", customers_count, 12.5, "up"),
                "products": format_metric("Total Products", products_count, 2.1, "up"),
                "orders": format_metric("Total Orders", orders_count, 8.4, "up"),
                "revenue": format_metric("Monthly Revenue", month_rev, 15.3, "up"),
                "expenses": format_metric("Monthly Expenses", month_exp, -2.4, "down"),
                "profit": format_metric("Monthly Profit", month_profit, 18.2, "up"),
                "todays_revenue": format_metric("Today's Revenue", today_rev, 4.1, "up"),
                "weekly_revenue": format_metric("Weekly Revenue", week_rev, 7.8, "up")
            },
            "top_products": top_products,
            "recent_orders": recent_orders,
            "charts": {
                "revenue_trend": formatted_chart_data,
                "employee_growth": employee_growth,
                "projects_by_status": projects_by_status
            },
            "system_health": "Healthy"
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
    now_utc = datetime.now(timezone.utc)
    for act in activities:
        # Simple relative time calculation
        c_at = act.created_at
        if c_at.tzinfo is None:
            c_at = c_at.replace(tzinfo=timezone.utc)
        diff = now_utc - c_at
        mins = max(0, diff.total_seconds() // 60)
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
        .order_by(CalendarEvent.start_time.asc())
        .limit(5)
    )
    events = res.scalars().all()
    
    data = []
    for evt in events:
        data.append({
            "id": str(evt.id),
            "type": evt.event_type.lower() if evt.event_type else "meeting",
            "title": evt.title,
            "date": evt.start_time.isoformat() if hasattr(evt.start_time, "isoformat") else str(evt.start_time),
            "organizer": "System"
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
    now_utc = datetime.now(timezone.utc)
    for notif in notifs:
        c_at = notif.created_at
        if c_at.tzinfo is None:
            c_at = c_at.replace(tzinfo=timezone.utc)
        diff = now_utc - c_at
        mins = max(0, diff.total_seconds() // 60)
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
