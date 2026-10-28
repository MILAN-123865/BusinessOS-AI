from fastapi import APIRouter, Depends, Query, Response
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.models.activity import Activity
from app.models.user import User
from app.dependencies.auth import get_current_active_user

router = APIRouter(tags=["Audit Logs"])


@router.get("/audit-logs")
async def list_audit_logs(
    page: int = 1,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Activity).options(selectinload(Activity.user))
    if current_user.organization_id:
        query = query.where(Activity.organization_id == current_user.organization_id)
    query = query.order_by(desc(Activity.created_at)).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    activities = result.scalars().all()

    logs = [
        {
            "id": str(a.id),
            "user_id": str(a.user_id),
            "user_name": f"{a.user.first_name} {a.user.last_name}" if a.user else "System",
            "user_email": a.user.email if a.user else "system@businessos.internal",
            "action": a.type,
            "entity_type": a.type.split("_")[0] if "_" in a.type else "System",
            "entity_id": str(a.id),
            "description": a.description or a.title,
            "ip_address": "127.0.0.1",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "timestamp": a.created_at.isoformat() if a.created_at else datetime.now(timezone.utc).isoformat()
        }
        for a in activities
    ]

    return {
        "success": True,
        "data": {
            "logs": logs,
            "total": len(logs),
            "page": page,
            "limit": limit
        }
    }


@router.get("/audit-logs/export")
async def export_audit_logs(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    csv_content = "Timestamp,User,Action,Description,IP\n"
    query = select(Activity).options(selectinload(Activity.user)).order_by(desc(Activity.created_at)).limit(100)
    result = await db.execute(query)
    for a in result.scalars().all():
        u = f"{a.user.first_name} {a.user.last_name}" if a.user else "System"
        ts = a.created_at.isoformat() if a.created_at else ""
        csv_content += f'"{ts}","{u}","{a.type}","{a.description or a.title}","127.0.0.1"\n'

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit-logs.csv"}
    )
