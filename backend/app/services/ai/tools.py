"""
Database Inspection and Action Tools for BusinessOS AI Assistant.
Enables real-time queries and actions against enterprise database models.
"""

from typing import Dict, Any, List, Optional
import uuid
import re
from datetime import datetime, timezone
from sqlalchemy import func, and_, or_, desc, text
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.department import Department
from app.models.role import Role
from app.models.client import Client
from app.models.project import Project
from app.models.task import Task
from app.models.finance import Invoice, Expense
from app.models.document import Document
from app.models.commerce import Product, Inventory, Order
from app.models.organization import Organization


async def tool_get_organization_overview(db: AsyncSession) -> Dict[str, Any]:
    """Retrieve top-level operational and financial KPIs."""
    emp_count = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    dept_count = (await db.execute(select(func.count(Department.id)))).scalar() or 0
    client_count = (await db.execute(select(func.count(Client.id)))).scalar() or 0
    
    # Projects
    proj_total = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    proj_active = (await db.execute(select(func.count(Project.id)).where(Project.status.in_(["In Progress", "Planning", "Active"])))).scalar() or 0
    proj_completed = (await db.execute(select(func.count(Project.id)).where(Project.status == "Completed"))).scalar() or 0

    # Tasks
    task_total = (await db.execute(select(func.count(Task.id)))).scalar() or 0
    task_pending = (await db.execute(select(func.count(Task.id)).where(Task.status.in_(["Todo", "In Progress", "Review"])))).scalar() or 0
    task_done = (await db.execute(select(func.count(Task.id)).where(Task.status == "Completed"))).scalar() or 0

    # Financials
    rev = (await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status == "Paid"))).scalar() or 0.0
    pending_rev = (await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status.in_(["Pending", "Sent"])))).scalar() or 0.0
    exp = (await db.execute(select(func.sum(Expense.amount)))).scalar() or 0.0
    profit = float(rev) - float(exp)

    # Documents & Commerce
    doc_count = (await db.execute(select(func.count(Document.id)))).scalar() or 0
    prod_count = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    inv_total = (await db.execute(select(func.sum(Inventory.quantity)))).scalar() or 0
    order_count = (await db.execute(select(func.count(Order.id)))).scalar() or 0

    return {
        "employees": {"active_count": emp_count, "departments_count": dept_count},
        "clients": {"total_clients": client_count},
        "projects": {"total": proj_total, "active": proj_active, "completed": proj_completed},
        "tasks": {"total": task_total, "open": task_pending, "completed": task_done},
        "financials": {
            "paid_revenue_usd": round(float(rev), 2),
            "pending_invoices_usd": round(float(pending_rev), 2),
            "expenses_usd": round(float(exp), 2),
            "net_profit_usd": round(float(profit), 2),
        },
        "documents": {"count": doc_count},
        "commerce": {
            "products": prod_count,
            "total_units_in_stock": inv_total,
            "total_orders": order_count,
        }
    }


async def tool_execute_readonly_sql(db: AsyncSession, query: str) -> Dict[str, Any]:
    """
    Safely execute a read-only SQL query (SELECT / WITH / PRAGMA) against the live database.
    Rejects any mutation queries (DROP, DELETE, UPDATE, INSERT, ALTER, etc.).
    """
    clean_q = query.strip().rstrip(";")
    lower_q = clean_q.lower()
    
    # Strip leading comments if any
    lower_q = re.sub(r"^/\*.*?\*/", "", lower_q, flags=re.DOTALL).strip()
    lower_q = re.sub(r"^--.*?\n", "", lower_q).strip()

    # Disallow destructive/mutating keywords
    forbidden = ["insert ", "update ", "delete ", "drop ", "alter ", "truncate ", "create ", "replace ", "attach ", "detach ", "grant ", "revoke "]
    for bad in forbidden:
        if bad in lower_q or lower_q.startswith(bad.strip()):
            return {
                "success": False,
                "error": f"Security violation: Query contains mutating statement '{bad.strip().upper()}'. Only read-only queries are permitted.",
                "columns": [],
                "rows": [],
                "row_count": 0
            }

    if not (lower_q.startswith("select") or lower_q.startswith("with") or lower_q.startswith("pragma") or lower_q.startswith("explain")):
        return {
            "success": False,
            "error": "Only read-only SELECT, WITH, PRAGMA, or EXPLAIN queries are permitted.",
            "columns": [],
            "rows": [],
            "row_count": 0
        }

    try:
        result = await db.execute(text(clean_q))
        columns = list(result.keys()) if result.returns_rows else []
        raw_rows = result.fetchmany(50) if result.returns_rows else []
        
        rows = []
        for r in raw_rows:
            row_dict = {}
            for idx, col in enumerate(columns):
                val = r[idx]
                if isinstance(val, (datetime, uuid.UUID)):
                    val = str(val)
                elif hasattr(val, "__float__"):
                    val = float(val)
                row_dict[col] = val
            rows.append(row_dict)

        return {
            "success": True,
            "query": clean_q,
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "is_truncated": len(raw_rows) == 50
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "query": clean_q,
            "columns": [],
            "rows": [],
            "row_count": 0
        }


