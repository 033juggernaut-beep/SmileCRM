from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config import Settings, get_settings
from app.services import doctors_service
from app.services.telegram_auth import TelegramInitDataError, validate_init_data

router = APIRouter(prefix="/doctors", tags=["doctors"])


class DoctorRegisterRequest(BaseModel):
  """Request body for doctor registration."""
  firstName: str = Field(..., min_length=1)
  lastName: str = Field(..., min_length=1)
  specialization: str = Field(..., min_length=1)
  phone: str = Field(..., min_length=1)
  clinicName: str = Field(..., min_length=1)
  initData: str | None = None


class DoctorRegisterResponse(BaseModel):
  """Response for doctor registration."""
  token: str
  doctor_id: str


@router.get("/")
async def list_doctors_stub() -> dict[str, bool]:
  return {"ok": True}


@router.post("/register", response_model=DoctorRegisterResponse)
async def register_doctor(
  request: DoctorRegisterRequest,
  settings: Settings = Depends(get_settings),
) -> DoctorRegisterResponse:
  """
  Register a new doctor using Telegram Mini App initData + form data.
  
  Steps:
  1. Validate initData to get Telegram user info
  2. Check if doctor already exists
  3. Create doctor record in database
  4. Return access token
  """
  print(f"[REGISTER] Doctor registration request received")
  print(f"[REGISTER] firstName={request.firstName}, lastName={request.lastName}")
  print(f"[REGISTER] specialization={request.specialization}, phone={request.phone}")
  print(f"[REGISTER] clinicName={request.clinicName}")
  
  # Validate Telegram initData
  if not request.initData:
    print(f"[REGISTER] ❌ ERROR: No initData provided")
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="initData is required for registration"
    )
  
  try:
    user_info = validate_init_data(request.initData, settings.TELEGRAM_BOT_TOKEN)
    print(f"[REGISTER] ✅ Telegram user validated: ID={user_info.telegram_user_id}")
  except TelegramInitDataError as exc:
    print(f"[REGISTER] ❌ initData validation failed: {exc}")
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"Invalid initData: {exc}"
    ) from exc
  
  # Check if doctor already exists
  existing_doctor = doctors_service.get_by_telegram_user_id(user_info.telegram_user_id)
  if existing_doctor:
    print(f"[REGISTER] ⚠️  Doctor already exists: ID={existing_doctor.get('id')}")
    # Return existing doctor with new token
    access_token = f"token-{uuid4()}"
    return DoctorRegisterResponse(
      token=access_token,
      doctor_id=existing_doctor["id"],
    )
  
  # Create new doctor
  form_data = {
    "first_name": request.firstName,
    "last_name": request.lastName,
    "specialization": request.specialization,
    "phone": request.phone,
    "clinic_name": request.clinicName,
  }
  
  try:
    new_doctor = doctors_service.create_doctor_from_telegram_and_form(
      telegram_user=user_info,
      form_data=form_data,
    )
    print(f"[REGISTER] ✅ Doctor created: ID={new_doctor.get('id')}")
    print(f"[REGISTER] Trial period: 7 days from {new_doctor.get('trial_started_at')}")
  except Exception as exc:
    print(f"[REGISTER] ❌ ERROR: Failed to create doctor: {exc}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to create doctor record"
    ) from exc
  
  # Generate access token
  access_token = f"token-{uuid4()}"
  print(f"[REGISTER] ✅ Registration complete! Doctor ID={new_doctor.get('id')}")
  
  return DoctorRegisterResponse(
    token=access_token,
    doctor_id=new_doctor["id"],
  )
