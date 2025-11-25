from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class DoctorDTO(BaseModel):
  id: str
  first_name: str
  last_name: str


class PatientDTO(BaseModel):
  id: str
  first_name: str
  last_name: str
  diagnosis: str


class PatientBase(BaseModel):
  first_name: str
  last_name: str
  diagnosis: str
  phone: str | None = None
  status: str | None = None


class PatientCreateRequest(PatientBase):
  status: str | None = Field(default="in_progress")


class PatientResponse(PatientBase):
  id: str
  doctor_id: str | None = None
  created_at: datetime | None = None


class TelegramUserInfo(BaseModel):
  telegram_user_id: int = Field(..., description="Unique Telegram user identifier")
  first_name: str
  last_name: str | None = None
  username: str | None = None
  language_code: str | None = None
  raw_data: dict | None = None


class TelegramAuthRequest(BaseModel):
  init_data: str = Field(..., min_length=1, description="Raw initData string from Telegram WebApp")


class TelegramAuthResponse(BaseModel):
  doctorExists: bool
  accessToken: str


class VisitBase(BaseModel):
  visit_date: date
  next_visit_date: date | None = None
  notes: str | None = None


class VisitCreateRequest(VisitBase):
  pass


class VisitResponse(VisitBase):
  id: str
  doctor_id: str | None = None
  patient_id: str
  created_at: datetime | None = None


class VisitUpdateRequest(BaseModel):
  visit_date: date | None = None
  next_visit_date: date | None = None
  notes: str | None = None


class SubscriptionStatusResponse(BaseModel):
  status: Literal["trial", "active", "expired"]
  trialEndsAt: datetime | None = None
  currentPeriodEnd: datetime | None = None


class SubscriptionCreatePaymentRequest(BaseModel):
  provider: Literal["idram", "idbank"]
  amount: int = Field(..., gt=0)
  currency: str = Field(default="AMD", min_length=3, max_length=3)


class SubscriptionCreatePaymentResponse(BaseModel):
  paymentId: str
  paymentUrl: str
  status: str
  provider: str
  amount: int
  currency: str
  externalPaymentId: str

