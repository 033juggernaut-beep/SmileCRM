from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header, HTTPException, status


DEFAULT_TEST_DOCTOR_ID = "00000000-0000-0000-0000-000000000001"


@dataclass(slots=True)
class AuthenticatedDoctor:
  doctor_id: str
  token: str


def get_current_doctor(authorization: str | None = Header(default=None)) -> AuthenticatedDoctor:
  """Extract doctor context from a Bearer token (currently a stub)."""
  if not authorization:
    return AuthenticatedDoctor(doctor_id=DEFAULT_TEST_DOCTOR_ID, token="stub-token")

  scheme, _, credentials = authorization.partition(" ")
  if scheme.lower() != "bearer" or not credentials:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization scheme.")

  doctor_id = DEFAULT_TEST_DOCTOR_ID
  if ":" in credentials:
    prefix, _, tail = credentials.partition(":")
    if prefix == "doctor" and tail:
      doctor_id = tail

  return AuthenticatedDoctor(doctor_id=doctor_id, token=credentials)


