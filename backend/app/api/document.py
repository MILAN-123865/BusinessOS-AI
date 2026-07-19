from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from uuid import UUID, uuid4
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import json

from app.dependencies.database import get_db_session
from app.models.document import Document
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentEnvelope,
    DocumentListEnvelope,
    DocumentVersionResponse
)

router = APIRouter(prefix="/documents", tags=["Documents"])

def map_document(doc: Document) -> dict:
    ext = doc.title.split(".")[-1] if "." in doc.title else ""
    return {
        "id": doc.id,
        "name": doc.title,
        "original_name": doc.title,
        "extension": ext,
        "mime_type": doc.file_type,
        "size": doc.size_bytes,
        "version": doc.version or "1.0",
        "owner_id": doc.owner_id,
        "uploaded_by_id": doc.owner_id,
        "organization_id": doc.organization_id,
        "project_id": None,
        "department_id": doc.department_id,
        "tags": doc.tags or [],
        "description": "Enterprise Document",
        "visibility": "organization",
        "storage_path": f"/storage/{doc.id}/{doc.title}",
        "download_url": doc.file_url,
        "preview_url": doc.file_url,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
        "downloads": doc.downloads or 0
    }

@router.get("", response_model=DocumentListEnvelope)
async def list_documents(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(
        select(Document).where(Document.organization_id == current_user.organization_id)
    )
    docs = result.scalars().all()
    return {
        "success": True,
        "message": "Documents retrieved successfully.",
        "data": [map_document(d) for d in docs],
        "errors": None
    }

@router.get("/{doc_id}", response_model=DocumentEnvelope)
async def get_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {
        "success": True,
        "message": "Document retrieved successfully.",
        "data": map_document(doc),
        "errors": None
    }

@router.post("", response_model=DocumentEnvelope, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    doc = Document(
        id=uuid4(),
        title=payload.name,
        file_url="https://storage.acme.com/placeholder.pdf",
        file_type="application/pdf",
        size_bytes=1024 * 150, # 150 KB
        owner_id=current_user.id,
        department_id=payload.department_id,
        organization_id=current_user.organization_id,
        tags=payload.tags or [],
        version="1.0"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return {
        "success": True,
        "message": "Document record created successfully.",
        "data": map_document(doc),
        "errors": None
    }

@router.patch("/{doc_id}", response_model=DocumentEnvelope)
async def update_document(
    doc_id: UUID,
    payload: DocumentUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    if payload.name is not None:
        doc.title = payload.name
    if payload.department_id is not None:
        doc.department_id = payload.department_id
    if payload.tags is not None:
        doc.tags = payload.tags
    
    await db.commit()
    await db.refresh(doc)
    return {
        "success": True,
        "message": "Document metadata updated successfully.",
        "data": map_document(doc),
        "errors": None
    }

@router.delete("/{doc_id}", response_model=DocumentEnvelope)
async def delete_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    response_data = map_document(doc)
    await db.delete(doc)
    await db.commit()
    return {
        "success": True,
        "message": "Document deleted successfully.",
        "data": response_data,
        "errors": None
    }

@router.post("/upload", response_model=DocumentEnvelope)
async def upload_document(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    meta_dict = {}
    if metadata:
        try:
            meta_dict = json.loads(metadata)
        except Exception:
            pass

    # Create document
    doc = Document(
        id=uuid4(),
        title=file.filename,
        file_url=f"https://storage.acme.com/{uuid4()}_{file.filename}",
        file_type=file.content_type or "application/octet-stream",
        size_bytes=1024 * 350, # Mock size
        owner_id=current_user.id,
        department_id=meta_dict.get("department_id"),
        organization_id=current_user.organization_id,
        tags=meta_dict.get("tags", []),
        version="1.0"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return {
        "success": True,
        "message": "Document uploaded successfully.",
        "data": map_document(doc),
        "errors": None
    }

@router.get("/{doc_id}/download")
async def download_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    doc.downloads = (doc.downloads or 0) + 1
    await db.commit()
    return {
        "success": True,
        "message": "Document download initiated.",
        "data": {"downloadUrl": doc.file_url},
        "errors": None
    }

@router.get("/{doc_id}/preview")
async def preview_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    return {
        "success": True,
        "message": "Document preview retrieved.",
        "data": {"previewUrl": doc.file_url, "mimeType": doc.file_type},
        "errors": None
    }

@router.get("/{doc_id}/versions", response_model=dict)
async def list_document_versions(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Return mock version history
    mock_versions = [
        {
            "id": str(uuid4()),
            "document_id": str(doc.id),
            "version": "1.0",
            "size": doc.size_bytes,
            "storage_path": f"/storage/{doc.id}/{doc.title}",
            "download_url": doc.file_url,
            "created_by": str(doc.owner_id),
            "created_at": doc.created_at.isoformat()
        }
    ]
    return {
        "success": True,
        "message": "Versions retrieved.",
        "data": mock_versions,
        "errors": None
    }

@router.post("/{doc_id}/versions", response_model=dict)
async def upload_document_version(
    doc_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Update version count
    try:
        v_num = float(doc.version or "1.0")
        doc.version = f"{v_num + 1.0:.1f}"
    except ValueError:
        doc.version = "2.0"
        
    doc.size_bytes = 1024 * 400  # Mock updated size
    await db.commit()
    await db.refresh(doc)
    
    mock_version = {
        "id": str(uuid4()),
        "document_id": str(doc.id),
        "version": doc.version,
        "size": doc.size_bytes,
        "storage_path": f"/storage/{doc.id}/{doc.title}",
        "download_url": doc.file_url,
        "created_by": str(doc.owner_id),
        "created_at": doc.updated_at.isoformat()
    }
    return {
        "success": True,
        "message": "Version uploaded.",
        "data": mock_version,
        "errors": None
    }
