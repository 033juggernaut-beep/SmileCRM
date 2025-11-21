from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status

from app.services.supabase_client import SupabaseNotConfiguredError, SupabaseRequestError, supabase_client

logger = logging.getLogger(__name__)

PAYMENT_URL_TEMPLATE = "https://example.com/pay/{external_payment_id}"


def list_payment_methods() -> list[str]:
  return ["idram", "idbank"]


def create_payment(doctor_id: str, provider: str, amount: int, currency: str) -> dict[str, Any]:
  external_payment_id = f"{provider}-{uuid4().hex}"
  payment_record = {
    "doctor_id": doctor_id,
    "provider": provider,
    "external_payment_id": external_payment_id,
    "amount": amount,
    "currency": currency,
    "status": "pending",
  }

  try:
    rows = supabase_client.insert("payments", payment_record)
  except (SupabaseNotConfiguredError, SupabaseRequestError) as exc:  # pragma: no cover - network interaction
    logger.exception("Failed to insert payment into Supabase.")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Supabase insert failed: {exc.original_error or exc}",
    ) from exc

  if not rows:
    logger.error("Supabase returned empty payload for payment insert. record=%s", payment_record)
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Supabase insert returned no rows",
    )

  row = rows[0]
  return {
    "paymentId": row.get("id"),
    "paymentUrl": _build_payment_url(external_payment_id),
    "status": row.get("status", "pending"),
    "provider": row.get("provider", provider),
    "amount": row.get("amount", amount),
    "currency": row.get("currency", currency),
    "externalPaymentId": row.get("external_payment_id", external_payment_id),
  }


def mark_payment_paid_by_external_id(external_payment_id: str) -> dict[str, Any] | None:
  values = {
    "status": "paid",
    "paid_at": datetime.now(timezone.utc).isoformat(),
  }

  try:
    rows = supabase_client.update(
      "payments",
      filters={"external_payment_id": external_payment_id},
      values=values,
    )
  except (SupabaseNotConfiguredError, SupabaseRequestError) as exc:  # pragma: no cover
    logger.exception("Failed to update payment %s in Supabase.", external_payment_id)
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Supabase update failed: {exc.original_error or exc}",
    ) from exc

  if not rows:
    return None

  row = rows[0]
  row.update(values)
  return row


def _build_payment_url(external_payment_id: str) -> str:
  return PAYMENT_URL_TEMPLATE.format(external_payment_id=external_payment_id)

