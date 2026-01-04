"""
Notifications service for SmileCRM.

Provides CRUD operations for doctor notifications.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone, timedelta, date
from typing import Any, Literal

from .supabase_client import SupabaseNotConfiguredError, supabase_client

logger = logging.getLogger(__name__)

NotificationStatus = Literal["unread", "read", "dismissed", "done"]


def list_notifications(
    doctor_id: str,
    status: NotificationStatus | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    List notifications for a doctor, ordered by created_at desc.
    
    Args:
        doctor_id: Doctor UUID
        status: Filter by status (unread, read, dismissed, done)
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
            
        query = (
            client.table("notifications")
            .select("*")
            .eq("doctor_id", doctor_id)
        )
        
        # Filter by status if provided
        if status:
            query = query.eq("status", status)
        
        response = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        return response.data if response.data else []
    except SupabaseNotConfiguredError:
        return []
    except Exception as e:
        logger.error(f"Failed to list notifications: {e}")
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
    patient_id: str | None = None,
    action_type: str | None = None,
    action_payload: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """
    Create a new notification.
    
    Args:
        doctor_id: Doctor UUID
        notification_type: Type of notification
        title: Notification title
        body: Optional notification body
        meta: Optional JSON metadata
        patient_id: Optional patient ID for patient-related notifications
        action_type: Optional action type (generate_message, open_patient, etc.)
        action_payload: Optional JSON payload for the action
        
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
            "status": "unread",
            "patient_id": patient_id,
            "action_type": action_type,
            "action_payload": action_payload,
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
            "status": "unread",
            "patient_id": patient_id,
            "action_type": action_type,
            "action_payload": action_payload,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read_at": None,
        }
    except Exception as e:
        logger.error(f"Failed to create notification: {e}")
        return None


def update_notification_status(
    doctor_id: str,
    notification_id: str,
    status: NotificationStatus,
) -> dict[str, Any] | None:
    """
    Update notification status.
    
    Args:
        doctor_id: Doctor UUID (for ownership verification)
        notification_id: Notification UUID
        status: New status (unread, read, dismissed, done)
        
    Returns:
        Updated notification dict or None
    """
    try:
        if not supabase_client.is_configured:
            return None
            
        client = supabase_client.client
        if not client:
            return None
        
        update_data = {"status": status}
        
        # Also set read_at when marking as read
        if status in ("read", "done"):
            update_data["read_at"] = datetime.now(timezone.utc).isoformat()
            
        response = (
            client.table("notifications")
            .update(update_data)
            .eq("id", notification_id)
            .eq("doctor_id", doctor_id)
            .execute()
        )
        
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Failed to update notification status: {e}")
        return None


def generate_birthday_notifications(doctor_id: str, target_date: date | None = None) -> list[dict[str, Any]]:
    """
    Generate birthday notifications for patients with birthdays tomorrow.
    
    Args:
        doctor_id: Doctor UUID
        target_date: Date to check for birthdays (defaults to tomorrow)
        
    Returns:
        List of created notifications
    """
    if target_date is None:
        target_date = date.today() + timedelta(days=1)
    
    logger.info(f"Generating birthday notifications for doctor {doctor_id}, target_date={target_date}")
    
    try:
        if not supabase_client.is_configured:
            logger.warning("Supabase not configured, skipping birthday notifications")
            return []
            
        client = supabase_client.client
        if not client:
            logger.warning("Supabase client not available")
            return []
        
        # Get patients with birthdays matching target date (month and day)
        # We need to query by EXTRACT(MONTH) and EXTRACT(DAY)
        month = target_date.month
        day = target_date.day
        
        logger.info(f"Looking for birthdays on month={month}, day={day}")
        
        # Get all patients for this doctor with birth_date set
        response = (
            client.table("patients")
            .select("id, first_name, last_name, birth_date")
            .eq("doctor_id", doctor_id)
            .not_.is_("birth_date", "null")
            .execute()
        )
        
        if not response.data:
            logger.info("No patients with birth_date found")
            return []
        
        logger.info(f"Found {len(response.data)} patients with birth_date")
        
        # Filter patients whose birthday matches target date
        birthday_patients = []
        for patient in response.data:
            birth_date_str = patient.get("birth_date")
            if birth_date_str:
                try:
                    bd = date.fromisoformat(birth_date_str) if isinstance(birth_date_str, str) else birth_date_str
                    logger.debug(f"Patient {patient.get('first_name')} {patient.get('last_name')}: birth_date={bd}, matches={bd.month == month and bd.day == day}")
                    if bd.month == month and bd.day == day:
                        birthday_patients.append(patient)
                        logger.info(f"Birthday match: {patient.get('first_name')} {patient.get('last_name')}")
                except Exception as e:
                    logger.warning(f"Failed to parse birth_date {birth_date_str}: {e}")
                    continue
        
        logger.info(f"Found {len(birthday_patients)} patients with birthdays on {target_date}")
        
        created = []
        for patient in birthday_patients:
            # Check for duplicate notification created today
            today_str = date.today().isoformat()
            existing = (
                client.table("notifications")
                .select("id")
                .eq("doctor_id", doctor_id)
                .eq("patient_id", patient["id"])
                .eq("type", "birthday")
                .gte("created_at", today_str)
                .execute()
            )
            
            if existing.data:
                continue  # Already created today
            
            notification = create_notification(
                doctor_id=doctor_id,
                notification_type="birthday",
                title="🎂 Завтра день рождения пациента",
                body=f"{patient['first_name']} {patient['last_name']} — можно отправить поздравление",
                patient_id=patient["id"],
                action_type="generate_message",
                action_payload={"template": "birthday", "patientId": patient["id"]},
            )
            
            if notification:
                created.append(notification)
        
        return created
    except Exception as e:
        logger.error(f"Failed to generate birthday notifications: {e}")
        return []


