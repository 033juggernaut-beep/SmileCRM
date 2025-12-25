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
  notes: str | None = Field(default=None, description="Doctor notes for the patient")
  treatment_plan_total: condecimal(max_digits=12, decimal_places=2) | None = None  # type: ignore
  treatment_plan_currency: str | None = Field(default="AMD")
  telegram_username: str | None = Field(default=None, description="Telegram username without @")
  whatsapp_phone: str | None = Field(default=None, description="WhatsApp phone number")


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
  visit_time: str | None = Field(default=None, description="Time of visit in HH:MM format")
  next_visit_date: date | None = None
  notes: str | None = None
  medications: str | None = None


class VisitCreateRequest(VisitBase):
  pass


class VisitResponse(VisitBase):
  id: str
  doctor_id: str | None = None
  patient_id: str
  status: str = Field(default="scheduled", description="Visit status")
  status_changed_at: datetime | None = None
  status_note: str | None = None
  rescheduled_to: date | None = None
  rescheduled_time: str | None = None
  reminder_status: str | None = None
  reminder_sent_at: datetime | None = None
  reminder_channel: str | None = None
  created_at: datetime | None = None


class VisitWithPatientResponse(VisitResponse):
  """Visit response with embedded patient data"""
  patient: "PatientSummary | None" = None


class PatientSummary(BaseModel):
  """Minimal patient info for embedding in visit responses"""
  id: str
  first_name: str
  last_name: str
  phone: str | None = None
  telegram_user_id: int | None = None
  telegram_username: str | None = None
  whatsapp_phone: str | None = None


class VisitUpdateRequest(BaseModel):
  visit_date: date | None = None
  visit_time: str | None = None
  next_visit_date: date | None = None
  notes: str | None = None
  medications: str | None = None


class VisitStatusUpdateRequest(BaseModel):
  """Request to update visit status"""
  status: Literal["scheduled", "in_progress", "completed", "no_show", "rescheduled"] = Field(
    ..., description="New status for the visit"
  )
  note: str | None = Field(default=None, description="Optional note about status change")
  rescheduled_to: date | None = Field(default=None, description="Required if status is 'rescheduled'")
  rescheduled_time: str | None = Field(default=None, description="Optional time for rescheduled visit (HH:MM)")


class TodayVisitsResponse(BaseModel):
  """Response for today's visits endpoint"""
  date: date
  count: int
  visits: list[VisitWithPatientResponse]


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


# Patient Medication Models
class MedicationCreateRequest(BaseModel):
  """Request for creating a new medication prescription"""
  name: str = Field(..., min_length=1, description="Medication name")
  dosage: str | None = Field(default=None, description="Dosage instructions")
  comment: str | None = Field(default=None, description="Doctor's notes")


class MedicationResponse(BaseModel):
  """Response with medication details"""
  id: str
  patient_id: str
  doctor_id: str
  name: str
  dosage: str | None = None
  comment: str | None = None
  created_at: datetime | None = None
