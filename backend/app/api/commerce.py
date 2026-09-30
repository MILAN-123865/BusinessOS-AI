from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db_session
from app.models.commerce import Product, Order, Inventory
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.commerce import (
    ProductCreate, ProductUpdate, ProductEnvelope, ProductListEnvelope,
    OrderCreate, OrderUpdate, OrderEnvelope, OrderListEnvelope,
    InventoryCreate, InventoryUpdate, InventoryEnvelope, InventoryListEnvelope
)
from pydantic import TypeAdapter

router = APIRouter(tags=["Commerce"])

# --- Products ---
@router.get("/products", response_model=ProductListEnvelope)
async def list_products(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Product).where(Product.organization_id == current_user.organization_id)
    )
    products = result.scalars().all()
    return {
        "success": True,
        "message": "Products retrieved successfully.",
        "data": products,
        "errors": None
    }

@router.get("/products/{product_id}", response_model=ProductEnvelope)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return {
        "success": True,
        "message": "Product retrieved successfully.",
        "data": product,
        "errors": None
    }

@router.post("/products", response_model=ProductEnvelope, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    product = Product(**payload.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return {
        "success": True,
        "message": "Product created successfully.",
        "data": product,
        "errors": None
    }

@router.patch("/products/{product_id}", response_model=ProductEnvelope)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
        
    await db.commit()
    await db.refresh(product)
    return {
        "success": True,
        "message": "Product updated successfully.",
        "data": product,
        "errors": None
    }

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    await db.delete(product)
    await db.commit()
    return {"success": True, "message": "Product deleted successfully."}

# --- Orders ---
@router.get("/orders", response_model=OrderListEnvelope)
async def list_orders(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Order).where(Order.organization_id == current_user.organization_id)
    )
    orders = result.scalars().all()
    return {
        "success": True,
        "message": "Orders retrieved successfully.",
        "data": orders,
        "errors": None
    }

@router.get("/orders/{order_id}", response_model=OrderEnvelope)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return {
        "success": True,
        "message": "Order retrieved successfully.",
        "data": order,
        "errors": None
    }

@router.post("/orders", response_model=OrderEnvelope, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    order = Order(**payload.model_dump())
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return {
        "success": True,
        "message": "Order created successfully.",
        "data": order,
        "errors": None
    }

@router.patch("/orders/{order_id}", response_model=OrderEnvelope)
async def update_order(
    order_id: UUID,
    payload: OrderUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
        
    await db.commit()
    await db.refresh(order)
    return {
        "success": True,
        "message": "Order updated successfully.",
        "data": order,
        "errors": None
    }

@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    await db.delete(order)
    await db.commit()
    return {"success": True, "message": "Order deleted successfully."}

# --- Inventory ---
@router.get("/inventory", response_model=InventoryListEnvelope)
async def list_inventory(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Inventory).where(Inventory.organization_id == current_user.organization_id)
    )
    inventory = result.scalars().all()
    return {
        "success": True,
        "message": "Inventory retrieved successfully.",
        "data": inventory,
        "errors": None
    }

@router.get("/inventory/{inventory_id}", response_model=InventoryEnvelope)
async def get_inventory(
    inventory_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    inventory = result.scalar_one_or_none()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    return {
        "success": True,
        "message": "Inventory retrieved successfully.",
        "data": inventory,
        "errors": None
    }

@router.post("/inventory", response_model=InventoryEnvelope, status_code=status.HTTP_201_CREATED)
async def create_inventory(
    payload: InventoryCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    inventory = Inventory(**payload.model_dump())
    db.add(inventory)
    await db.commit()
    await db.refresh(inventory)
    return {
        "success": True,
        "message": "Inventory created successfully.",
        "data": inventory,
        "errors": None
    }

@router.patch("/inventory/{inventory_id}", response_model=InventoryEnvelope)
async def update_inventory(
    inventory_id: UUID,
    payload: InventoryUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    inventory = result.scalar_one_or_none()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(inventory, field, value)
        
    await db.commit()
    await db.refresh(inventory)
    return {
        "success": True,
        "message": "Inventory updated successfully.",
        "data": inventory,
        "errors": None
    }

@router.delete("/inventory/{inventory_id}")
async def delete_inventory(
    inventory_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    inventory = result.scalar_one_or_none()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    await db.delete(inventory)
    await db.commit()
    return {"success": True, "message": "Inventory deleted successfully."}
