from uuid import uuid4

import json
from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.config import Settings, get_settings
from app.models.dto import TelegramAuthResponse
from app.services import doctors_service
from app.services.telegram_auth import TelegramInitDataError, validate_init_data

router = APIRouter(prefix="/auth", tags=["auth"])


def _extract_init_data(raw_body: bytes) -> str:
  if not raw_body:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

  body_str = raw_body.decode("utf-8", errors="replace").strip()
  if not body_str:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

  parsed = parse_qs(body_str, keep_blank_values=True, encoding="utf-8")
  payload: dict[str, str] = {key: values[0] for key, values in parsed.items() if values}

  # Native Telegram payload (hash+user pairs) – return raw body as is.
  if payload and "hash" in payload and "user" in payload:
    return body_str

  # Form payload that wraps init data under initData/init_data keys.
  init_data = payload.get("initData") or payload.get("init_data")
  if init_data:
    return init_data

  # JSON payload (used by the frontend mini app).
  try:
    json_payload = json.loads(body_str)
  except json.JSONDecodeError as exc:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Unsupported payload format; expected initData query string.",
    ) from exc

  if not isinstance(json_payload, dict):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="JSON payload must be an object.")

  init_data = json_payload.get("initData") or json_payload.get("init_data")
  if not init_data or not isinstance(init_data, str):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="initData field is missing or invalid.")

  return init_data


@router.post("/telegram", response_model=TelegramAuthResponse)
async def telegram_auth_post(
  request: Request,
  settings: Settings = Depends(get_settings),
) -> TelegramAuthResponse:
  raw_body = await request.body()
  init_data_payload = _extract_init_data(raw_body)

  try:
    user_info = validate_init_data(init_data_payload, settings.TELEGRAM_BOT_TOKEN)
  except TelegramInitDataError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  doctor = doctors_service.get_by_telegram_user_id(user_info.telegram_user_id)
  doctor_exists = doctor is not None
  access_token = f"mock-token-{uuid4()}"
  return TelegramAuthResponse(doctorExists=doctor_exists, accessToken=access_token)

