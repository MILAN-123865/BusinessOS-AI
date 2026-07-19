import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.config.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String(1024), nullable=False)
    file_type = Column(String(50), nullable=False)
    size_bytes = Column(Integer, default=0)
    
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    tags = Column(ARRAY(String), default=[])
    downloads = Column(Integer, default=0)
    version = Column(String(20), default="1.0")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", foreign_keys=[owner_id])
    department = relationship("Department")
