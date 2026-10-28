from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.models.client import Client
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.models.document import Document
from app.dependencies.auth import get_current_active_user

router = APIRouter(tags=["Search"])

_recent_searches: List[Dict[str, Any]] = [
    {"id": "s-1", "user_id": "u-1", "query": "Northwind", "timestamp": "2026-10-28T12:00:00Z"},
    {"id": "s-2", "user_id": "u-1", "query": "Architecture", "timestamp": "2026-10-28T12:30:00Z"}
]


@router.get("/search")
async def global_search(
    q: str = Query("", description="Search term"),
    types: Optional[str] = Query(None, description="Comma-separated entity types"),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    if not q or len(q.strip()) < 2:
        return {"success": True, "data": {"results": [], "total": 0}}

    results = []
    term = f"%{q.strip()}%"

    # Search Clients
    c_res = await db.execute(select(Client).where(Client.company_name.ilike(term)).limit(5))
    for c in c_res.scalars().all():
        results.append({
            "id": str(c.id),
            "type": "client",
            "title": c.company_name,
            "subtitle": c.industry or "Client",
            "url": f"/clients/{c.id}"
        })

    # Search Projects
    p_res = await db.execute(select(Project).where(Project.name.ilike(term)).limit(5))
    for p in p_res.scalars().all():
        results.append({
            "id": str(p.id),
            "type": "project",
            "title": p.name,
            "subtitle": f"{p.status} • {p.priority}",
            "url": f"/projects"
        })

    # Search Tasks
    t_res = await db.execute(select(Task).where(Task.title.ilike(term)).limit(5))
    for t in t_res.scalars().all():
        results.append({
            "id": str(t.id),
            "type": "task",
            "title": t.title,
            "subtitle": f"{t.status} • {t.priority}",
            "url": f"/tasks"
        })

    # Search Users / Employees
    u_res = await db.execute(
        select(User).where(or_(User.first_name.ilike(term), User.last_name.ilike(term), User.email.ilike(term))).limit(5)
    )
    for u in u_res.scalars().all():
        results.append({
            "id": str(u.id),
            "type": "employee",
            "title": f"{u.first_name} {u.last_name}",
            "subtitle": u.email,
            "url": f"/employees"
        })

    return {
        "success": True,
        "data": {
            "results": results,
            "total": len(results)
        }
    }


@router.get("/search/recent")
async def get_recent_searches(
    current_user: User = Depends(get_current_active_user)
):
    return {"success": True, "data": _recent_searches}


@router.delete("/search/recent")
async def clear_recent_searches(
    current_user: User = Depends(get_current_active_user)
):
    global _recent_searches
    _recent_searches = []
    return {"success": True, "message": "Recent searches cleared."}
