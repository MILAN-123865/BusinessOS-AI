import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric, Boolean, Date, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.config.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    sku = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True) # Mapping Customer to existing Client
    order_number = Column(String(50), nullable=False, unique=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="Pending") # Pending, Processing, Shipped, Delivered, Cancelled
    order_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    customer = relationship("Client")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, unique=True)
    quantity = Column(Integer, default=0, nullable=False)
    location = Column(String(100), nullable=True)
    last_restocked = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product")

class AnalyticsData(Base):
    __tablename__ = "analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    
    daily_sales = Column(Numeric(12, 2), default=0)
    revenue = Column(Numeric(12, 2), default=0)
    expenses = Column(Numeric(12, 2), default=0)
    profit = Column(Numeric(12, 2), default=0)
    
    visitors = Column(Integer, default=0)
    conversion_rate = Column(Numeric(5, 2), default=0) # percentage
    
    traffic_sources = Column(JSON, default=lambda: {}) # {"organic": 40, "direct": 30, "social": 30}
    country_statistics = Column(JSON, default=lambda: {}) # {"USA": 500, "UK": 200}
    device_statistics = Column(JSON, default=lambda: {}) # {"Desktop": 60, "Mobile": 40}

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
