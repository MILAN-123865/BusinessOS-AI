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
    
    # Simple Period filtering (for demonstration, we'll calculate 12 months chart anyway)
    # 1. Total Revenue (sum of all paid invoices)
    res_rev = await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status == 'Paid'))
    total_revenue = res_rev.scalar() or 0

    # 2. Total Expenses
    res_exp = await db.execute(select(func.sum(Expense.amount)))
    total_expenses = res_exp.scalar() or 0

    # 3. Employee Growth
    res_emp = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    total_employees = res_emp.scalar() or 0

    # 4. Task Completion Rate
    res_tasks_total = await db.execute(select(func.count(Task.id)))
    tasks_total = res_tasks_total.scalar() or 1
    res_tasks_done = await db.execute(select(func.count(Task.id)).where(Task.status == 'Completed'))
    tasks_done = res_tasks_done.scalar() or 0
    task_completion = round((tasks_done / tasks_total) * 100) if tasks_total > 0 else 0

    # Monthly chart data (Last 6 months)
    chart_data = []
    today = datetime.now(timezone.utc)
    for i in range(5, -1, -1):
        target_date = today - timedelta(days=i * 30)
        start_of_month = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_of_month = start_of_month.replace(
            day=calendar.monthrange(start_of_month.year, start_of_month.month)[1],
            hour=23, minute=59, second=59
        )
        
        # Revenue for month
        rev_m = await db.execute(
            select(func.sum(Invoice.amount))
            .where(Invoice.status == 'Paid')
            .where(Invoice.issue_date >= start_of_month.date())
            .where(Invoice.issue_date <= end_of_month.date())
        )
        rm = rev_m.scalar() or 0
        
        # Expenses for month
        exp_m = await db.execute(
            select(func.sum(Expense.amount))
            .where(Expense.expense_date >= start_of_month.date())
            .where(Expense.expense_date <= end_of_month.date())
        )
        em = exp_m.scalar() or 0

        month_name = start_of_month.strftime("%b")
        chart_data.append({
            "month": month_name,
            "revenue": float(rm),
            "expenses": float(em),
            "profit": float(rm - em)
        })

    # Task Distribution
    res_dist = await db.execute(
        select(Task.status, func.count(Task.id)).group_by(Task.status)
    )
    task_dist = res_dist.all()
    
    status_colors = {
        "To Do": "#ef4444",
        "In Progress": "#f59e0b",
        "Review": "#3b82f6",
        "Completed": "#10b981"
    }
    
    distribution_data = []
    for t_status, t_count in task_dist:
        distribution_data.append({
            "name": t_status,
            "value": round((t_count / tasks_total) * 100) if tasks_total > 0 else 0,
            "fill": status_colors.get(t_status, "#8884d8")
        })

    return {
        "success": True,
        "message": "Analytics fetched successfully.",
        "data": {
            "kpis": [
                {
                    "label": "Total Revenue",
                    "value": f"${total_revenue:,.0f}",
                    "change": "+12.5%", # Hardcoded change for now
                    "trend": "up"
                },
                {
                    "label": "Active Employees",
                    "value": str(total_employees),
                    "change": "+5.2%",
                    "trend": "up"
                },
                {
                    "label": "Task Completion",
                    "value": f"{task_completion}%",
                    "change": "+2.1%",
                    "trend": "up"
                },
                {
                    "label": "Net Profit",
                    "value": f"${(total_revenue - total_expenses):,.0f}",
                    "change": "-1.4%",
                    "trend": "down"
                }
            ],
            "chartData": chart_data,
            "taskDistribution": distribution_data
        }
    }
