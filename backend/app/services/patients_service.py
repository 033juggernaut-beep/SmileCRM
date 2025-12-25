from __future__ import annotations

import logging
from datetime import date
from decimal import Decimal
from typing import Any, Mapping

from .supabase_client import SupabaseNotConfiguredError, supabase_client

logger = logging.getLogger(__name__)


def _serialize_for_json(data: dict[str, Any]) -> dict[str, Any]:
  """Convert Decimal and date objects for JSON serialization."""
  result = {}
  for key, value in data.items():
    if isinstance(value, Decimal):
      result[key] = float(value)
    elif isinstance(value, date):
      result[key] = value.isoformat()  # Convert date to YYYY-MM-DD string
    else:
      result[key] = value
  return result


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
  # Serialize Decimal and date objects for JSON
  serialized_data = _serialize_for_json(update_data)
  logger.info(f"Updating patient {patient_id}: {serialized_data}")
  try:
    updated = supabase_client.update(
      "patients",
      filters={"id": patient_id, "doctor_id": doctor_id},
      values=serialized_data
    )
  except SupabaseNotConfiguredError:
    # Fallback for local dev without Supabase
    return {"id": patient_id, "doctor_id": doctor_id, **update_data}
  except Exception as e:
    logger.error(f"Failed to update patient {patient_id}: {e}")
    raise
  
  if not updated:
    # If no rows updated, return the existing patient
    existing = get_patient(patient_id)
    return existing or {"id": patient_id, "doctor_id": doctor_id, **update_data}
  
  return updated[0]


def create_patient(doctor_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
  """Create a patient that belongs to the provided doctor_id."""
  body = {"doctor_id": doctor_id, **payload}
  # Serialize Decimal and date objects for JSON
  serialized_body = _serialize_for_json(body)
  logger.info(f"Creating patient with payload: {serialized_body}")
  try:
    inserted = supabase_client.insert("patients", serialized_body)
    logger.info(f"Patient created: {inserted}")
  except SupabaseNotConfiguredError:
    return {"id": f"local-patient-{doctor_id}", **serialized_body}
  return inserted[0] if inserted else serialized_body

