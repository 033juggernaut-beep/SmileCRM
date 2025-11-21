from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from .supabase_client import SupabaseNotConfiguredError, supabase_client

DEFAULT_TRIAL_DAYS = 7
DEFAULT_ACTIVE_DAYS = 30


def get_subscription_status(doctor_id: str) -> dict[str, Any]:
  """Return a snapshot of the doctor's subscription state."""
  fallback = _build_fallback_snapshot()
  try:
    rows = supabase_client.select("doctors", filters={"id": doctor_id}, limit=1)
  except SupabaseNotConfiguredError:
    return fallback

  if not rows:
    return fallback

  doctor_row = rows[0]
  status = doctor_row.get("subscription_status") or fallback["status"]
  trial_ends = doctor_row.get("trial_ends_at") or fallback["trialEndsAt"]
  current_period_end = (
    doctor_row.get("subscription_ends_at") or doctor_row.get("current_period_end") or fallback["currentPeriodEnd"]
  )

  return {
    "status": status,
    "trialEndsAt": trial_ends,
    "currentPeriodEnd": current_period_end,
  }


def activate_subscription(doctor_id: str, *, period_days: int = DEFAULT_ACTIVE_DAYS) -> dict[str, Any]:
  """Mark the doctor's subscription as active and extend current period."""
  current_period_end = datetime.now(timezone.utc) + timedelta(days=period_days)
  values = {
    "subscription_status": "active",
    "subscription_ends_at": current_period_end.isoformat(),
  }

  try:
    updated = supabase_client.update("doctors", filters={"id": doctor_id}, values=values)
  except SupabaseNotConfiguredError:
    return {"doctor_id": doctor_id, "status": "active", "currentPeriodEnd": current_period_end}

  row = updated[0] if updated else {"doctor_id": doctor_id}
  row.setdefault("doctor_id", doctor_id)
  row["status"] = "active"
  row["currentPeriodEnd"] = row.get("subscription_ends_at") or current_period_end
  return row


def _build_fallback_snapshot() -> dict[str, Any]:
  now = datetime.now(timezone.utc)
  return {
    "status": "trial",
    "trialEndsAt": now + timedelta(days=DEFAULT_TRIAL_DAYS),
    "currentPeriodEnd": None,
  }
