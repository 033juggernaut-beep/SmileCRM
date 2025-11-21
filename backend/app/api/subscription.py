from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import (
  SubscriptionCreatePaymentRequest,
  SubscriptionCreatePaymentResponse,
  SubscriptionStatusResponse,
)
from app.services import payments_service, subscription_service

router = APIRouter(prefix="/subscription", tags=["subscription"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


@router.get("/", response_model=SubscriptionStatusResponse)
async def get_subscription_status(current_doctor: CurrentDoctor) -> SubscriptionStatusResponse:
  snapshot = subscription_service.get_subscription_status(current_doctor.doctor_id)
  return SubscriptionStatusResponse(**snapshot)


@router.post(
  "/create-payment",
  response_model=SubscriptionCreatePaymentResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_subscription_payment(
  payload: SubscriptionCreatePaymentRequest,
  current_doctor: CurrentDoctor,
) -> SubscriptionCreatePaymentResponse:
  payment = payments_service.create_payment(
    current_doctor.doctor_id,
    payload.provider,
    payload.amount,
    payload.currency,
  )
  return SubscriptionCreatePaymentResponse(**payment)

