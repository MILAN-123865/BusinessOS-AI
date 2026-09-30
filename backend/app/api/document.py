import os
import json
import logging
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.future import select
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_db_session
from app.dependencies.auth import get_current_active_user
from app.models.document import Document
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentEnvelope,
    DocumentListEnvelope,
    DocumentVersionResponse
)
from app.services.storage_service import (
    save_uploaded_file,
    get_file_path,
    delete_stored_file
)
from app.config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])


def map_document(doc: Document) -> dict:
    ext = doc.title.split(".")[-1] if "." in doc.title else ""
    # Use real relative download and preview endpoints
    base_api = settings.API_V1_PREFIX
    api_download_url = f"{base_api}/documents/{doc.id}/download"
    api_preview_url = f"{base_api}/documents/{doc.id}/file"

    return {
        "id": doc.id,
        "name": doc.title,
        "original_name": doc.title,
        "extension": ext,
        "mime_type": doc.file_type or "application/octet-stream",
        "size": doc.size_bytes or 0,
        "version": doc.version or "1.0",
        "owner_id": doc.owner_id,
        "uploaded_by_id": doc.owner_id,
        "organization_id": doc.organization_id,
        "project_id": None,
        "department_id": doc.department_id,
        "tags": doc.tags or [],
        "description": "Enterprise Managed Document",
        "visibility": "organization",
        "storage_path": doc.file_url,
        "download_url": api_download_url,
        "preview_url": api_preview_url,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
        "downloads": doc.downloads or 0
    }


@router.get("", response_model=DocumentListEnvelope)
async def list_documents(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """List all documents belonging to current user's organization."""
    result = await db.execute(
        select(Document)
        .where(Document.organization_id == current_user.organization_id)
        .order_by(desc(Document.created_at))
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
    """Retrieve document details by ID."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return {
        "success": True,
        "message": "Document retrieved successfully.",
        "data": map_document(doc),
        "errors": None
    }


@router.post("/upload", response_model=DocumentEnvelope, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Upload a physical file and store it in enterprise storage."""
    meta_dict = {}
    if metadata:
        try:
            meta_dict = json.loads(metadata)
        except Exception:
            pass

    doc_id = uuid4()
    
    # Save file to disk
    storage_path, file_size, mime_type = await save_uploaded_file(file, str(doc_id))

    dept_id = None
    if meta_dict.get("department_id"):
        try:
            dept_id = UUID(meta_dict["department_id"])
        except Exception:
            pass

    doc = Document(
        id=doc_id,
        title=file.filename or "Uploaded Document",
        file_url=storage_path,
        file_type=mime_type,
        size_bytes=file_size,
        owner_id=current_user.id,
        department_id=dept_id or current_user.department_id,
        organization_id=current_user.organization_id,
        tags=meta_dict.get("tags", []),
        version="1.0",
        downloads=0
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    logger.info(f"Uploaded document {doc.title} ({file_size} bytes) by user {current_user.id}")

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
):
    """Download the document binary directly with attachment headers."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Increment downloads counter
    doc.downloads = (doc.downloads or 0) + 1
    await db.commit()

    # If it's a real local file
    if doc.file_url and not doc.file_url.startswith("http"):
        abs_path = get_file_path(doc.file_url)
        return FileResponse(
            path=str(abs_path),
            filename=doc.title,
            media_type=doc.file_type or "application/octet-stream"
        )
    else:
        # Fallback redirect or json if mock
        return {
            "success": True,
            "message": "Document download initiated.",
            "data": {"downloadUrl": doc.file_url},
            "errors": None
        }


@router.get("/{doc_id}/file")
async def stream_document_file(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """Stream file for in-browser inline preview (PDF, images, etc.)."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if doc.file_url and not doc.file_url.startswith("http"):
        abs_path = get_file_path(doc.file_url)
        return FileResponse(
            path=str(abs_path),
            media_type=doc.file_type or "application/octet-stream",
            headers={"Content-Disposition": f"inline; filename=\"{doc.title}\""}
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File content not found on local storage.")


@router.get("/{doc_id}/preview")
async def preview_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Retrieve document preview URLs and metadata."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    preview_url = f"{settings.API_V1_PREFIX}/documents/{doc.id}/file" if doc.file_url and not doc.file_url.startswith("http") else doc.file_url

    return {
        "success": True,
        "message": "Document preview retrieved.",
        "data": {
            "previewUrl": preview_url,
            "mimeType": doc.file_type or "application/octet-stream",
            "name": doc.title,
            "size": doc.size_bytes
        },
        "errors": None
    }


@router.patch("/{doc_id}", response_model=DocumentEnvelope)
async def update_document(
    doc_id: UUID,
    payload: DocumentUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Update document metadata."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

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
    """Delete document from database and purge from server storage."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    response_data = map_document(doc)

    # Clean local disk file
    if doc.file_url and not doc.file_url.startswith("http"):
        delete_stored_file(doc.file_url)

    await db.delete(doc)
    await db.commit()

    return {
        "success": True,
        "message": "Document deleted successfully.",
        "data": response_data,
        "errors": None
    }


@router.get("/{doc_id}/versions", response_model=dict)
async def list_document_versions(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """List document versions."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    mock_versions = [
        {
            "id": str(doc.id),
            "document_id": str(doc.id),
            "version": doc.version or "1.0",
            "size": doc.size_bytes or 0,
            "storage_path": doc.file_url,
            "download_url": f"{settings.API_V1_PREFIX}/documents/{doc.id}/download",
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
    """Upload a new version of an existing document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # Save new physical version
    storage_path, file_size, mime_type = await save_uploaded_file(file, f"{str(doc.id)}_v2")

    try:
        v_num = float(doc.version or "1.0")
        doc.version = f"{v_num + 1.0:.1f}"
    except ValueError:
        doc.version = "2.0"

    doc.file_url = storage_path
    doc.size_bytes = file_size
    doc.file_type = mime_type

    await db.commit()
    await db.refresh(doc)

    return {
        "success": True,
        "message": f"Document upgraded to version {doc.version}.",
        "data": map_document(doc),
        "errors": None
    }
