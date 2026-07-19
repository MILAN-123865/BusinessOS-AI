import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.config.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    
    invoice_number = Column(String(50), nullable=False, unique=True)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="Pending")
    issue_date = Column(Date, default=date.today, nullable=False)
    due_date = Column(Date, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("Client")
    project = relationship("Project")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(500), nullable=True)
    expense_date = Column(Date, default=date.today, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    department = relationship("Department")
    user = relationship("User")
