"""
Notifications service for SmileCRM.

Provides CRUD operations for doctor notifications.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_notifications(
    doctor_id: str,
    limit: int = 20,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    List notifications for a doctor, ordered by created_at desc.
    
    Args:
        doctor_id: Doctor UUID
        limit: Max number of notifications to return
        offset: Number of notifications to skip
        
    Returns:
        List of notification dicts
    """
    try:
        if not supabase_client.is_configured:
            return []
            
        client = supabase_client.client
        if not client:
            return []
            
        response = (
            client.table("notifications")
            .select("*")
            .eq("doctor_id", doctor_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        return response.data if response.data else []
    except SupabaseNotConfiguredError:
        return []
    except Exception:
        return []


def get_unread_count(doctor_id: str) -> int:
    """
    Get count of unread notifications for a doctor.
    
    Args:
        doctor_id: Doctor UUID
        
    Returns:
        Number of unread notifications
    """
    try:
        if not supabase_client.is_configured:
            return 0
            
        client = supabase_client.client
        if not client:
            return 0
            
        response = (
            client.table("notifications")
            .select("id", count="exact")
            .eq("doctor_id", doctor_id)
            .is_("read_at", "null")
            .execute()
        )
        
        return response.count if response.count else 0
    except SupabaseNotConfiguredError:
        return 0
    except Exception:
        return 0


def mark_read(doctor_id: str, notification_ids: list[str]) -> int:
    """
    Mark specific notifications as read.
    
    Args:
        doctor_id: Doctor UUID (for ownership verification)
        notification_ids: List of notification UUIDs to mark as read
        
    Returns:
        Number of notifications updated
    """
    if not notification_ids:
        return 0
        
    try:
        if not supabase_client.is_configured:
            return 0
            
        client = supabase_client.client
        if not client:
            return 0
            
        now = datetime.now(timezone.utc).isoformat()
        
        response = (
            client.table("notifications")
            .update({"read_at": now})
            .eq("doctor_id", doctor_id)
            .in_("id", notification_ids)
            .is_("read_at", "null")
            .execute()
        )
        
        return len(response.data) if response.data else 0
    except SupabaseNotConfiguredError:
        return 0
    except Exception:
        return 0


def mark_all_read(doctor_id: str) -> int:
    """
    Mark all notifications as read for a doctor.
    
    Args:
        doctor_id: Doctor UUID
        
    Returns:
        Number of notifications updated
    """
    try:
        if not supabase_client.is_configured:
            return 0
            
        client = supabase_client.client
        if not client:
            return 0
            
        now = datetime.now(timezone.utc).isoformat()
        
        response = (
            client.table("notifications")
            .update({"read_at": now})
            .eq("doctor_id", doctor_id)
            .is_("read_at", "null")
            .execute()
        )
        
        return len(response.data) if response.data else 0
    except SupabaseNotConfiguredError:
        return 0
    except Exception:
        return 0


def create_notification(
    doctor_id: str,
    notification_type: str,
    title: str,
    body: str | None = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """
    Create a new notification.
    
    Args:
        doctor_id: Doctor UUID
        notification_type: Type of notification
        title: Notification title
        body: Optional notification body
        meta: Optional JSON metadata
        
    Returns:
        Created notification dict or None
    """
    try:
        payload = {
            "doctor_id": doctor_id,
            "type": notification_type,
            "title": title,
            "body": body,
            "meta": meta,
        }
        
        inserted = supabase_client.insert("notifications", payload)
        return inserted[0] if inserted else None
    except SupabaseNotConfiguredError:
        # Return a mock notification for local development
        return {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_id,
            "type": notification_type,
            "title": title,
            "body": body,
            "meta": meta,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read_at": None,
        }
    except Exception:
        return None


def seed_demo_notifications(doctor_id: str) -> list[dict[str, Any]]:
    """
    Create demo notifications for development/testing.
    
    Args:
        doctor_id: Doctor UUID
        
    Returns:
        List of created notification dicts
    """
    demo_notifications = [
        {
            "type": "visit_reminder",
            "title": "Upcoming visit: Ivanov A.S.",
            "body": "Appointment in 30 minutes at 14:00",
            "meta": {"patient_name": "Ivanov A.S.", "minutes_until": 30},
        },
        {
            "type": "no_show",
            "title": "Patient no-show: Petrov V.M.",
            "body": "Patient missed their appointment at 10:00",
            "meta": {"patient_name": "Petrov V.M."},
        },
        {
            "type": "trial_warning",
            "title": "Trial period ending",
            "body": "Your trial ends in 3 days. Subscribe to continue using SmileCRM.",
            "meta": {"days_remaining": 3},
        },
        {
            "type": "info",
            "title": "Welcome to SmileCRM!",
            "body": "Start by adding your first patient.",
            "meta": None,
        },
        {
            "type": "visit_reminder",
            "title": "Follow-up reminder: Sidorov I.K.",
            "body": "Patient is overdue for a follow-up visit",
            "meta": {"patient_name": "Sidorov I.K.", "days_overdue": 14},
        },
    ]
    
    created = []
    for notification in demo_notifications:
        result = create_notification(
            doctor_id=doctor_id,
            notification_type=notification["type"],
            title=notification["title"],
            body=notification["body"],
            meta=notification["meta"],
        )
        if result:
            created.append(result)
    
    return created

