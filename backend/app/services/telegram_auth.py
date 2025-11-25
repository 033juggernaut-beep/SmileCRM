from __future__ import annotations

import hashlib
import hmac
import json
from urllib.parse import parse_qsl

from app.models.dto import TelegramUserInfo


class TelegramInitDataError(ValueError):
  """Raised when Telegram init data cannot be validated."""


def validate_init_data(init_data: str, bot_token: str) -> TelegramUserInfo:
  """
  Validate Telegram WebApp initData according to official documentation:
  https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  
  Algorithm:
  1. Parse init_data query string into dict
  2. Extract and save 'hash' parameter
  3. Build data_check_string from remaining params (sorted alphabetically by key)
  4. secret_key = HMAC_SHA256("WebAppData", bot_token)
  5. calculated_hash = HMAC_SHA256(secret_key, data_check_string) in hex
  6. Compare calculated_hash with received hash (case-insensitive, timing-safe)
  """
  print(f"[AUTH] ========== VALIDATE INIT DATA (NEW ALGORITHM) ==========")
  
  # Validation: empty init_data
  if not init_data:
    print(f"[AUTH] ❌ ERROR: Empty init_data")
    raise TelegramInitDataError("Empty init_data")
  
  # Validation: empty bot_token
  if not bot_token:
    print(f"[AUTH] ❌ ERROR: Bot token is not configured")
    raise TelegramInitDataError("Bot token is not configured")
  
  # Log token suffix for verification (last 8 chars only)
  token_suffix = bot_token[-8:] if len(bot_token) >= 8 else "***"
  print(f"[AUTH] Token suffix: ...{token_suffix}")
  print(f"[AUTH] Init data length: {len(init_data)}")
  
  # Step 1: Parse query string into dict
  # init_data format: key1=value1&key2=value2&hash=...
  try:
    parsed = dict(parse_qsl(init_data, keep_blank_values=True, strict_parsing=True, encoding="utf-8"))
  except ValueError as exc:
    print(f"[AUTH] ❌ ERROR: Failed to parse init_data as query string")
    raise TelegramInitDataError("Init data is not a valid query string") from exc
  
  if not parsed:
    print(f"[AUTH] ❌ ERROR: Parsed init_data is empty")
    raise TelegramInitDataError("Init data payload is empty")
  
  print(f"[AUTH] Parsed parameters: {list(parsed.keys())}")
  
  # Step 2: Extract hash from parameters
  if "hash" not in parsed:
    print(f"[AUTH] ❌ ERROR: No 'hash' parameter found in init_data")
    raise TelegramInitDataError("Missing hash in init_data")
  
  received_hash = parsed.pop("hash")
  print(f"[AUTH] Hash extracted: {received_hash[:10]}... (length: {len(received_hash)})")
  
  # Step 3: Build data_check_string from remaining params (sorted alphabetically by key)
  # Format: key1=value1\nkey2=value2\n...
  print(f"[AUTH_HASH] Building data_check_string from {len(parsed)} parameters:")
  data_check_pairs = []
  for key in sorted(parsed.keys()):
    value = parsed[key]
    value_preview = value[:50] + "..." if len(value) > 50 else value
    print(f"[AUTH_HASH]   {key} = {value_preview}")
    data_check_pairs.append(f"{key}={value}")
  
  data_check_string = "\n".join(data_check_pairs)
  
  # Log data_check_string (truncate if too long)
  if len(data_check_string) > 200:
    print(f"[AUTH_HASH] data_check_string (truncated): {data_check_string[:200]}...")
  else:
    print(f"[AUTH_HASH] data_check_string: {data_check_string}")
  
  # Step 4: Calculate secret_key = HMAC_SHA256("WebAppData", bot_token)
  # CRITICAL: For Telegram WebApp, the key is "WebAppData" (not bot_token directly)
  print(f"[AUTH_HASH] Calculating secret_key = HMAC_SHA256('WebAppData', bot_token)")
  secret_key = hmac.new(
    key=b"WebAppData",
    msg=bot_token.encode("utf-8"),
    digestmod=hashlib.sha256,
  ).digest()
  
  # Step 5: Calculate hash = HMAC_SHA256(secret_key, data_check_string) in hex
  print(f"[AUTH_HASH] Calculating hash = HMAC_SHA256(secret_key, data_check_string)")
  calculated_hash = hmac.new(
    key=secret_key,
    msg=data_check_string.encode("utf-8"),
    digestmod=hashlib.sha256,
  ).hexdigest()
  
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
    raise TelegramInitDataError("Init data hash mismatch")
  
  print(f"[AUTH] ✅ Hash validation PASSED")
  
  # Extract and parse user info from 'user' field (JSON string)
  raw_user = parsed.get("user")
  if not raw_user:
    print(f"[AUTH] ❌ ERROR: Missing 'user' field in init_data")
    raise TelegramInitDataError("Missing user field in init_data")
  
  try:
    user_data = json.loads(raw_user)
  except json.JSONDecodeError as exc:
    print(f"[AUTH] ❌ ERROR: Invalid user JSON in init_data")
    raise TelegramInitDataError("Invalid user JSON in init_data") from exc
  
  # Validate required fields
  telegram_user_id = user_data.get("id")
  if telegram_user_id is None:
    print(f"[AUTH] ❌ ERROR: Missing user id in init_data")
    raise TelegramInitDataError("Missing user id in init_data")
  
  first_name = user_data.get("first_name")
  if not first_name:
    print(f"[AUTH] ❌ ERROR: Missing user first_name in init_data")
    raise TelegramInitDataError("Missing user first_name in init_data")
  
  # Build TelegramUserInfo
  user_info = TelegramUserInfo(
    telegram_user_id=int(telegram_user_id),
    first_name=str(first_name),
    last_name=user_data.get("last_name"),
    username=user_data.get("username"),
    language_code=user_data.get("language_code"),
    raw_data=user_data,
  )
  
  print(f"[AUTH] ✅ User authenticated: ID={user_info.telegram_user_id}, name={user_info.first_name}")
  print(f"[AUTH] ==========================================")
  
  return user_info
