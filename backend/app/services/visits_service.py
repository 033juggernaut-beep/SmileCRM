from __future__ import annotations

from datetime import date, datetime
from typing import Any, Mapping

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def _serialize_dates(data: dict[str, Any]) -> dict[str, Any]:
  """Convert date/datetime objects to ISO format strings for JSON serialization."""
  result = {}
  for key, value in data.items():
    if isinstance(value, datetime):
      result[key] = value.isoformat()
    elif isinstance(value, date):
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


def create_visit(doctor_id: str, patient_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  """Insert a new visit row."""
  body = {"doctor_id": doctor_id, "patient_id": patient_id, **payload}
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


