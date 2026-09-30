import logging
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.dependencies.auth import get_current_active_user
from app.models.ai import AIChatSession, AIMessage
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIChatResponseEnvelope,
    AIMessageResponse,
    AIMessageListEnvelope,
    AIChatSessionResponse,
    AIChatSessionListEnvelope,
)
from app.services.ai.llm_service import generate_ai_response

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI Assistant"])


def map_message(msg: AIMessage) -> dict:
    return {
        "id": str(msg.id),
        "role": msg.role,
        "content": msg.content,
        "timestamp": msg.created_at.strftime("%I:%M %p") if msg.created_at else datetime.now().strftime("%I:%M %p")
    }


def map_session(sess: AIChatSession) -> dict:
    return {
        "id": str(sess.id),
        "title": sess.title,
        "createdAt": sess.created_at.isoformat() if sess.created_at else datetime.now().isoformat(),
        "updatedAt": sess.updated_at.isoformat() if sess.updated_at else datetime.now().isoformat()
    }


@router.get("/ai/sessions", response_model=AIChatSessionListEnvelope)
async def list_ai_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Retrieve all conversational chat sessions for the logged-in user."""
    result = await db.execute(
        select(AIChatSession)
        .where(AIChatSession.user_id == current_user.id)
        .order_by(AIChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    return {
        "success": True,
        "message": "AI Chat sessions retrieved successfully.",
        "data": [map_session(s) for s in sessions],
        "errors": None
    }


@router.get("/ai/chat/{session_id}", response_model=AIMessageListEnvelope)
async def get_ai_chat_history(
    session_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Retrieve full message history for a given session."""
    result = await db.execute(
        select(AIChatSession).where(
            AIChatSession.id == session_id,
            AIChatSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI session not found or unauthorized."
        )

    result_msgs = await db.execute(
        select(AIMessage)
        .where(AIMessage.session_id == session_id)
        .order_by(AIMessage.created_at.asc())
    )
    messages = result_msgs.scalars().all()
    return {
        "success": True,
        "message": "AI messages retrieved successfully.",
        "data": [map_message(m) for m in messages],
        "errors": None
    }


@router.delete("/ai/sessions/{session_id}")
async def delete_ai_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Delete a conversation session and all its messages."""
    result = await db.execute(
        select(AIChatSession).where(
            AIChatSession.id == session_id,
            AIChatSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI session not found."
        )

    await db.delete(session)
    await db.commit()

    return {
        "success": True,
        "message": "AI Chat session deleted successfully.",
        "data": {"sessionId": str(session_id)},
        "errors": None
    }


@router.post("/ai/chat", response_model=AIChatResponseEnvelope)
async def send_ai_chat_message(
    payload: AIChatRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Send a prompt to the AI Copilot with multi-turn history and smart tool calling."""
    session = None
    session_id = None

    if payload.sessionId:
        try:
            parsed_id = UUID(payload.sessionId)
            res = await db.execute(
                select(AIChatSession).where(
                    AIChatSession.id == parsed_id,
                    AIChatSession.user_id == current_user.id
                )
            )
            session = res.scalar_one_or_none()
        except (ValueError, TypeError):
            pass

    if not session:
        # Create a new session
        session_id = uuid4()
        clean_title = payload.message.strip()
        title = (clean_title[:38] + "...") if len(clean_title) > 38 else clean_title
        session = AIChatSession(
            id=session_id,
            title=title or "New Workspace Conversation",
            user_id=current_user.id
        )
        db.add(session)
        await db.flush()
    else:
        session.updated_at = datetime.now(timezone.utc)
        session_id = session.id

    # 1. Save user message to database
    user_msg = AIMessage(
        id=uuid4(),
        session_id=session_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    await db.flush()

    # 2. Fetch conversation history for context (up to last 10 messages)
    history_res = await db.execute(
        select(AIMessage)
        .where(AIMessage.session_id == session_id)
        .order_by(AIMessage.created_at.desc())
        .limit(10)
    )
    history_records = list(reversed(history_res.scalars().all()))
    formatted_messages = [
        {"role": m.role, "content": m.content}
        for m in history_records
    ]

    # 3. Generate smart, database-aware response via LLM service
    try:
        reply_content = await generate_ai_response(
            messages=formatted_messages,
            db=db,
            user_message=payload.message
        )
    except Exception as e:
        logger.error(f"Error during AI response generation: {e}", exc_info=True)
        reply_content = f"⚠️ An unexpected error occurred while processing your request: {str(e)}"

    # 4. Save assistant response
    asst_msg = AIMessage(
        id=uuid4(),
        session_id=session_id,
        role="assistant",
        content=reply_content
    )
    db.add(asst_msg)

    await db.commit()
    await db.refresh(asst_msg)

    return {
        "success": True,
        "message": "AI assistant response generated successfully.",
        "data": {
            "message": map_message(asst_msg),
            "sessionId": str(session_id)
        },
        "errors": None
    }
