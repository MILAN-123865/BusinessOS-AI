import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.config.database import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    leave_type = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String(500), nullable=True)
    status = Column(String(20), default="Pending")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="leave_requests")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    date = Column(Date, default=date.today, nullable=False)
    status = Column(String(20), nullable=False)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="attendance_records")