def generate_inactive_notifications(doctor_id: str, months: int = 6) -> list[dict[str, Any]]:
    """
    Generate notifications for patients who haven't visited in specified months.
    
    Args:
        doctor_id: Doctor UUID
        months: Number of months of inactivity (default 6)
        
    Returns:
        List of created notifications
    """
    try:
        if not supabase_client.is_configured:
            return []
            
        client = supabase_client.client
        if not client:
            return []
        
        cutoff_date = date.today() - timedelta(days=months * 30)
        
        # Get all patients for this doctor
        patients_response = (
            client.table("patients")
            .select("id, first_name, last_name")
            .eq("doctor_id", doctor_id)
            .execute()
        )
        
        if not patients_response.data:
            return []
        
        created = []
        today_str = date.today().isoformat()
        
        for patient in patients_response.data:
            patient_id = patient["id"]
            
            # Get latest visit for this patient
            visits_response = (
                client.table("visits")
                .select("visit_date")
                .eq("patient_id", patient_id)
                .order("visit_date", desc=True)
                .limit(1)
                .execute()
            )
            
            last_visit_date = None
            if visits_response.data:
                last_visit_str = visits_response.data[0].get("visit_date")
                if last_visit_str:
                    try:
                        last_visit_date = date.fromisoformat(last_visit_str) if isinstance(last_visit_str, str) else last_visit_str
                    except Exception:
                        pass
            
            # Skip if visited recently
            if last_visit_date and last_visit_date > cutoff_date:
                continue
            
            # Check for duplicate notification created today
            existing = (
                client.table("notifications")
                .select("id")
                .eq("doctor_id", doctor_id)
                .eq("patient_id", patient_id)
                .eq("type", "inactive_6m")
                .gte("created_at", today_str)
                .execute()
            )
            
            if existing.data:
                continue  # Already created today
            
            notification = create_notification(
                doctor_id=doctor_id,
                notification_type="inactive_6m",
                title="⏰ Пациент давно не был на приёме",
                body=f"{patient['first_name']} {patient['last_name']} — можно напомнить о визите",
                patient_id=patient_id,
                action_type="generate_message",
                action_payload={"template": "visit_reminder", "patientId": patient_id},
            )
            
            if notification:
                created.append(notification)
        
        return created
    except Exception as e:
        logger.error(f"Failed to generate inactive notifications: {e}")
        return []


def generate_completed_inactive_notifications(doctor_id: str, months: int = 1) -> list[dict[str, Any]]:
    """
    Generate notifications for COMPLETED patients who haven't visited in specified months.
    
    This is different from inactive_6m - it specifically targets patients with status='completed'
    who might need a follow-up or recall after treatment completion.
    
    Args:
        doctor_id: Doctor UUID
        months: Number of months since last visit (default 1)
        
    Returns:
        List of created notifications
    """
    try:
        if not supabase_client.is_configured:
            return []
            
        client = supabase_client.client
        if not client:
            return []
        
        cutoff_date = date.today() - timedelta(days=months * 30)
        
        # Get completed patients for this doctor
        patients_response = (
            client.table("patients")
            .select("id, first_name, last_name")
            .eq("doctor_id", doctor_id)
            .eq("status", "completed")
            .execute()
        )
        
        if not patients_response.data:
            return []
        
        created = []
        today_str = date.today().isoformat()
        
        for patient in patients_response.data:
            patient_id = patient["id"]
            
            # Get latest visit for this patient
            visits_response = (
                client.table("visits")
                .select("visit_date")
                .eq("patient_id", patient_id)
                .order("visit_date", desc=True)
                .limit(1)
                .execute()
            )
            
            last_visit_date = None
            if visits_response.data:
                last_visit_str = visits_response.data[0].get("visit_date")
                if last_visit_str:
                    try:
                        last_visit_date = date.fromisoformat(last_visit_str) if isinstance(last_visit_str, str) else last_visit_str
                    except Exception:
                        pass
            
            # Skip if visited recently or no visits at all
            if not last_visit_date or last_visit_date > cutoff_date:
                continue
            
            # Check for duplicate notification created today
            existing = (
                client.table("notifications")
                .select("id")
                .eq("doctor_id", doctor_id)
                .eq("patient_id", patient_id)
                .eq("type", "completed_inactive")
                .gte("created_at", today_str)
                .execute()
            )
            
            if existing.data:
                continue  # Already created today
            
            # Calculate days since last visit
            days_since = (date.today() - last_visit_date).days
            
            notification = create_notification(
                doctor_id=doctor_id,
                notification_type="completed_inactive",
                title="Пациент давно не был (завершён)",
                body=f"{patient['first_name']} {patient['last_name']} — прошло {days_since} дней с последнего визита",
                patient_id=patient_id,
                action_type="generate_message",
                action_payload={"template": "visit_reminder", "patientId": patient_id},
            )
            
            if notification:
                created.append(notification)
        
        return created
    except Exception as e:
        logger.error(f"Failed to generate completed inactive notifications: {e}")
        return []


