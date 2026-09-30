"""
Enterprise Storage Service for Local File Uploads, Downloads, and Previews.
"""

import os
import shutil
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_ROOT = BASE_DIR / "uploads" / "documents"

# Ensure upload directory exists
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)


async def save_uploaded_file(file: UploadFile, doc_id: str) -> Tuple[str, int, str]:
    """
    Saves an uploaded file to local enterprise storage.
    Returns: (file_path, file_size_bytes, mime_type)
    """
    doc_dir = STORAGE_ROOT / doc_id
    doc_dir.mkdir(parents=True, exist_ok=True)
    
    # Clean filename
    safe_filename = Path(file.filename or "uploaded_file").name
    destination = doc_dir / safe_filename
    
    bytes_written = 0
    try:
        with open(destination, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                buffer.write(chunk)
                bytes_written += len(chunk)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file to storage: {str(e)}"
        )
    finally:
        await file.close()

    mime_type = file.content_type or "application/octet-stream"
    rel_path = str(destination.relative_to(BASE_DIR)).replace("\\", "/")
    
    return rel_path, bytes_written, mime_type


def get_file_path(storage_rel_path: str) -> Path:
    """Resolve relative storage path to absolute Path."""
    abs_path = BASE_DIR / storage_rel_path
    if not abs_path.exists() or not abs_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found on server storage."
        )
    return abs_path


def delete_stored_file(storage_rel_path: str):
    """Safely delete stored file and its parent folder if empty."""
    try:
        abs_path = BASE_DIR / storage_rel_path
        if abs_path.exists() and abs_path.is_file():
            parent_dir = abs_path.parent
            abs_path.unlink()
            if parent_dir.exists() and not any(parent_dir.iterdir()):
                shutil.rmtree(parent_dir, ignore_errors=True)
    except Exception:
        pass
