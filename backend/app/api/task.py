from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy import desc, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.task import Task, TaskComment, TaskSubtask
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskEnvelope,
    TaskListEnvelope,
    CommentCreate,
    CommentResponse,
    CommentEnvelope,
    CommentListEnvelope,
    SubtaskCreate,
    SubtaskUpdate,
    SubtaskResponse,
    SubtaskEnvelope,
    SubtaskListEnvelope,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=TaskListEnvelope)
async def list_tasks(
    limit: Optional[int] = 200,
    offset: Optional[int] = 0,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    try:
        stmt = (
            select(Task)
            .where(Task.organization_id == current_user.organization_id)
            .order_by(desc(Task.created_at))
            .options(
                selectinload(Task.project),
                selectinload(Task.assignee),
                selectinload(Task.comments).selectinload(TaskComment.user),
                selectinload(Task.subtasks)
            )
        )
        if status_filter and status_filter.lower() != "all":
            stmt = stmt.where(func.lower(Task.status) == status_filter.lower())
        if limit:
            stmt = stmt.limit(limit).offset(offset or 0)

        result = await db.execute(stmt)
        tasks = result.scalars().all()
        return {
            "success": True,
            "message": "Tasks retrieved successfully.",
            "data": [TaskResponse.model_validate(t) for t in tasks],
            "errors": None
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing tasks: {str(e)}"
        )

@router.get("/{task_id}", response_model=TaskEnvelope)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .options(
            selectinload(Task.project),
            selectinload(Task.assignee),
            selectinload(Task.comments).selectinload(TaskComment.user),
            selectinload(Task.subtasks)
        )
    )
    task = result.scalar()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return {
        "success": True,
        "message": "Task retrieved successfully.",
        "data": TaskResponse.model_validate(task),
        "errors": None
    }

@router.post("", response_model=TaskEnvelope, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    task = Task(
        organization_id=payload.organization_id,
        project_id=payload.project_id,
        task_code=payload.task_code,
        title=payload.title,
        description=payload.description,
        assignee_id=payload.assignee_id,
        status=payload.status,
        priority=payload.priority,
        estimated_hours=payload.estimated_hours,
        actual_hours=payload.actual_hours,
        progress=payload.progress,
        start_date=payload.start_date,
        due_date=payload.due_date,
        completed_at=payload.completed_at,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    result = await db.execute(
        select(Task)
        .where(Task.id == task.id)
        .options(
            selectinload(Task.project),
            selectinload(Task.assignee),
            selectinload(Task.comments).selectinload(TaskComment.user),
            selectinload(Task.subtasks)
        )
    )
    task = result.scalar()
    
    return {
        "success": True,
        "message": "Task created successfully.",
        "data": TaskResponse.model_validate(task),
        "errors": None
    }

@router.patch("/{task_id}", response_model=TaskEnvelope)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .options(
            selectinload(Task.project),
            selectinload(Task.assignee),
            selectinload(Task.comments).selectinload(TaskComment.user),
            selectinload(Task.subtasks)
        )
    )
    task = result.scalar()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
        
    await db.commit()
    await db.refresh(task)
    
    return {
        "success": True,
        "message": "Task updated successfully.",
        "data": TaskResponse.model_validate(task),
        "errors": None
    }

@router.delete("/{task_id}", response_model=TaskEnvelope)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .options(
            selectinload(Task.project),
            selectinload(Task.assignee),
            selectinload(Task.comments).selectinload(TaskComment.user),
            selectinload(Task.subtasks)
        )
    )
    task = result.scalar()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
        
    response_data = TaskResponse.model_validate(task)
    await db.delete(task)
    await db.commit()
    
    return {
        "success": True,
        "message": "Task deleted successfully.",
        "data": response_data,
        "errors": None
    }

# Comments management
@router.get("/{task_id}/comments", response_model=CommentListEnvelope)
async def list_task_comments(
    task_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(TaskComment)
        .where(TaskComment.task_id == task_id)
        .options(selectinload(TaskComment.user))
    )
    comments = result.scalars().all()
    return {
        "success": True,
        "message": "Task comments retrieved successfully.",
        "data": [CommentResponse.model_validate(c) for c in comments],
        "errors": None
    }

@router.post("/{task_id}/comments", response_model=CommentEnvelope, status_code=status.HTTP_201_CREATED)
async def create_task_comment(
    task_id: UUID,
    payload: CommentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    comment = TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        content=payload.content,
    )
    db.add(comment)
    await db.commit()
    
    result = await db.execute(
        select(TaskComment).where(TaskComment.id == comment.id).options(selectinload(TaskComment.user))
    )
    comment = result.scalar()
    
    return {
        "success": True,
        "message": "Task comment created successfully.",
        "data": CommentResponse.model_validate(comment),
        "errors": None
    }

@router.delete("/{task_id}/comments/{comment_id}", response_model=CommentEnvelope)
async def delete_task_comment(
    task_id: UUID,
    comment_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(TaskComment)
        .where(TaskComment.id == comment_id, TaskComment.task_id == task_id)
        .options(selectinload(TaskComment.user))
    )
    comment = result.scalar()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")
        
    response_data = CommentResponse.model_validate(comment)
    await db.delete(comment)
    await db.commit()
    
    return {
        "success": True,
        "message": "Comment deleted successfully.",
        "data": response_data,
        "errors": None
    }

# Subtasks management
@router.get("/{task_id}/subtasks", response_model=SubtaskListEnvelope)
async def list_task_subtasks(
    task_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(TaskSubtask).where(TaskSubtask.task_id == task_id))
    subtasks = result.scalars().all()
    return {
        "success": True,
        "message": "Subtasks retrieved successfully.",
        "data": [SubtaskResponse.model_validate(s) for s in subtasks],
        "errors": None
    }

@router.post("/{task_id}/subtasks", response_model=SubtaskEnvelope, status_code=status.HTTP_201_CREATED)
async def create_task_subtask(
    task_id: UUID,
    payload: SubtaskCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    subtask = TaskSubtask(
        task_id=task_id,
        title=payload.title,
        is_completed=payload.is_completed,
    )
    db.add(subtask)
    await db.commit()
    await db.refresh(subtask)
    
    return {
        "success": True,
        "message": "Subtask created successfully.",
        "data": SubtaskResponse.model_validate(subtask),
        "errors": None
    }

@router.patch("/{task_id}/subtasks/{subtask_id}", response_model=SubtaskEnvelope)
async def update_task_subtask(
    task_id: UUID,
    subtask_id: UUID,
    payload: SubtaskUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(TaskSubtask)
        .where(TaskSubtask.id == subtask_id, TaskSubtask.task_id == task_id)
    )
    subtask = result.scalar()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found.")
        
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(subtask, field, value)
        
    await db.commit()
    await db.refresh(subtask)
    
    return {
        "success": True,
        "message": "Subtask updated successfully.",
        "data": SubtaskResponse.model_validate(subtask),
        "errors": None
    }

@router.delete("/{task_id}/subtasks/{subtask_id}", response_model=SubtaskEnvelope)
async def delete_task_subtask(
    task_id: UUID,
    subtask_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(TaskSubtask)
        .where(TaskSubtask.id == subtask_id, TaskSubtask.task_id == task_id)
    )
    subtask = result.scalar()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found.")
        
    response_data = SubtaskResponse.model_validate(subtask)
    await db.delete(subtask)
    await db.commit()
    
    return {
        "success": True,
        "message": "Subtask deleted successfully.",
        "data": response_data,
        "errors": None
    }
