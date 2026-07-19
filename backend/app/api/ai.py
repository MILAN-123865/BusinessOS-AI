from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID, uuid4
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, timezone

from app.dependencies.database import get_db_session
from app.models.ai import AIChatSession, AIMessage
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.client import Client
from app.models.finance import Invoice, Expense
from app.models.document import Document
from app.dependencies.auth import get_current_active_user
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIChatResponseEnvelope,
    AIMessageResponse,
    AIMessageListEnvelope,
    AIChatSessionResponse,
    AIChatSessionListEnvelope
)

router = APIRouter(tags=["AI Assistant"])

def map_message(msg: AIMessage) -> dict:
    return {
        "id": str(msg.id),
        "role": msg.role,
        "content": msg.content,
        "timestamp": msg.created_at.strftime("%I:%M %p")
    }

def map_session(sess: AIChatSession) -> dict:
    return {
        "id": str(sess.id),
        "title": sess.title,
        "createdAt": sess.created_at.isoformat(),
        "updatedAt": sess.updated_at.isoformat()
    }

@router.get("/ai/sessions", response_model=AIChatSessionListEnvelope)
async def list_ai_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
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
    result = await db.execute(
        select(AIChatSession).where(AIChatSession.id == session_id, AIChatSession.user_id == current_user.id)
    )
    session = result.scalar()
    if not session:
        raise HTTPException(status_code=404, detail="AI session not found.")
    
    result_msgs = await db.execute(
        select(AIMessage).where(AIMessage.session_id == session_id).order_by(AIMessage.created_at.asc())
    )
    messages = result_msgs.scalars().all()
    return {
        "success": True,
        "message": "AI messages retrieved successfully.",
        "data": [map_message(m) for m in messages],
        "errors": None
    }

@router.post("/ai/chat", response_model=AIChatResponseEnvelope)
async def send_ai_chat_message(
    payload: AIChatRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    session_id = None
    session = None
    
    if payload.sessionId:
        try:
            session_id = UUID(payload.sessionId)
            result = await db.execute(
                select(AIChatSession).where(AIChatSession.id == session_id, AIChatSession.user_id == current_user.id)
            )
            session = result.scalar()
        except ValueError:
            pass
            
    if not session:
        # Create a new session
        session_id = uuid4()
        title = payload.message[:40] + "..." if len(payload.message) > 40 else payload.message
        session = AIChatSession(
            id=session_id,
            title=title,
            user_id=current_user.id
        )
        db.add(session)
        await db.flush()
    else:
        session.updated_at = datetime.now(timezone.utc)
        session_id = session.id

    # Save user message
    user_msg = AIMessage(
        id=uuid4(),
        session_id=session_id,
        role="user",
        content=payload.message
    )
    db.add(user_msg)
    await db.flush()

    # Generate smart, database-aware response
    message_text = payload.message.lower()
    db_context = ""
    
    # 1. Employees / Users
    if "employee" in message_text or "user" in message_text or "staff" in message_text or "people" in message_text:
        res_emp = await db.execute(select(func.count(User.id)).where(User.is_active == True))
        emp_count = res_emp.scalar() or 0
        db_context += f"• **Employees**: We currently have **{emp_count}** active staff members registered in the organization database.\n"
        
    # 2. Projects
    if "project" in message_text:
        res_proj = await db.execute(select(Project.status, func.count(Project.id)).group_by(Project.status))
        proj_counts = res_proj.all()
        proj_lines = [f"{status}: {count}" for status, count in proj_counts]
        total_p = sum(c[1] for c in proj_counts)
        db_context += f"• **Projects**: We have **{total_p}** projects total. Breakdown: {', '.join(proj_lines)}.\n"
        
    # 3. Tasks
    if "task" in message_text or "todo" in message_text or "to-do" in message_text:
        res_task = await db.execute(select(Task.status, func.count(Task.id)).group_by(Task.status))
        task_counts = res_task.all()
        task_lines = [f"{status}: {count}" for status, count in task_counts]
        total_t = sum(c[1] for c in task_counts)
        db_context += f"• **Tasks**: We have **{total_t}** tasks total. Breakdown: {', '.join(task_lines)}.\n"
        
    # 4. Clients
    if "client" in message_text or "customer" in message_text:
        res_client = await db.execute(select(func.count(Client.id)))
        client_count = res_client.scalar() or 0
        db_context += f"• **Clients**: We have **{client_count}** client profiles linked in our workspace.\n"
        
    # 5. Financials
    if "revenue" in message_text or "finance" in message_text or "profit" in message_text or "expense" in message_text or "invoice" in message_text:
        res_rev = await db.execute(select(func.sum(Invoice.amount)).where(Invoice.status == 'Paid'))
        rev = res_rev.scalar() or 0
        res_exp = await db.execute(select(func.sum(Expense.amount)))
        exp = res_exp.scalar() or 0
        profit = rev - exp
        db_context += f"• **Financials**: Total revenue (paid invoices) is **${rev:,.2f}**, total expenses are **${exp:,.2f}**, resulting in a net profit of **${profit:,.2f}**.\n"
        
    # 6. Documents
    if "document" in message_text or "file" in message_text:
        res_doc = await db.execute(select(func.count(Document.id)))
        doc_count = res_doc.scalar() or 0
        db_context += f"• **Documents**: There are **{doc_count}** files stored in our document library.\n"

    # Construct reply
    if db_context:
        reply_content = (
            f"Here is the real-time business data I retrieved from your database:\n\n"
            f"{db_context}\n"
            f"Let me know if you would like me to analyze these metrics or query anything else!"
        )
    else:
        # Generic greetings or help
        reply_content = (
            f"Hello! I am your Enterprise AI Assistant.\n\n"
            f"I have direct access to your database. You can ask me real-time questions about your organization. "
            f"For example, try asking me:\n"
            f"- *'How many employees and clients do we have?'*\n"
            f"- *'What is our total revenue and profit?'*\n"
            f"- *'Show me our active projects and tasks breakdown.'*\n"
            f"- *'How many documents are stored in the library?'*\n\n"
            f"How can I assist you today?"
        )

    # Save assistant message
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