async def tool_query_clients(
    db: AsyncSession,
    search: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = 15
) -> List[Dict[str, Any]]:
    """Search and inspect enterprise clients and accounts."""
    stmt = select(Client).order_by(Client.company_name.asc()).limit(limit)
    conditions = []
    
    if search:
        search_pattern = f"%{search.strip()}%"
        conditions.append(or_(
            Client.company_name.ilike(search_pattern),
            Client.city.ilike(search_pattern),
            Client.industry.ilike(search_pattern),
            Client.client_code.ilike(search_pattern)
        ))
    if country:
        conditions.append(Client.country.ilike(f"%{country.strip()}%"))
        
    if conditions:
        stmt = select(Client).where(and_(*conditions)).order_by(Client.company_name.asc()).limit(limit)
        
    result = await db.execute(stmt)
    clients = result.scalars().all()
    
    return [
        {
            "id": str(c.id),
            "company_name": c.company_name,
            "client_code": c.client_code,
            "industry": c.industry or "General Commerce",
            "city": c.city or "Unknown",
            "country": c.country or "Global",
            "phone": c.phone or "N/A",
            "email": c.email or "N/A",
            "status": c.status or "Active"
        }
        for c in clients
    ]


async def tool_query_products_inventory(
    db: AsyncSession,
    category: Optional[str] = None,
    low_stock_threshold: Optional[int] = None,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """Query product catalog with pricing, category, and real-time inventory levels."""
    stmt = (
        select(Product, Inventory.quantity, Inventory.location)
        .outerjoin(Inventory, Product.id == Inventory.product_id)
        .order_by(Product.name.asc())
        .limit(limit)
    )
    conditions = []
    if category:
        conditions.append(Product.category.ilike(f"%{category.strip()}%"))
    if low_stock_threshold is not None:
        conditions.append(or_(Inventory.quantity <= low_stock_threshold, Inventory.quantity == None))
        
    if conditions:
        stmt = (
            select(Product, Inventory.quantity, Inventory.location)
            .outerjoin(Inventory, Product.id == Inventory.product_id)
            .where(and_(*conditions))
            .order_by(Product.name.asc())
            .limit(limit)
        )
        
    result = await db.execute(stmt)
    items = result.all()
    
    output = []
    for prod, qty, loc in items:
        stock_qty = qty if qty is not None else 0
        output.append({
            "id": str(prod.id),
            "name": prod.name,
            "sku": prod.sku,
            "category": prod.category or "General",
            "price": float(prod.price) if prod.price else 0.0,
            "stock_quantity": stock_qty,
            "location": loc or "Main Warehouse",
            "is_low_stock": stock_qty <= 15
        })
    return output


async def tool_query_orders(
    db: AsyncSession,
    status_filter: Optional[str] = None,
    limit: int = 15
) -> List[Dict[str, Any]]:
    """List purchase orders with customer names and fulfillment status."""
    stmt = (
        select(Order, Client.company_name)
        .outerjoin(Client, Order.customer_id == Client.id)
        .order_by(desc(Order.order_date))
        .limit(limit)
    )
    if status_filter:
        stmt = (
            select(Order, Client.company_name)
            .outerjoin(Client, Order.customer_id == Client.id)
            .where(func.lower(Order.status) == status_filter.lower())
            .order_by(desc(Order.order_date))
            .limit(limit)
        )
        
    result = await db.execute(stmt)
    orders_data = result.all()
    
    return [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "client_name": client_name or "Direct Client",
            "total_amount": float(o.total_amount) if o.total_amount else 0.0,
            "status": o.status or "Pending",
            "order_date": o.order_date.strftime("%Y-%m-%d") if o.order_date else None
        }
        for o, client_name in orders_data
    ]


