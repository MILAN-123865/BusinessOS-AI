import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.config.database import Base

class PerformanceReview(Base):
    __tablename__ = "performance_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    score = Column(Integer, nullable=False)
    period = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
