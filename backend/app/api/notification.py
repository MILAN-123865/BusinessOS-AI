from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy import desc, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.models.notification import Notification
from app.models.user import User
from app.dependencies.auth import get_current_active_user

router = APIRouter(tags=["Notifications"])


@router.get("/notifications")
async def list_notifications(
    page: int = 1,
    limit: int = 50,
    is_read: Optional[bool] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Notification).where(Notification.user_id == current_user.id)
    if is_read is not None:
        query = query.where(Notification.read == is_read)
    query = query.order_by(desc(Notification.created_at)).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    notifications = result.scalars().all()

    # Total and unread counts
    unread_q = select(Notification).where(Notification.user_id == current_user.id, Notification.read == False)
    unread_res = await db.execute(unread_q)
    unread_count = len(unread_res.scalars().all())

    return {
        "success": True,
        "data": {
            "notifications": [
                {
                    "id": str(n.id),
                    "user_id": str(n.user_id),
                    "type": n.type,
                    "title": n.title,
                    "message": n.description or "",
                    "priority": "Normal",
                    "is_read": n.read,
                    "link_url": None,
                    "metadata": {},
                    "created_at": n.created_at.isoformat() if n.created_at else None
                }
                for n in notifications
            ],
            "total": len(notifications),
            "unread_count": unread_count,
            "page": page,
            "limit": limit
        }
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.read = True
    await db.commit()
    await db.refresh(notif)
    return {
        "success": True,
        "data": {
            "id": str(notif.id),
            "user_id": str(notif.user_id),
            "type": notif.type,
            "title": notif.title,
            "message": notif.description or "",
            "priority": "Normal",
            "is_read": notif.read,
            "created_at": notif.created_at.isoformat() if notif.created_at else None
        }
    }


@router.post("/notifications/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(read=True)
    )
    await db.commit()
    return {"success": True, "message": "All notifications marked as read."}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    await db.delete(notif)
    await db.commit()
    return {"success": True, "message": "Notification deleted."}


@router.get("/notification-preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user)
):
    return {
        "success": True,
        "data": {
            "email_notifications": True,
            "push_notifications": True,
            "sms_notifications": False,
            "in_app_notifications": True,
            "muted_types": [],
            "digest_frequency": "Immediate"
        }
    }


@router.patch("/notification-preferences")
async def update_notification_preferences(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    return {
        "success": True,
        "data": {
            "email_notifications": payload.get("email_notifications", True),
            "push_notifications": payload.get("push_notifications", True),
            "sms_notifications": payload.get("sms_notifications", False),
            "in_app_notifications": payload.get("in_app_notifications", True),
            "muted_types": payload.get("muted_types", []),
            "digest_frequency": payload.get("digest_frequency", "Immediate")
        }
    }
