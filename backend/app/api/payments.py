from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.services import payments_service, subscription_service

router = APIRouter(tags=["payments"])
logger = logging.getLogger(__name__)


@router.post("/webhook/payments/idram")
async def webhook_idram(payload: dict[str, Any]) -> dict[str, Any]:
  return _handle_webhook(provider="idram", payload=payload)


@router.post("/webhook/payments/idbank")
async def webhook_idbank(payload: dict[str, Any]) -> dict[str, Any]:
  return _handle_webhook(provider="idbank", payload=payload)


def _handle_webhook(provider: str, payload: dict[str, Any]) -> dict[str, Any]:
  logger.info("Received %s webhook: %s", provider, payload)
  external_payment_id = (
    payload.get("external_payment_id")
    or payload.get("externalPaymentId")
    or payload.get("payment_id")
    or payload.get("paymentId")
  )
  if not external_payment_id:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST, detail="external_payment_id (or payment_id) is required."
    )

  payment = payments_service.mark_payment_paid_by_external_id(external_payment_id)
  if not payment:
    logger.warning("Payment %s not found for provider %s", external_payment_id, provider)
    return {
      "ok": False,
      "provider": provider,
      "error": "payment_not_found",
      "externalPaymentId": external_payment_id,
    }

  doctor_id = payment.get("doctor_id")
  subscription = None
  if doctor_id:
    subscription = subscription_service.activate_subscription(doctor_id)

  return {
    "ok": True,
    "provider": provider,
    "payment": payment,
    "subscription": subscription,
  }