async def tool_query_projects(db: AsyncSession, status_filter: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Query projects with budget, deadline, and status."""
    stmt = select(Project).order_by(desc(Project.created_at)).limit(limit)
    if status_filter:
        stmt = select(Project).where(func.lower(Project.status) == status_filter.lower()).order_by(desc(Project.created_at)).limit(limit)
    
    result = await db.execute(stmt)
    projects = result.scalars().all()
    
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "status": p.status,
            "priority": getattr(p, "priority", "Medium"),
            "budget": float(p.budget) if getattr(p, "budget", None) else 0.0,
            "description": p.description or "No description provided"
        }
        for p in projects
    ]


async def tool_query_tasks(db: AsyncSession, status_filter: Optional[str] = None, priority_filter: Optional[str] = None, limit: int = 15) -> List[Dict[str, Any]]:
    """Query tasks with assignees and due dates."""
    stmt = select(Task).order_by(desc(Task.created_at)).limit(limit)
    conditions = []
    if status_filter:
        conditions.append(func.lower(Task.status) == status_filter.lower())
    if priority_filter:
        conditions.append(func.lower(Task.priority) == priority_filter.lower())
    
    if conditions:
        stmt = select(Task).where(and_(*conditions)).order_by(desc(Task.created_at)).limit(limit)
    
    result = await db.execute(stmt)
    tasks = result.scalars().all()
    
    return [
        {
            "id": str(t.id),
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if getattr(t, "due_date", None) else None,
            "description": t.description or ""
        }
        for t in tasks
    ]


async def tool_query_financials(db: AsyncSession) -> Dict[str, Any]:
    """Retrieve detailed financial ledger statistics."""
    paid_inv = (await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status == "Paid"))).scalar() or 0.0
    pending_inv = (await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status.in_(["Pending", "Sent"])))).scalar() or 0.0
    overdue_inv = (await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status == "Overdue"))).scalar() or 0.0
    
    total_exp = (await db.execute(select(func.sum(Expense.amount)))).scalar() or 0.0
    
    recent_inv_stmt = select(Invoice).order_by(desc(Invoice.created_at)).limit(5)
    recent_invoices = (await db.execute(recent_inv_stmt)).scalars().all()

    return {
        "paid_revenue": round(float(paid_inv), 2),
        "pending_revenue": round(float(pending_inv), 2),
        "overdue_revenue": round(float(overdue_inv), 2),
        "total_expenses": round(float(total_exp), 2),
        "net_profit": round(float(paid_inv) - float(total_exp), 2),
        "recent_invoices": [
            {
                "invoice_number": getattr(inv, "invoice_number", f"INV-{str(inv.id)[:6]}"),
                "amount": float(inv.amount),
                "status": inv.status,
            }
            for inv in recent_invoices
        ]
    }


async def tool_query_team(db: AsyncSession, limit: int = 15) -> List[Dict[str, Any]]:
    """Query team members and departments."""
    stmt = (
        select(User, Department.name)
        .outerjoin(Department, User.department_id == Department.id)
        .where(User.is_active == True)
        .limit(limit)
    )
    result = await db.execute(stmt)
    items = result.all()
    
    return [
        {
            "id": str(u.id),
            "name": f"{u.first_name} {u.last_name}",
            "email": u.email,
            "department": dept_name or "General Staff",
            "is_superuser": u.is_superuser
        }
        for u, dept_name in items
    ]


async def tool_create_task(db: AsyncSession, title: str, description: Optional[str] = None, priority: str = "Medium") -> Dict[str, Any]:
    """Create a new task in the database."""
    proj = (await db.execute(select(Project).limit(1))).scalars().first()
    org = (await db.execute(select(Organization).limit(1))).scalars().first()
    user = (await db.execute(select(User).limit(1))).scalars().first()
    
    new_task = Task(
        id=uuid.uuid4(),
        organization_id=org.id if org else (proj.organization_id if proj else uuid.uuid4()),
        project_id=proj.id if proj else uuid.uuid4(),
        title=title,
        description=description or f"Created via BusinessOS AI Copilot on {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        status="Todo",
        priority=priority.capitalize() if priority else "Medium",
        assignee_id=user.id if user else None
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    
    return {
        "success": True,
        "task_id": str(new_task.id),
        "title": new_task.title,
        "status": new_task.status,
        "priority": new_task.priority,
        "message": f"Successfully created task '{new_task.title}' with priority '{new_task.priority}'."
    }


async def tool_search_knowledge_base(query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Search the enterprise knowledge base, SOPs, ISO-27001 policies, HR manuals, and guidelines using semantic RAG retrieval."""
    from app.services.ai.rag_service import rag_service
    results = rag_service.search(query=query, top_k=3, category=category)
    return results

