from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    price: float
    category: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    organization_id: UUID

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    customer_id: Optional[UUID] = None
    order_number: str
    total_amount: float
    status: str = "Pending"

class OrderCreate(OrderBase):
    organization_id: UUID

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    total_amount: Optional[float] = None

class OrderResponse(OrderBase):
    id: UUID
    organization_id: UUID
    order_date: datetime
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class InventoryBase(BaseModel):
    product_id: UUID
    quantity: int = 0
    location: Optional[str] = None

class InventoryCreate(InventoryBase):
    organization_id: UUID

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    location: Optional[str] = None
    last_restocked: Optional[datetime] = None

class InventoryResponse(InventoryBase):
    id: UUID
    organization_id: UUID
    last_restocked: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AnalyticsDataBase(BaseModel):
    date: date
    daily_sales: float = 0
    revenue: float = 0
    expenses: float = 0
    profit: float = 0
    visitors: int = 0
    conversion_rate: float = 0
    traffic_sources: Dict[str, Any] = Field(default_factory=dict)
    country_statistics: Dict[str, Any] = Field(default_factory=dict)
    device_statistics: Dict[str, Any] = Field(default_factory=dict)

class AnalyticsDataResponse(AnalyticsDataBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProductEnvelope(BaseModel):
    success: bool
    message: str
    data: ProductResponse
    errors: Optional[Any] = None

class ProductListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[ProductResponse]
    errors: Optional[Any] = None

class OrderEnvelope(BaseModel):
    success: bool
    message: str
    data: OrderResponse
    errors: Optional[Any] = None

class OrderListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[OrderResponse]
    errors: Optional[Any] = None

class InventoryEnvelope(BaseModel):
    success: bool
    message: str
    data: InventoryResponse
    errors: Optional[Any] = None

class InventoryListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[InventoryResponse]
    errors: Optional[Any] = None

class AnalyticsListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[AnalyticsDataResponse]
    errors: Optional[Any] = None
