from __future__ import annotations

from typing import Any, Mapping

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_by_patient(patient_id: str) -> list[dict[str, Any]]:
  """Return every visit for a given patient."""
  try:
    return supabase_client.select("visits", filters={"patient_id": patient_id})
  except SupabaseNotConfiguredError:
    return []


def create_visit(doctor_id: str, patient_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  """Insert a new visit row."""
  body = {"doctor_id": doctor_id, "patient_id": patient_id, **payload}
  try:
    inserted = supabase_client.insert("visits", body)
  except SupabaseNotConfiguredError:
    return {"id": f"local-visit-{patient_id}", **body}
  return inserted[0] if inserted else body


def update_visit(visit_id: str, values: Mapping[str, Any]) -> dict[str, Any] | None:
  """Update visit fields and return the updated row or None if not found."""
  if not values:
    raise ValueError("Visit update payload cannot be empty.")
  try:
    updated = supabase_client.update("visits", filters={"id": visit_id}, values=dict(values))
  except SupabaseNotConfiguredError:
    return {"id": visit_id, **values}
  return updated[0] if updated else None


