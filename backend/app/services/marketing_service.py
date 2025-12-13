"""Marketing service for patient marketing events and birthday management."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def create_marketing_event(
    doctor_id: str,
    patient_id: str,
    event_type: str,
    channel: str = "copy",
    payload: dict | None = None,
) -> dict[str, Any]:
    """Create a marketing event log entry."""
    body = {
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "type": event_type,
        "channel": channel,
        "payload": payload,
    }
    try:
        inserted = supabase_client.insert("patient_marketing_events", body)
    except SupabaseNotConfiguredError:
        return {"id": f"local-event-{doctor_id}", **body}
    return inserted[0] if inserted else body


def list_marketing_events(
    doctor_id: str,
    patient_id: str | None = None,
    event_type: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """List marketing events for a doctor, optionally filtered by patient and type."""
    filters: dict[str, Any] = {"doctor_id": doctor_id}
    if patient_id:
        filters["patient_id"] = patient_id
    if event_type:
        filters["type"] = event_type
    
    try:
        return supabase_client.select(
            "patient_marketing_events",
            filters=filters,
            limit=limit,
            order_by="created_at.desc"
        )
    except SupabaseNotConfiguredError:
        return []


def get_patients_with_upcoming_birthdays(
    doctor_id: str,
    range_type: str = "month",  # today, week, month
) -> list[dict[str, Any]]:
    """
    Get patients with birthdays in the specified range.
    
    This returns patients ordered by how soon their birthday is.
    """
    try:
        # First get all patients with birth dates
        patients = supabase_client.select(
            "patients",
            filters={"doctor_id": doctor_id},
            columns="id,first_name,last_name,phone,birth_date"
        )
    except SupabaseNotConfiguredError:
        return []
    
    if not patients:
        return []
    
    today = date.today()
    results = []
    
    for patient in patients:
        birth_date_str = patient.get("birth_date")
        if not birth_date_str:
            continue
        
        try:
            # Parse birth date
            if isinstance(birth_date_str, str):
                birth_date = date.fromisoformat(birth_date_str)
            else:
                birth_date = birth_date_str
            
            # Calculate this year's birthday
            this_year_birthday = birth_date.replace(year=today.year)
            
            # If birthday has passed this year, use next year
            if this_year_birthday < today:
                this_year_birthday = birth_date.replace(year=today.year + 1)
            
            days_until = (this_year_birthday - today).days
            
            # Filter by range
            include = False
            if range_type == "today" and days_until == 0:
                include = True
            elif range_type == "week" and 0 <= days_until <= 7:
                include = True
            elif range_type == "month" and 0 <= days_until <= 30:
                include = True
            
            if include:
                results.append({
                    **patient,
                    "days_until_birthday": days_until,
                })
        except (ValueError, TypeError):
            continue
    
    # Sort by days until birthday
    results.sort(key=lambda x: x.get("days_until_birthday", 999))
    
    return results
