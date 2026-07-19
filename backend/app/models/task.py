from __future__ import annotations
import uuid
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, String, Integer, Float, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.config.database import Base
from app.models.base import BaseModel

class Task(Base, BaseModel):
    __tablename__ = "tasks"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    task_code: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(50), default="Todo", server_default="Todo")
    priority: Mapped[str] = mapped_column(String(50), default="Medium", server_default="Medium")
    estimated_hours: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    progress: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project", lazy="selectin")
    assignee = relationship("User", foreign_keys=[assignee_id], lazy="selectin")
    comments: Mapped[List["TaskComment"]] = relationship(
        "TaskComment",
        back_populates="task",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    subtasks: Mapped[List["TaskSubtask"]] = relationship(
        "TaskSubtask",
        back_populates="task",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

class TaskComment(Base, BaseModel):
    __tablename__ = "task_comments"

    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(String(1000), nullable=False)

    task = relationship("Task", back_populates="comments", foreign_keys=[task_id])
    user = relationship("User", foreign_keys=[user_id], lazy="selectin")

class TaskSubtask(Base, BaseModel):
    __tablename__ = "task_subtasks"

    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    task = relationship("Task", back_populates="subtasks", foreign_keys=[task_id])
