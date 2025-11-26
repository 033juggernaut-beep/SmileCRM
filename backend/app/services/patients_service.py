from __future__ import annotations

from typing import Any, Mapping

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_patients(doctor_id: str | None = None) -> list[dict[str, Any]]:
  """Return all patients or only those that belong to a doctor if doctor_id is provided."""
  if doctor_id:
    return list_by_doctor(doctor_id)
  try:
    return supabase_client.select("patients")
  except SupabaseNotConfiguredError:
    return []


def list_by_doctor(doctor_id: str) -> list[dict[str, Any]]:
  """Fetch every patient assigned to a doctor."""
  try:
    return supabase_client.select("patients", filters={"doctor_id": doctor_id})
  except SupabaseNotConfiguredError:
    return []


def get_patient(patient_id: str) -> dict[str, Any] | None:
  """Fetch a single patient by primary key."""
  try:
    rows = supabase_client.select("patients", filters={"id": patient_id}, limit=1)
  except SupabaseNotConfiguredError:
    return None
  return rows[0] if rows else None


def update_patient(patient_id: str, doctor_id: str, update_data: dict[str, Any]) -> dict[str, Any]:
  """Update patient information."""
  try:
    updated = supabase_client.update(
      "patients",
      filters={"id": patient_id, "doctor_id": doctor_id},
      values=update_data
    )
  except SupabaseNotConfiguredError:
    # Fallback for local dev without Supabase
    return {"id": patient_id, "doctor_id": doctor_id, **update_data}
  
  if not updated:
    # If no rows updated, return the existing patient
    existing = get_patient(patient_id)
    return existing or {"id": patient_id, "doctor_id": doctor_id, **update_data}
  
  return updated[0]


def create_patient(doctor_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  """Create a patient that belongs to the provided doctor_id."""
  body = {"doctor_id": doctor_id, **payload}
  try:
    inserted = supabase_client.insert("patients", body)
  except SupabaseNotConfiguredError:
    return {"id": f"local-patient-{doctor_id}", **body}
  return inserted[0] if inserted else body

