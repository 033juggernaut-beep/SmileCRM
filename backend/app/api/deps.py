from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from fastapi import Header, HTTPException, status

from app.config import get_settings
from app.services import doctors_service
from app.services.jwt_service import JWTError, verify_doctor_token


@dataclass(slots=True)
class AuthenticatedDoctor:
  doctor_id: str
  telegram_user_id: int
  token: str


def get_current_doctor(authorization: str | None = Header(default=None)) -> AuthenticatedDoctor:
  """
  Extract and validate doctor from JWT Bearer token.
  
  Also checks if doctor has active trial or subscription.
  
  Raises:
    HTTP 401: If token is missing or invalid
    HTTP 402: If trial/subscription expired
  """
  if not authorization:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Authorization header is required"
    )
  
  # Extract Bearer token
  scheme, _, token = authorization.partition(" ")
  if scheme.lower() != "bearer" or not token:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid authorization scheme. Use 'Bearer <token>'"
    )
  
  # Verify JWT token
  try:
    doctor_id, telegram_user_id = verify_doctor_token(token)
  except JWTError as exc:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail=f"Invalid or expired token: {exc}"
    ) from exc
  
  # Get doctor from database
  try:
    doctor = doctors_service.get_by_id(doctor_id)
  except Exception:
    # If doctor not found by UUID, try telegram_user_id (for backward compatibility)
    doctor = doctors_service.get_by_telegram_user_id(telegram_user_id)
  
  if not doctor:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Doctor not found"
    )
  
  # Check subscription status (skip in development if configured)
  settings = get_settings()
  if not settings.SKIP_SUBSCRIPTION_CHECK:
    _check_subscription_status(doctor)
  
  return AuthenticatedDoctor(
    doctor_id=doctor_id,
    telegram_user_id=telegram_user_id,
    token=token
  )


def _check_subscription_status(doctor: dict) -> None:
  """
  Check if doctor has active trial or subscription.
  
  Raises:
    HTTP 402: If trial/subscription expired
  """
  subscription_status = doctor.get("subscription_status", "trial")
  now = datetime.now(timezone.utc)
  
  # Check trial
  if subscription_status == "trial":
    trial_ends_at = doctor.get("trial_ends_at")
    if not trial_ends_at:
      # No trial_ends_at set - allow access (shouldn't happen, but handle gracefully)
      return
    
    # Parse trial_ends_at (could be string or datetime)
    if isinstance(trial_ends_at, str):
      from datetime import datetime as dt
      trial_ends_at = dt.fromisoformat(trial_ends_at.replace("Z", "+00:00"))
    
    if now > trial_ends_at:
      raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Trial period expired. Please subscribe to continue using the app."
      )
    return
  
  # Check active subscription
  if subscription_status == "active":
    subscription_ends_at = doctor.get("subscription_ends_at")
    if not subscription_ends_at:
      # No end date - allow access
      return
    
    # Parse subscription_ends_at
    if isinstance(subscription_ends_at, str):
      from datetime import datetime as dt
      subscription_ends_at = dt.fromisoformat(subscription_ends_at.replace("Z", "+00:00"))
    
    if now > subscription_ends_at:
      raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Subscription expired. Please renew to continue using the app."
      )
    return
  
  # If status is neither 'trial' nor 'active', deny access
  if subscription_status in ("expired", "canceled"):
    raise HTTPException(
      status_code=status.HTTP_402_PAYMENT_REQUIRED,
      detail="No active subscription. Please subscribe to continue using the app."
    )