def generate_holiday_notifications(doctor_id: str) -> list[dict[str, Any]]:
    """
    Generate smart holiday notifications considering patient gender.
    
    Supported holidays:
    - March 8 (International Women's Day) - only for female patients
    - February 23 (Defender of the Fatherland Day) - only for male patients (optional, RU-specific)
    - New Year (Jan 1) - all patients
    - Armenian holidays (March 8, Mother's Day, etc.)
    
    Notifications are created 3-7 days before the holiday to give doctor time to send greetings.
    
    Args:
        doctor_id: Doctor UUID
        
    Returns:
        List of created notifications
    """
    try:
        if not supabase_client.is_configured:
            return []
            
        client = supabase_client.client
        if not client:
            return []
        
        today = date.today()
        created = []
        
        # Define holidays with gender restrictions
        # Format: (month, day, title_template, gender_filter, days_before)
        # gender_filter: 'female', 'male', or None for all
        holidays = [
            (3, 8, "8 Марта", "female", [7, 3, 1]),  # Women's Day - female only
            (2, 23, "23 Февраля", "male", [7, 3, 1]),  # Defender's Day - male only
            (4, 7, "День материнства и красоты", "female", [7, 3]),  # Armenian Mother's Day
            (12, 31, "Новый год", None, [14, 7, 3]),  # New Year - all
            (1, 1, "Новый год", None, [7, 3, 1]),  # New Year (for early Jan notifications)
        ]
        
        for month, day, holiday_name, gender_filter, days_before_list in holidays:
            try:
                # Calculate holiday date for this year
                holiday_date = date(today.year, month, day)
                
                # If holiday already passed this year, check next year
                if holiday_date < today:
                    holiday_date = date(today.year + 1, month, day)
                
                days_until = (holiday_date - today).days
                
                # Check if we should create notifications (within days_before range)
                if days_until not in days_before_list:
                    continue
                
                # Get patients (filtered by gender if needed)
                query = (
                    client.table("patients")
                    .select("id, first_name, last_name, gender")
                    .eq("doctor_id", doctor_id)
                )
                
                if gender_filter:
                    query = query.eq("gender", gender_filter)
                
                patients_response = query.execute()
                
                if not patients_response.data:
                    continue
                
                today_str = today.isoformat()
                notification_type = f"holiday_{month}_{day}"
                
                for patient in patients_response.data:
                    patient_id = patient["id"]
                    patient_gender = patient.get("gender")
                    
                    # Double-check gender filter (in case DB has NULL)
                    if gender_filter and patient_gender != gender_filter:
                        continue
                    
                    # Skip if gender is required but not set
                    if gender_filter and not patient_gender:
                        continue
                    
                    # Check for duplicate notification
                    existing = (
                        client.table("notifications")
                        .select("id")
                        .eq("doctor_id", doctor_id)
                        .eq("patient_id", patient_id)
                        .eq("type", notification_type)
                        .gte("created_at", today_str)
                        .execute()
                    )
                    
                    if existing.data:
                        continue
                    
                    notification = create_notification(
                        doctor_id=doctor_id,
                        notification_type=notification_type,
                        title=f"🎉 {holiday_name} через {days_until} дн.",
                        body=f"Поздравьте {patient['first_name']} {patient['last_name']}!",
                        patient_id=patient_id,
                        action_type="generate_message",
                        action_payload={
                            "template": "holiday",
                            "patientId": patient_id,
                            "holiday": holiday_name
                        },
                    )
                    
                    if notification:
                        created.append(notification)
                        
            except Exception as e:
                logger.warning(f"Error processing holiday {holiday_name}: {e}")
                continue
        
        return created
    except Exception as e:
        logger.error(f"Failed to generate holiday notifications: {e}")
        return []


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

