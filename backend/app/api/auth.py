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
  """
  Extract initData from various request body formats.
  
  Supports:
  1. JSON payload: {"initData": "query_id=...&user=...&hash=..."}
  2. Query string (native Telegram): query_id=...&user=...&hash=...
  3. Form data: initData=query_id%3D...
  """
  print(f"[AUTH] Raw body length: {len(raw_body)}")
  if not raw_body:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

  body_str = raw_body.decode("utf-8", errors="replace").strip()
  print(f"[AUTH] Body string preview: {body_str[:200]}")
  if not body_str:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

  # 1. Try JSON payload first (most common from frontend)
  if body_str.startswith("{"):
    try:
      json_payload = json.loads(body_str)
      if isinstance(json_payload, dict):
        init_data = json_payload.get("initData") or json_payload.get("init_data")
        if init_data and isinstance(init_data, str):
          print(f"[AUTH] ✅ Extracted initData from JSON payload")
          print(f"[AUTH] initData preview: {init_data[:100]}...")
          return init_data
        else:
          print(f"[AUTH] ❌ JSON payload missing initData field. Keys: {list(json_payload.keys())}")
          raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"initData field is missing or invalid. Found keys: {list(json_payload.keys())}"
          )
    except json.JSONDecodeError:
      print(f"[AUTH] ⚠️  Body starts with '{{' but is not valid JSON, trying other formats...")
      pass  # Fall through to try other formats

  # 2. Try query string format (native Telegram or form-encoded)
  parsed = parse_qs(body_str, keep_blank_values=True, encoding="utf-8")
  payload: dict[str, str] = {key: values[0] for key, values in parsed.items() if values}

  # 2a. Check if it's a native Telegram payload (query_id=...&user=...&hash=...)
  if payload and "hash" in payload and "user" in payload and "auth_date" in payload:
    print("[AUTH] ✅ Detected native Telegram query string format")
    return body_str

  # 2b. Check if it's form-encoded with initData key
  init_data = payload.get("initData") or payload.get("init_data")
  if init_data:
    print("[AUTH] ✅ Extracted initData from form-encoded payload")
    return init_data

  # No valid format found
  print(f"[AUTH] ❌ Unsupported payload format")
  raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Unsupported payload format; expected JSON with initData or query string."
  )


@router.post("/telegram", response_model=TelegramAuthResponse)
async def telegram_auth_post(
  request: Request,
  settings: Settings = Depends(get_settings),
) -> TelegramAuthResponse:
  raw_body = await request.body()
  init_data_payload = _extract_init_data(raw_body)

  print(f"[AUTH] Validating initData (length: {len(init_data_payload)})")
  try:
    user_info = validate_init_data(init_data_payload, settings.TELEGRAM_BOT_TOKEN)
    print(f"[AUTH] Validation successful! User ID: {user_info.telegram_user_id}")
  except TelegramInitDataError as exc:
    print(f"[AUTH] Validation failed: {exc}")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  doctor = doctors_service.get_by_telegram_user_id(user_info.telegram_user_id)
  doctor_exists = doctor is not None
  access_token = f"mock-token-{uuid4()}"
  return TelegramAuthResponse(doctorExists=doctor_exists, accessToken=access_token)

