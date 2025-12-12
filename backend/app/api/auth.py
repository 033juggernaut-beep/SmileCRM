"""
Telegram Mini App authentication endpoint.
Validates Telegram initData and issues JWT tokens.
"""
import json
import logging
from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.config import Settings, get_settings
from app.models.dto import TelegramAuthResponse
from app.services import doctors_service
from app.services.jwt_service import generate_access_token
from app.services.telegram_auth import TelegramInitDataError, validate_init_data

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("smilecrm.auth")


def _extract_init_data(raw_body: bytes) -> str:
    """
    Extract initData from various request body formats.
    
    Supports:
    1. JSON payload: {"initData": "query_id=...&user=...&hash=..."}
    2. Query string (native Telegram): query_id=...&user=...&hash=...
    3. Form data: initData=query_id%3D...
    
    Returns:
        Extracted initData string
        
    Raises:
        HTTPException: If body is empty or format is not supported
    """
    logger.debug("Processing auth request body (length: %d)", len(raw_body))
    
    if not raw_body:
        logger.warning("Auth request received with empty body")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

    body_str = raw_body.decode("utf-8", errors="replace").strip()
    if not body_str:
        logger.warning("Auth request body is empty after decoding")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty body")

    # 1. Try JSON payload first (most common from frontend)
    if body_str.startswith("{"):
        try:
            json_payload = json.loads(body_str)
            if isinstance(json_payload, dict):
                init_data = json_payload.get("initData") or json_payload.get("init_data")
                if init_data and isinstance(init_data, str):
                    logger.debug("Extracted initData from JSON payload")
                    return init_data
                else:
                    keys = list(json_payload.keys())
                    logger.warning("JSON payload missing initData field. Keys: %s", keys)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"initData field is missing or invalid. Found keys: {keys}"
                    )
        except json.JSONDecodeError:
            logger.debug("Body starts with '{' but is not valid JSON, trying other formats")

    # 2. Try query string format (native Telegram or form-encoded)
    parsed = parse_qs(body_str, keep_blank_values=True, encoding="utf-8")
    payload: dict[str, str] = {key: values[0] for key, values in parsed.items() if values}

    # 2a. Check if it's a native Telegram payload (query_id=...&user=...&hash=...)
    if payload and "hash" in payload and "user" in payload and "auth_date" in payload:
        logger.debug("Detected native Telegram query string format")
        return body_str

    # 2b. Check if it's form-encoded with initData key
    init_data = payload.get("initData") or payload.get("init_data")
    if init_data:
        logger.debug("Extracted initData from form-encoded payload")
        return init_data

    # No valid format found
    logger.warning("Unsupported auth payload format")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported payload format; expected JSON with initData or query string."
    )


@router.post("/telegram", response_model=TelegramAuthResponse)
async def telegram_auth_post(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> TelegramAuthResponse:
    """
    Authenticate user via Telegram Mini App initData.
    
    Validates the cryptographic signature from Telegram and returns
    a JWT token for subsequent API calls.
    
    Returns:
        TelegramAuthResponse with:
        - doctorExists: whether doctor profile exists
        - accessToken: JWT for API authentication
    """
    raw_body = await request.body()
    init_data_payload = _extract_init_data(raw_body)

    logger.info("Validating Telegram initData (length: %d)", len(init_data_payload))
    
    try:
        user_info = validate_init_data(init_data_payload, settings.TELEGRAM_BOT_TOKEN)
        logger.info("Auth successful for Telegram user ID: %d", user_info.telegram_user_id)
    except TelegramInitDataError as exc:
        logger.warning("Auth validation failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    doctor = doctors_service.get_by_telegram_user_id(user_info.telegram_user_id)
    doctor_exists = doctor is not None
    
    # Generate real JWT token
    if doctor and isinstance(doctor, dict):
        doctor_id = doctor.get("id")
        logger.info("Existing doctor found: %s", doctor_id)
    else:
        # If doctor doesn't exist, return without token (will register later)
        doctor_id = None
        logger.info("No doctor profile found, user needs to register")
    
    # Generate JWT token (use doctor_id if exists, otherwise use telegram_user_id as placeholder)
    token_doctor_id = doctor_id if doctor_id else f"telegram-{user_info.telegram_user_id}"
    access_token = generate_access_token(token_doctor_id, user_info.telegram_user_id)
    
    return TelegramAuthResponse(doctorExists=doctor_exists, accessToken=access_token)
