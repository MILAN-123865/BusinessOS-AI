from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.future import select
from sqlalchemy import func
from app.dependencies.database import get_db_session
from app.models.user import User
from app.models.task import Task
from app.models.finance import Invoice, Expense
from app.dependencies.auth import get_current_active_user
from sqlalchemy.ext.asyncio import AsyncSession
import calendar

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", status_code=status.HTTP_200_OK)
async def get_analytics_data(
    period: str = Query("month", description="month, quarter, year, all_time"),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    from app.models.commerce import AnalyticsData
    
    now = datetime.now(timezone.utc)
    today = now.date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Get today's stats
    today_stats = (await db.execute(select(AnalyticsData).where(AnalyticsData.date == today))).scalar_one_or_none()
    
    # Get weekly stats
    weekly_stats = (await db.execute(
        select(
            func.sum(AnalyticsData.daily_sales),
            func.sum(AnalyticsData.revenue), 
            func.sum(AnalyticsData.expenses), 
            func.sum(AnalyticsData.profit)
        ).where(AnalyticsData.date >= week_ago)
    )).first()

    # Get monthly stats
    monthly_stats = (await db.execute(
        select(
            func.sum(AnalyticsData.daily_sales),
            func.sum(AnalyticsData.revenue), 
            func.sum(AnalyticsData.expenses), 
            func.sum(AnalyticsData.profit),
            func.sum(AnalyticsData.visitors)
        ).where(AnalyticsData.date >= month_ago)
    )).first()

    # Get latest traffic, country, device stats (or merge them, but let's just grab the latest)
    latest_stats = (await db.execute(select(AnalyticsData).order_by(AnalyticsData.date.desc()).limit(1))).scalar_one_or_none()
    
    chart_res = await db.execute(select(AnalyticsData).order_by(AnalyticsData.date.desc()).limit(30))
    chart_data = list(chart_res.scalars().all())
    chart_data.reverse()
    formatted_chart_data = [
        {"name": d.date.strftime("%b %d"), "revenue": float(d.revenue), "expenses": float(d.expenses), "profit": float(d.profit)}
        for d in chart_data
    ]

    return {
        "success": True,
        "message": "Analytics fetched successfully.",
        "data": {
            "daily_sales": float(today_stats.daily_sales) if today_stats else 0,
            "weekly_sales": float(weekly_stats[0] or 0),
            "monthly_sales": float(monthly_stats[0] or 0),
            "revenue": float(monthly_stats[1] or 0),
            "expenses": float(monthly_stats[2] or 0),
            "profit": float(monthly_stats[3] or 0),
            "visitors": int(monthly_stats[4] or 0),
            "conversion_rate": float(latest_stats.conversion_rate) if latest_stats else 0.0,
            "traffic_sources": latest_stats.traffic_sources if latest_stats else {},
            "country_statistics": latest_stats.country_statistics if latest_stats else {},
            "device_statistics": latest_stats.device_statistics if latest_stats else {},
            "charts_data": formatted_chart_data
        },
        "errors": None
    }
