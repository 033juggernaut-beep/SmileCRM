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
  """
  Build data_check_string according to Telegram docs:
  - Sort all key-value pairs alphabetically by key
  - Join them as "key=value" with newline separator
  """
  sorted_items = sorted(data.items())
  print(f"[AUTH_HASH] Building data_check_string from {len(sorted_items)} parameters:")
  for key, value in sorted_items:
    value_preview = value[:50] + "..." if len(value) > 50 else value
    print(f"[AUTH_HASH]   {key} = {value_preview}")
  return "\n".join(f"{key}={value}" for key, value in sorted_items)


def _verify_hash(data: dict[str, str], received_hash: str | None, bot_token: str) -> None:
  """
  Verify hash according to Telegram Web App documentation:
  https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  
  Algorithm:
  1. Parse init_data into dict (already done)
  2. Extract and save hash (already done)
  3. Build data_check_string from remaining params (sorted alphabetically)
  4. secret_key = HMAC_SHA256("WebAppData", bot_token)
  5. calculated_hash = HMAC_SHA256(secret_key, data_check_string) in hex
  6. Compare calculated_hash with received hash (case-insensitive)
  """
  if not received_hash:
    raise TelegramInitDataError("Hash is missing in init data.")
  if not bot_token:
    raise TelegramInitDataError("Telegram bot token is not configured.")

  # Log last 8 chars of token for verification (safe)
  token_suffix = bot_token[-8:] if len(bot_token) >= 8 else "***"
  print(f"[AUTH_HASH] Using TELEGRAM_BOT_TOKEN suffix: ...{token_suffix}")

  # Step 3: Build data_check_string from sorted params (alphabetically by key)
  data_check_string = _build_data_check_string(data)
  
  # Log data_check_string (truncate if too long)
  if len(data_check_string) > 200:
    print(f"[AUTH_HASH] data_check_string (truncated): {data_check_string[:200]}...")
  else:
    print(f"[AUTH_HASH] data_check_string: {data_check_string}")
  
  # Step 4: Calculate secret_key = HMAC_SHA256("WebAppData", bot_token)
  secret_key = hmac.new("WebAppData".encode(), bot_token.encode(), hashlib.sha256).digest()
  
  # Step 5: Calculate hash = HMAC_SHA256(secret_key, data_check_string) in hex
  calculated_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
  
  # Log hashes (first 10 chars for comparison)
  print(f"[AUTH_HASH] received_hash:   {received_hash[:10]}... (length: {len(received_hash)})")
  print(f"[AUTH_HASH] calculated_hash: {calculated_hash[:10]}... (length: {len(calculated_hash)})")
  
  # Step 6: Compare hashes (case-insensitive, timing-safe)
  # Normalize both to lowercase for comparison
  received_hash_lower = received_hash.lower()
  calculated_hash_lower = calculated_hash.lower()
  
  if not hmac.compare_digest(calculated_hash_lower, received_hash_lower):
    print(f"[AUTH_HASH] ❌ HASH MISMATCH!")
    print(f"[AUTH_HASH] Full received:   {received_hash}")
    print(f"[AUTH_HASH] Full calculated: {calculated_hash}")
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
  """
  Validate Telegram Mini App init data and extract user information.
  
  According to: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  """
  # Log token suffix for debugging (last 8 chars only)
  token_suffix = bot_token[-8:] if bot_token and len(bot_token) >= 8 else "none"
  print(f"[AUTH] ========== VALIDATE INIT DATA ==========")
  print(f"[AUTH] Token suffix: ...{token_suffix}")
  print(f"[AUTH] Init data length: {len(init_data)}")
  
  # Step 1: Parse query string into dict
  data = _parse_query(init_data)
  print(f"[AUTH] Parsed parameters: {list(data.keys())}")
  
  # Step 2: Extract hash from parameters
  received_hash = data.pop("hash", None)
  if not received_hash:
    print(f"[AUTH] ❌ ERROR: No 'hash' parameter found in init_data")
    raise TelegramInitDataError("Hash is missing in init data.")
  
  print(f"[AUTH] Hash extracted: {received_hash[:10]}...")
  
  # Step 3-6: Verify hash (detailed logging inside _verify_hash)
  try:
    _verify_hash(data, received_hash, bot_token)
    print(f"[AUTH] ✅ Hash validation PASSED")
  except TelegramInitDataError as e:
    print(f"[AUTH] ❌ Hash validation FAILED: {e}")
    raise
  
  # Extract user info
  user_info = _extract_user_info(data.get("user"))
  print(f"[AUTH] ✅ User authenticated: ID={user_info.telegram_user_id}, name={user_info.first_name}")
  print(f"[AUTH] ==========================================")
  
  return user_info

