from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.services.supabase_client import (
  SupabaseNotConfiguredError,
  SupabaseRequestError,
  supabase_client,
)

router = APIRouter(tags=["test"])


@router.get("/test-supabase")
async def test_supabase_insert() -> dict[str, Any]:
  """Temporary endpoint that inserts a dummy doctor row into Supabase."""
  now = datetime.now(timezone.utc)
  telegram_user_id = int(now.timestamp() * 1_000_000)

  payload = {
    "telegram_user_id": telegram_user_id,
    "first_name": "Test",
    "last_name": f"Doctor-{now.strftime('%H%M%S')}",
    "specialization": "test-specialization",
    "phone": "+0000000000",
    "clinic_name": "Test Clinic",
    "trial_started_at": now.isoformat(),
    "trial_ends_at": (now + timedelta(days=7)).isoformat(),
    "subscription_status": "trial",
  }

  try:
    inserted = supabase_client.insert("doctors", payload)
  except SupabaseNotConfiguredError:
    return {
      "status": "supabase_not_configured",
      "payload": payload,
    }
  except SupabaseRequestError as exc:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail={"message": str(exc), "payload": exc.payload},
    ) from exc

  return {"inserted": inserted}


@router.get("/test-select")
async def test_supabase_select() -> dict[str, Any]:
  """Temporary endpoint that selects all doctors from Supabase."""
  try:
    rows = supabase_client.select("doctors")
  except SupabaseNotConfiguredError:
    return {"status": "supabase_not_configured", "rows": []}
  except SupabaseRequestError as exc:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail={"message": str(exc), "payload": exc.payload},
    ) from exc

  return {"rows": rows}


