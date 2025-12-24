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
    UpdateNotificationRequest,
    NotificationStatus,
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
        "status": data.get("status", "unread"),
        "patientId": data.get("patient_id"),
        "actionType": data.get("action_type"),
        "actionPayload": data.get("action_payload"),
    }


@router.get("/", response_model=NotificationListOut)
async def list_notifications(
    current_doctor: CurrentDoctor,
    status: NotificationStatus | None = None,
    limit: int = 20,
    offset: int = 0,
) -> NotificationListOut:
    """
    List notifications for the current doctor.
    
    Args:
        status: Filter by status (unread, read, dismissed, done). If not provided, returns all.
        limit: Max number of notifications to return
        offset: Number of notifications to skip
    
    Returns notifications ordered by created_at desc, with unread count.
    """
    notifications = notifications_service.list_notifications(
        doctor_id=current_doctor.doctor_id,
        status=status,
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


@router.patch("/{notification_id}")
async def update_notification(
    notification_id: str,
    payload: UpdateNotificationRequest,
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Update a notification's status.
    
    Status can be: unread, read, dismissed, done
    """
    result = notifications_service.update_notification_status(
        doctor_id=current_doctor.doctor_id,
        notification_id=notification_id,
        status=payload.status,
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied"
        )
    
    return {"ok": True, "notification": _map_notification(result)}


@router.post("/generate")
async def generate_notifications(
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Generate birthday and inactive patient notifications.
    
    This endpoint is for development/testing.
    In production, this should be triggered by a scheduled job.
    """
    birthday_notifications = notifications_service.generate_birthday_notifications(
        doctor_id=current_doctor.doctor_id
    )
    
    inactive_notifications = notifications_service.generate_inactive_notifications(
        doctor_id=current_doctor.doctor_id
    )
    
    return {
        "ok": True,
        "birthdayCount": len(birthday_notifications),
        "inactiveCount": len(inactive_notifications),
        "totalCreated": len(birthday_notifications) + len(inactive_notifications),
    }


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

