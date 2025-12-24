from __future__ import annotations

import logging
from typing import Any

from .supabase_client import SupabaseNotConfiguredError, supabase_client

logger = logging.getLogger(__name__)


def list_by_patient(patient_id: str, doctor_id: str) -> list[dict[str, Any]]:
    """Fetch all medications for a patient belonging to a specific doctor."""
    try:
        return supabase_client.select(
            "patient_medications",
            filters={"patient_id": patient_id, "doctor_id": doctor_id}
        )
    except SupabaseNotConfiguredError:
        return []


def create_medication(
    patient_id: str,
    doctor_id: str,
    name: str,
    dosage: str | None = None,
    comment: str | None = None,
) -> dict[str, Any]:
    """Create a new medication prescription for a patient."""
    body = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "name": name,
        "dosage": dosage,
        "comment": comment,
    }
    logger.info(f"Creating medication for patient {patient_id}: {name}")
    try:
        inserted = supabase_client.insert("patient_medications", body)
    except SupabaseNotConfiguredError:
        return {"id": f"local-med-{patient_id}", **body}
    except Exception as e:
        logger.error(f"Failed to create medication: {e}")
        raise
    return inserted[0] if inserted else body


def get_medication(medication_id: str) -> dict[str, Any] | None:
    """Fetch a single medication by ID."""
    try:
        rows = supabase_client.select(
            "patient_medications",
            filters={"id": medication_id},
            limit=1
        )
    except SupabaseNotConfiguredError:
        return None
    return rows[0] if rows else None

