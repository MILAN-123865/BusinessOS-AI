from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.models.finance import Invoice, Expense
from app.models.user import User
from app.dependencies.auth import get_current_active_user

router = APIRouter(tags=["Finance"])


class InvoiceCreate(BaseModel):
    client_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    invoice_number: str
    amount: float
    status: str = "Pending"
    issue_date: Optional[date] = None
    due_date: date


class ExpenseCreate(BaseModel):
    department_id: Optional[UUID] = None
    amount: float
    category: str
    description: Optional[str] = None
    expense_date: Optional[date] = None


@router.get("/invoices")
async def list_invoices(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Invoice).options(selectinload(Invoice.client), selectinload(Invoice.project))
    if current_user.organization_id:
        query = query.where(Invoice.organization_id == current_user.organization_id)
    result = await db.execute(query)
    invoices = result.scalars().all()
    return {
        "success": True,
        "data": invoices,
        "message": "Invoices retrieved successfully."
    }


@router.post("/invoices", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    invoice = Invoice(
        organization_id=current_user.organization_id,
        client_id=payload.client_id,
        project_id=payload.project_id,
        invoice_number=payload.invoice_number,
        amount=payload.amount,
        status=payload.status,
        issue_date=payload.issue_date or date.today(),
        due_date=payload.due_date
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return {
        "success": True,
        "data": invoice,
        "message": "Invoice created successfully."
    }


@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Invoice)
        .options(selectinload(Invoice.client), selectinload(Invoice.project))
        .where(Invoice.id == invoice_id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return {"success": True, "data": invoice}


@router.patch("/invoices/{invoice_id}")
async def update_invoice(
    invoice_id: UUID,
    payload: dict,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    for key, val in payload.items():
        if hasattr(invoice, key) and val is not None:
            setattr(invoice, key, val)
    await db.commit()
    await db.refresh(invoice)
    return {"success": True, "data": invoice}


@router.delete("/invoices/{invoice_id}")
async def delete_invoice(
    invoice_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    await db.delete(invoice)
    await db.commit()
    return {"success": True, "message": "Invoice deleted successfully."}


@router.get("/expenses")
async def list_expenses(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Expense).options(selectinload(Expense.department), selectinload(Expense.user))
    if current_user.organization_id:
        query = query.where(Expense.organization_id == current_user.organization_id)
    result = await db.execute(query)
    expenses = result.scalars().all()
    return {
        "success": True,
        "data": expenses,
        "message": "Expenses retrieved successfully."
    }


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    expense = Expense(
        organization_id=current_user.organization_id,
        department_id=payload.department_id,
        user_id=current_user.id,
        amount=payload.amount,
        category=payload.category,
        description=payload.description,
        expense_date=payload.expense_date or date.today()
    )
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return {
        "success": True,
        "data": expense,
        "message": "Expense recorded successfully."
    }
