from __future__ import annotations
import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, String, Integer, Float, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.config.database import Base
from app.models.base import BaseModel

class Project(Base, BaseModel):
    __tablename__ = "projects"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    project_code: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Planning", server_default="Planning")
    priority: Mapped[str] = mapped_column(String(50), default="Medium", server_default="Medium")
    budget: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    currency: Mapped[str] = mapped_column(String(10), default="USD", server_default="USD")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    estimated_hours: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    actual_hours: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    progress: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    health: Mapped[str] = mapped_column(String(50), default="Good", server_default="Good")
    project_manager_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    client = relationship("Client", lazy="selectin")
    project_manager = relationship("User", foreign_keys=[project_manager_id], lazy="selectin")
    members: Mapped[List["ProjectMember"]] = relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    milestones: Mapped[List["ProjectMilestone"]] = relationship(
        "ProjectMilestone",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

class ProjectMember(Base, BaseModel):
    __tablename__ = "project_members"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)

    project = relationship("Project", back_populates="members", foreign_keys=[project_id])
    user = relationship("User", foreign_keys=[user_id], lazy="selectin")

class ProjectMilestone(Base, BaseModel):
    __tablename__ = "project_milestones"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Pending", server_default="Pending")

    project = relationship("Project", back_populates="milestones", foreign_keys=[project_id])
