from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, condecimal


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
  diagnosis: str | None = None
  phone: str | None = None
  status: str | None = None
  birth_date: date | None = None
  segment: str | None = Field(default="regular", description="Patient segment: regular, vip")
  treatment_plan_total: condecimal(max_digits=12, decimal_places=2) | None = None  # type: ignore
  treatment_plan_currency: str | None = Field(default="AMD")


class PatientCreateRequest(PatientBase):
  status: str | None = Field(default="in_progress")


class PatientResponse(PatientBase):
  id: str
  doctor_id: str | None = None
  created_at: datetime | None = None
  marketing_opt_in: bool | None = None


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
  medications: str | None = None


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
  medications: str | None = None


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


class MediaFileResponse(BaseModel):
  id: str
  patient_id: str
  doctor_id: str
  file_name: str
  file_type: str
  file_size: int
  storage_path: str
  storage_bucket: str
  public_url: str
  created_at: datetime | None = None


# Patient Payment Models
class PatientPaymentCreateRequest(BaseModel):
  amount: condecimal(max_digits=12, decimal_places=2, gt=0) = Field(..., description="Payment amount")  # type: ignore
  comment: str | None = Field(default=None, description="Optional payment note")
  visit_id: str | None = Field(default=None, description="Optional visit ID this payment relates to")


class PatientPaymentUpdateRequest(BaseModel):
  amount: condecimal(max_digits=12, decimal_places=2, gt=0) | None = Field(default=None, description="Payment amount")  # type: ignore
  comment: str | None = Field(default=None, description="Payment note")


class PatientPaymentResponse(BaseModel):
  id: str
  patient_id: str
  doctor_id: str
  visit_id: str | None
  amount: Decimal
  currency: str
  paid_at: datetime
  comment: str | None
  created_at: datetime | None


class PatientFinanceSummary(BaseModel):
  treatment_plan_total: Decimal | None = Field(description="Total cost of treatment plan")
  treatment_plan_currency: str = Field(default="AMD")
  total_paid: Decimal = Field(description="Total amount paid so far")
  remaining: Decimal | None = Field(description="Remaining balance (null if no plan set)")


# Marketing Events Models
class MarketingEventCreateRequest(BaseModel):
  patient_id: str = Field(..., description="Patient ID to create marketing event for")
  type: str = Field(..., description="Event type: birthday_greeting, promo_offer, recall_reminder")
  channel: str = Field(default="copy", description="Channel used: copy, telegram")
  payload: dict | None = Field(default=None, description="Additional data: text, discountPercent, etc.")


class MarketingEventResponse(BaseModel):
  id: str
  doctor_id: str
  patient_id: str
  type: str
  channel: str
  payload: dict | None = None
  created_at: datetime | None = None


class PatientBirthdayResponse(BaseModel):
  """Patient with birth date for birthday listings"""
  id: str
  first_name: str
  last_name: str
  phone: str | None = None
  birth_date: date | None = None
  segment: str | None = None
  days_until_birthday: int | None = None


# AI Marketing Models
class AIGenerateRequest(BaseModel):
  """Request for AI-generated marketing text"""
  type: Literal["birthday", "discount", "recall"] = Field(..., description="Type of marketing message")
  language: Literal["am", "ru", "en"] = Field(default="am", description="Language for generated text")
  patient_id: str = Field(..., description="Patient ID")
  discount_percent: int | None = Field(default=None, ge=1, le=50, description="Discount percentage for promo offers")


class AIGenerateResponse(BaseModel):
  """Response with AI-generated marketing text"""
  text: str = Field(..., description="Generated marketing message")
  type: str
  language: str
  segment: str
  char_count: int = Field(..., description="Character count for SMS estimation")

