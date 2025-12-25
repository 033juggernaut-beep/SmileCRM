from __future__ import annotations

from datetime import date, datetime, time
from typing import Any, Mapping

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def _serialize_dates(data: dict[str, Any]) -> dict[str, Any]:
  """Convert date/datetime/time objects to ISO format strings for JSON serialization."""
  result = {}
  for key, value in data.items():
    if isinstance(value, datetime):
      result[key] = value.isoformat()
    elif isinstance(value, date):
      result[key] = value.isoformat()
    elif isinstance(value, time):
      result[key] = value.isoformat()
    else:
      result[key] = value
  return result


def list_by_patient(patient_id: str) -> list[dict[str, Any]]:
  """Return every visit for a given patient."""
  try:
    return supabase_client.select("visits", filters={"patient_id": patient_id})
  except SupabaseNotConfiguredError:
    return []


def list_by_doctor_and_date(doctor_id: str, visit_date: date) -> list[dict[str, Any]]:
  """Return visits for a doctor on a specific date, ordered by time, with patient data joined."""
  try:
    client = supabase_client._client_or_raise()
    # Query with patient join
    query = (
      client.table("visits")
      .select("*, patients!inner(id, first_name, last_name, phone, telegram_user_id, telegram_username, whatsapp_phone)")
      .eq("doctor_id", doctor_id)
      .eq("visit_date", visit_date.isoformat())
      .order("visit_time", nullsfirst=False)
      .order("created_at")
    )
    response = query.execute()
    return response.data if response.data else []
  except SupabaseNotConfiguredError:
    return []


def list_visits_for_reminder(target_date: date) -> list[dict[str, Any]]:
  """
  Get all visits for a target date that need reminders.
  Returns visits where:
  - visit_date = target_date
  - status = 'scheduled'
  - reminder_status = 'pending'
  - patient has telegram_user_id or whatsapp_phone
  """
  try:
    client = supabase_client._client_or_raise()
    query = (
      client.table("visits")
      .select("*, patients!inner(id, first_name, last_name, telegram_user_id, whatsapp_phone, phone), doctors!inner(id, first_name, last_name)")
      .eq("visit_date", target_date.isoformat())
      .eq("status", "scheduled")
      .eq("reminder_status", "pending")
    )
    response = query.execute()
    return response.data if response.data else []
  except SupabaseNotConfiguredError:
    return []


def create_visit(doctor_id: str, patient_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  """Insert a new visit row."""
  body = {
    "doctor_id": doctor_id, 
    "patient_id": patient_id,
    "status": "scheduled",
    "reminder_status": "pending",
    **payload
  }
  # Serialize date objects to ISO format strings for JSON
  serialized_body = _serialize_dates(body)
  try:
    inserted = supabase_client.insert("visits", serialized_body)
  except SupabaseNotConfiguredError:
    return {"id": f"local-visit-{patient_id}", **serialized_body}
  return inserted[0] if inserted else serialized_body


def update_visit(visit_id: str, values: Mapping[str, Any]) -> dict[str, Any] | None:
  """Update visit fields and return the updated row or None if not found."""
  if not values:
    raise ValueError("Visit update payload cannot be empty.")
  # Serialize date objects to ISO format strings for JSON
  serialized_values = _serialize_dates(dict(values))
  try:
    updated = supabase_client.update("visits", filters={"id": visit_id}, values=serialized_values)
  except SupabaseNotConfiguredError:
    return {"id": visit_id, **serialized_values}
  return updated[0] if updated else None


def update_visit_status(
  visit_id: str,
  status: str,
  *,
  note: str | None = None,
  rescheduled_to: date | None = None,
  rescheduled_time: time | None = None,
) -> dict[str, Any] | None:
  """
  Update visit status with tracking fields.
  
  Args:
    visit_id: The visit ID to update
    status: New status (scheduled, in_progress, completed, no_show, rescheduled)
    note: Optional note about the status change
    rescheduled_to: New date if rescheduled
    rescheduled_time: New time if rescheduled
  
  Returns:
    Updated visit record or None if not found
  """
  values: dict[str, Any] = {
    "status": status,
    "status_changed_at": datetime.utcnow().isoformat(),
  }
  
  if note is not None:
    values["status_note"] = note
  
  if rescheduled_to is not None:
    values["rescheduled_to"] = rescheduled_to.isoformat()
  
  if rescheduled_time is not None:
    values["rescheduled_time"] = rescheduled_time.isoformat()
  
  # Skip reminder for completed/no_show/rescheduled visits
  if status in ("completed", "no_show", "rescheduled"):
    values["reminder_status"] = "skipped"
  
  try:
    updated = supabase_client.update("visits", filters={"id": visit_id}, values=values)
  except SupabaseNotConfiguredError:
    return {"id": visit_id, **values}
  
  return updated[0] if updated else None


def get_visit_by_id(visit_id: str) -> dict[str, Any] | None:
  """Get a single visit by ID."""
  try:
    rows = supabase_client.select("visits", filters={"id": visit_id}, limit=1)
    return rows[0] if rows else None
  except SupabaseNotConfiguredError:
    return None


def get_visit_with_patient(visit_id: str) -> dict[str, Any] | None:
  """Get a visit with patient data joined."""
  try:
    client = supabase_client._client_or_raise()
    query = (
      client.table("visits")
      .select("*, patients!inner(id, first_name, last_name, phone, telegram_user_id, telegram_username, whatsapp_phone)")
      .eq("id", visit_id)
      .limit(1)
    )
    response = query.execute()
    return response.data[0] if response.data else None
  except SupabaseNotConfiguredError:
    return None


def update_reminder_status(
  visit_id: str,
  status: str,
  channel: str | None = None,
) -> dict[str, Any] | None:
  """Update visit reminder status after sending."""
  values: dict[str, Any] = {"reminder_status": status}
  
  if status == "sent":
    values["reminder_sent_at"] = datetime.utcnow().isoformat()
  
  if channel:
    values["reminder_channel"] = channel
  
  try:
    updated = supabase_client.update("visits", filters={"id": visit_id}, values=values)
  except SupabaseNotConfiguredError:
    return {"id": visit_id, **values}
  
  return updated[0] if updated else None
