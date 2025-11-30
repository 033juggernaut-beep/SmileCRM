"""Service layer for media file operations."""

from __future__ import annotations

import uuid
from typing import Any

from .supabase_client import supabase_client


def upload_media_file(
    patient_id: str,
    doctor_id: str,
    file_name: str,
    file_data: bytes,
    file_type: str,
    file_size: int,
) -> dict[str, Any]:
    """
    Upload a media file for a patient.
    
    Args:
        patient_id: Patient UUID
        doctor_id: Doctor UUID
        file_name: Original filename
        file_data: File content as bytes
        file_type: MIME type (e.g., image/jpeg)
        file_size: File size in bytes
    
    Returns:
        Media file record with metadata
    """
    # Generate unique file path
    file_id = str(uuid.uuid4())
    file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
    storage_path = f"{doctor_id}/{patient_id}/{file_id}.{file_extension}"
    
    # Upload to Supabase Storage
    public_url = supabase_client.upload_file(
        bucket="media",
        path=storage_path,
        file_data=file_data,
        content_type=file_type,
    )
    
    # Create database record
    media_record = {
        "id": file_id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "file_name": file_name,
        "file_type": file_type,
        "file_size": file_size,
        "storage_path": storage_path,
        "storage_bucket": "media",
    }
    
    result = supabase_client.insert("media_files", media_record)
    
    if not result:
        raise RuntimeError("Failed to create media file record")
    
    # Add public URL to response
    record = result[0]
    record["public_url"] = public_url
    
    return record


def list_patient_media(patient_id: str) -> list[dict[str, Any]]:
    """
    List all media files for a patient.
    
    Args:
        patient_id: Patient UUID
    
    Returns:
        List of media file records with public URLs
    """
    records = supabase_client.select(
        "media_files",
        filters={"patient_id": patient_id},
    )
    
    # Add public URLs to each record
    for record in records:
        storage_path = record.get("storage_path")
        if storage_path:
            record["public_url"] = supabase_client.get_file_url("media", storage_path)
    
    return records


def delete_media_file(file_id: str, doctor_id: str) -> bool:
    """
    Delete a media file.
    
    Args:
        file_id: Media file UUID
        doctor_id: Doctor UUID (for authorization)
    
    Returns:
        True if deleted successfully
    """
    # Get the file record
    records = supabase_client.select(
        "media_files",
        filters={"id": file_id, "doctor_id": doctor_id},
    )
    
    if not records:
        return False
    
    record = records[0]
    storage_path = record.get("storage_path")
    
    # Delete from storage
    if storage_path:
        try:
            supabase_client.delete_file("media", storage_path)
        except Exception:
            # Continue even if storage deletion fails
            pass
    
    # Delete database record
    supabase_client.update(
        "media_files",
        filters={"id": file_id},
        values={"deleted_at": "NOW()"},  # Soft delete
    )
    
    return True

