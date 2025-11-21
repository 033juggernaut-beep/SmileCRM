from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.config import Settings, get_settings
from app.models.dto import TelegramAuthRequest, TelegramAuthResponse
from app.services import doctors_service
from app.services.telegram_auth import TelegramInitDataError, validate_init_data

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/telegram", response_model=TelegramAuthResponse)
async def telegram_auth_post(
  payload: TelegramAuthRequest,
  settings: Settings = Depends(get_settings),
) -> TelegramAuthResponse:
  try:
    user_info = validate_init_data(payload.init_data, settings.TELEGRAM_BOT_TOKEN)
  except TelegramInitDataError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  doctor = doctors_service.get_by_telegram_user_id(user_info.telegram_user_id)
  doctor_exists = doctor is not None
  access_token = f"mock-token-{uuid4()}"
  return TelegramAuthResponse(doctorExists=doctor_exists, accessToken=access_token)

