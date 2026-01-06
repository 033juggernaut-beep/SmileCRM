from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Mapping

from app.models.dto import TelegramUserInfo

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_doctors() -> list[dict[str, Any]]:
  """Fetch every doctor record available in Supabase."""
  try:
    return supabase_client.select("doctors")
  except SupabaseNotConfiguredError:
    return []


def get_by_telegram_user_id(telegram_user_id: int) -> dict[str, Any] | None:
  """Return the first doctor matched by telegram_user_id or None."""
  try:
    rows = supabase_client.select(
      "doctors",
      filters={"telegram_user_id": telegram_user_id},
      limit=1,
    )
  except SupabaseNotConfiguredError:
    return None
  return rows[0] if rows else None


def get_by_id(doctor_id: str) -> dict[str, Any] | None:
  """Return doctor by UUID or None."""
  try:
    rows = supabase_client.select(
      "doctors",
      filters={"id": doctor_id},
      limit=1,
    )
  except SupabaseNotConfiguredError:
    return None
  return rows[0] if rows else None


def get_by_id_with_clinic(doctor_id: str) -> dict[str, Any] | None:
  """
  Return doctor by UUID with clinic name included.
  
  Uses the clinics table join to get clinic name.
  """
  doctor = get_by_id(doctor_id)
  if not doctor:
    return None
  
  # If doctor has clinic_id, fetch clinic name
  if doctor.get("clinic_id"):
    try:
      clinic_rows = supabase_client.select(
        "clinics",
        columns=["name"],
        filters={"id": doctor["clinic_id"]},
        limit=1,
      )
      if clinic_rows:
        doctor["clinic_name_from_table"] = clinic_rows[0].get("name")
    except SupabaseNotConfiguredError:
      pass
  
  return doctor


def list_doctors_by_clinic(clinic_id: str) -> list[dict[str, Any]]:
  """List all doctors in a specific clinic."""
  try:
    return supabase_client.select(
      "doctors",
      columns=["id", "first_name", "last_name", "specialization", "clinic_id", "clinic_name"],
      filters={"clinic_id": clinic_id},
    )
  except SupabaseNotConfiguredError:
    return []


def get_doctor_clinic_id(doctor_id: str) -> str | None:
  """Get the clinic_id for a doctor."""
  doctor = get_by_id(doctor_id)
  if doctor:
    return doctor.get("clinic_id")
  return None


def create_doctor_from_telegram_and_form(
  telegram_user: TelegramUserInfo,
  form_data: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
  """Insert a new doctor row using Telegram info combined with a registration form."""
  form_data = dict(form_data or {})
  trial_started_at = form_data.get("trial_started_at")
  trial_ends_at = form_data.get("trial_ends_at")
  if trial_started_at is None or trial_ends_at is None:
    now = datetime.now(timezone.utc)
    trial_started_at = now.isoformat()
    trial_ends_at = (now + timedelta(days=7)).isoformat()

  payload: dict[str, Any] = {
    "telegram_user_id": telegram_user.telegram_user_id,
    "first_name": form_data.get("first_name") or telegram_user.first_name,
    "last_name": form_data.get("last_name") or telegram_user.last_name,
    "specialization": form_data.get("specialization"),
    "phone": form_data.get("phone"),
    "clinic_name": form_data.get("clinic_name"),
    "trial_started_at": trial_started_at,
    "trial_ends_at": trial_ends_at,
    "subscription_status": form_data.get("subscription_status", "trial"),
    "subscription_ends_at": form_data.get("subscription_ends_at"),
  }

  compact_payload = {key: value for key, value in payload.items() if value is not None}

  try:
    inserted = supabase_client.insert("doctors", compact_payload)
  except SupabaseNotConfiguredError:
    # When Supabase is not wired yet, return a stub so the API can continue working.
    return {"id": f"local-doctor-{telegram_user.telegram_user_id}", **compact_payload}

  return inserted[0] if inserted else compact_payload

