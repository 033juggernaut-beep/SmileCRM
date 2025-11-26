"""JWT token generation and validation service."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt import InvalidTokenError

from app.config import get_settings

settings = get_settings()

# Use TELEGRAM_BOT_TOKEN as JWT secret (or add dedicated JWT_SECRET_KEY to config)
JWT_SECRET_KEY = settings.TELEGRAM_BOT_TOKEN
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30  # 30 days for Mini App tokens


class JWTError(Exception):
  """Base exception for JWT errors."""


class TokenExpiredError(JWTError):
  """Raised when JWT token has expired."""


class InvalidTokenFormatError(JWTError):
  """Raised when JWT token format is invalid."""


def generate_access_token(doctor_id: str, telegram_user_id: int) -> str:
  """
  Generate JWT access token for authenticated doctor.
  
  Args:
    doctor_id: Doctor UUID
    telegram_user_id: Telegram user ID
    
  Returns:
    JWT token string
  """
  now = datetime.now(timezone.utc)
  expires_at = now + timedelta(days=JWT_EXPIRATION_DAYS)
  
  payload: dict[str, Any] = {
    "doctor_id": doctor_id,
    "telegram_user_id": telegram_user_id,
    "iat": now,  # issued at
    "exp": expires_at,  # expiration
  }
  
  token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
  return token


def decode_access_token(token: str) -> dict[str, Any]:
  """
  Decode and validate JWT access token.
  
  Args:
    token: JWT token string
    
  Returns:
    Decoded payload with doctor_id and telegram_user_id
    
  Raises:
    TokenExpiredError: If token has expired
    InvalidTokenFormatError: If token format is invalid
  """
  try:
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    return payload
  except jwt.ExpiredSignatureError as exc:
    raise TokenExpiredError("JWT token has expired") from exc
  except (InvalidTokenError, ValueError) as exc:
    raise InvalidTokenFormatError("Invalid JWT token format") from exc


def verify_doctor_token(token: str) -> tuple[str, int]:
  """
  Verify JWT token and extract doctor_id and telegram_user_id.
  
  Args:
    token: JWT token string
    
  Returns:
    Tuple of (doctor_id, telegram_user_id)
    
  Raises:
    JWTError: If token is invalid or expired
  """
  payload = decode_access_token(token)
  
  doctor_id = payload.get("doctor_id")
  telegram_user_id = payload.get("telegram_user_id")
  
  if not doctor_id or not telegram_user_id:
    raise InvalidTokenFormatError("Token missing required fields")
  
  return str(doctor_id), int(telegram_user_id)

