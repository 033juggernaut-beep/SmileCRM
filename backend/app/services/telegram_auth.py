from __future__ import annotations

import hashlib
import hmac
import json
from urllib.parse import parse_qsl

from app.models.dto import TelegramUserInfo


class TelegramInitDataError(ValueError):
  """Raised when Telegram init data cannot be validated."""


def _parse_query(init_data: str) -> dict[str, str]:
  if not init_data:
    raise TelegramInitDataError("Init data payload is empty.")
  try:
    parsed_items = dict(parse_qsl(init_data, keep_blank_values=True, strict_parsing=True, encoding="utf-8"))
  except ValueError as exc:
    raise TelegramInitDataError("Init data is not a valid query string.") from exc
  if not parsed_items:
    raise TelegramInitDataError("Init data payload is empty.")
  return parsed_items


def _build_data_check_string(data: dict[str, str]) -> str:
  sorted_items = sorted(data.items())
  return "\n".join(f"{key}={value}" for key, value in sorted_items)


def _verify_hash(data: dict[str, str], received_hash: str | None, bot_token: str) -> None:
  if not received_hash:
    raise TelegramInitDataError("Hash is missing in init data.")
  if not bot_token:
    raise TelegramInitDataError("Telegram bot token is not configured.")

  data_check_string = _build_data_check_string(data)
  # For Telegram Web App, use "WebAppData" constant as per official docs
  # https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  secret_key = hmac.new("WebAppData".encode(), bot_token.encode(), hashlib.sha256).digest()
  expected_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()

  if not hmac.compare_digest(expected_hash, received_hash):
    raise TelegramInitDataError("Init data hash mismatch.")


def _extract_user_info(raw_user: str | None) -> TelegramUserInfo:
  if not raw_user:
    raise TelegramInitDataError("User payload is missing in init data.")
  try:
    user_payload = json.loads(raw_user)
  except json.JSONDecodeError as exc:
    raise TelegramInitDataError("User payload is not a valid JSON object.") from exc

  telegram_user_id = user_payload.get("id")
  first_name = user_payload.get("first_name")

  if telegram_user_id is None or first_name is None:
    raise TelegramInitDataError("User payload does not contain required fields.")

  return TelegramUserInfo(
    telegram_user_id=int(telegram_user_id),
    first_name=str(first_name),
    last_name=user_payload.get("last_name"),
    username=user_payload.get("username"),
  )


def validate_init_data(init_data: str, bot_token: str) -> TelegramUserInfo:
  """Validate Telegram init data and extract user information."""
  data = _parse_query(init_data)
  received_hash = data.pop("hash", None)
  _verify_hash(data, received_hash, bot_token)
  return _extract_user_info(data.get("user"))

