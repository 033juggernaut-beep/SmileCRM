from uuid import uuid4

from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.config import Settings, get_settings
from app.models.dto import TelegramAuthResponse
from app.services import doctors_service
from app.services.telegram_auth import TelegramInitDataError, validate_init_data

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/telegram", response_model=TelegramAuthResponse)
async def telegram_auth_post(
  request: Request,
  settings: Settings = Depends(get_settings),
) -> TelegramAuthResponse:
  raw_body = await request.body()
  body_str = raw_body.decode("utf-8", errors="replace")
  if not body_str:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

  parsed = parse_qs(body_str, keep_blank_values=True, encoding="utf-8")
  payload: dict[str, str] = {key: values[0] for key, values in parsed.items() if values}

  if "hash" not in payload:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing hash")
  if "user" not in payload:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing user field")

  try:
    user_info = validate_init_data(body_str, settings.TELEGRAM_BOT_TOKEN)
  except TelegramInitDataError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  doctor = doctors_service.get_by_telegram_user_id(user_info.telegram_user_id)
  doctor_exists = doctor is not None
  access_token = f"mock-token-{uuid4()}"
  return TelegramAuthResponse(doctorExists=doctor_exists, accessToken=access_token)

