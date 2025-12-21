"""
Notifications API endpoints.

Endpoints:
- GET /notifications - List notifications for current doctor
- POST /notifications/mark-read - Mark specific notifications as read
- POST /notifications/mark-all-read - Mark all notifications as read
- POST /notifications/seed - Create demo notifications (dev only)
"""

from __future__ import annotations

import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.notifications import (
    CreateNotificationRequest,
    MarkReadRequest,
    NotificationListOut,
    NotificationOut,
)
from app.services import notifications_service

router = APIRouter(prefix="/notifications", tags=["notifications"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


def _map_notification(data: dict) -> dict:
    """Map database snake_case to camelCase for frontend."""
    return {
        "id": data.get("id"),
        "doctorId": data.get("doctor_id"),
        "type": data.get("type"),
        "title": data.get("title"),
        "body": data.get("body"),
        "createdAt": data.get("created_at"),
        "readAt": data.get("read_at"),
        "meta": data.get("meta"),
    }


@router.get("/", response_model=NotificationListOut)
async def list_notifications(
    current_doctor: CurrentDoctor,
    limit: int = 20,
    offset: int = 0,
) -> NotificationListOut:
    """
    List notifications for the current doctor.
    
    Returns notifications ordered by created_at desc, with unread count.
    """
    notifications = notifications_service.list_notifications(
        doctor_id=current_doctor.doctor_id,
        limit=limit,
        offset=offset,
    )
    
    unread_count = notifications_service.get_unread_count(
        doctor_id=current_doctor.doctor_id
    )
    
    items = [NotificationOut(**_map_notification(n)) for n in notifications]
    
    return NotificationListOut(items=items, unreadCount=unread_count)


@router.post("/mark-read")
async def mark_notifications_read(
    payload: MarkReadRequest,
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Mark specific notifications as read.
    
    Only notifications belonging to the current doctor will be updated.
    """
    updated_count = notifications_service.mark_read(
        doctor_id=current_doctor.doctor_id,
        notification_ids=payload.ids,
    )
    
    return {"ok": True, "updatedCount": updated_count}


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Mark all notifications as read for the current doctor.
    """
    updated_count = notifications_service.mark_all_read(
        doctor_id=current_doctor.doctor_id
    )
    
    return {"ok": True, "updatedCount": updated_count}


@router.post("/seed")
async def seed_demo_notifications(
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Create demo notifications for development/testing.
    
    This endpoint is only available in development mode.
    In production, it returns a 403 error.
    """
    # Only allow in development
    is_dev = os.environ.get("ENV", "development").lower() in ("development", "dev", "local")
    
    if not is_dev:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seed endpoint is only available in development mode"
        )
    
    created = notifications_service.seed_demo_notifications(
        doctor_id=current_doctor.doctor_id
    )
    
    return {
        "ok": True,
        "createdCount": len(created),
        "items": [_map_notification(n) for n in created],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_notification(
    payload: CreateNotificationRequest,
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Create a new notification (dev/testing only).
    
    In production, notifications should be created by background jobs
    or internal services, not directly via API.
    """
    # Only allow in development
    is_dev = os.environ.get("ENV", "development").lower() in ("development", "dev", "local")
    
    if not is_dev:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Create endpoint is only available in development mode"
        )
    
    result = notifications_service.create_notification(
        doctor_id=current_doctor.doctor_id,
        notification_type=payload.type,
        title=payload.title,
        body=payload.body,
        meta=payload.meta,
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification"
        )
    
    return {"ok": True, "notification": _map_notification(result)}

