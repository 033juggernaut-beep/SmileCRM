"""
Voice AI Service - Whisper STT + LLM parsing with strict validation
"""
import json
import logging
import re
from datetime import date, datetime, timedelta
from typing import Any, Literal
from zoneinfo import ZoneInfo

from openai import OpenAI

from app.config import get_settings

logger = logging.getLogger(__name__)

# Type aliases
VoiceMode = Literal["visit", "diagnosis", "payment", "message"]
Locale = Literal["ru", "hy", "en"]


class VoiceServiceError(Exception):
    """Voice service error"""
    pass


class VoiceNotConfiguredError(VoiceServiceError):
    """Voice AI is not configured"""
    pass


class VoiceParseResult:
    """Result of voice parsing"""
    
    def __init__(
        self,
        text: str,
        visit_date: str | None = None,
        next_visit_date: str | None = None,
        diagnosis: str | None = None,
        notes: str | None = None,
        amount: float | None = None,
        currency: str | None = None,
        warnings: list[str] | None = None,
    ):
        self.text = text
        self.visit_date = visit_date
        self.next_visit_date = next_visit_date
        self.diagnosis = diagnosis
        self.notes = notes
        self.amount = amount
        self.currency = currency
        self.warnings = warnings or []
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "visit_date": self.visit_date,
            "next_visit_date": self.next_visit_date,
            "diagnosis": self.diagnosis,
            "notes": self.notes,
            "amount": self.amount,
            "currency": self.currency,
        }


# System prompts are now in app/services/prompts/voice_system_prompts.py
# This module uses get_voice_system_prompt() and build_voice_user_message() from there


def _get_openai_client() -> OpenAI:
    """Get OpenAI client"""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise VoiceNotConfiguredError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _validate_date(
    date_str: str | None,
    today: date,
    max_future_days: int = 365,
) -> tuple[str | None, list[str]]:
    """
    Validate and normalize a date string.
    
    Returns (normalized_date, warnings)
    """
    warnings: list[str] = []
    
    if not date_str:
        return None, warnings
    
    # Try to parse the date
    try:
        parsed = date.fromisoformat(date_str)
    except (ValueError, TypeError):
        warnings.append(f"Неверный формат даты: {date_str}")
        return None, warnings
    
    # Check if date is too far in the past (more than 30 days)
    if parsed < today - timedelta(days=30):
        warnings.append(f"Дата слишком далеко в прошлом: {date_str}")
        return None, warnings
    
    # Check if date is too far in the future
    if parsed > today + timedelta(days=max_future_days):
        warnings.append(f"Дата слишком далеко в будущем (>{max_future_days} дней): {date_str}")
        return None, warnings
    
    return parsed.isoformat(), warnings


def _normalize_amount(amount_val: Any) -> float | None:
    """Normalize amount to float or None"""
    if amount_val is None:
        return None
    
    if isinstance(amount_val, (int, float)):
        return float(amount_val) if amount_val > 0 else None
    
    if isinstance(amount_val, str):
        # Remove currency symbols and spaces
        cleaned = re.sub(r'[^\d.,]', '', amount_val)
        cleaned = cleaned.replace(',', '.')
        try:
            val = float(cleaned)
            return val if val > 0 else None
        except ValueError:
            return None
    
    return None


# Currency tokens for normalization
# AMD = Armenian Dram (Armenian: dram, Russian: драм)
AMD_TOKENS = [
    "dram", "drams", "drm",  # Latin/English
    "драм", "драма", "драмов", "драму", "драме", "драмах",  # Russian
    "amd",  # Currency code
]
RUB_TOKENS = [
    "руб", "рублей", "рубля", "рубль",  # Russian
    "ruble", "rubles", "rub",  # English
]


def normalize_currency(
    text: str,
    locale: str = "ru",
    timezone: str = "Asia/Yerevan",
) -> tuple[str | None, str, list[str]]:
    """
    Normalize currency from transcribed text.
    
    Args:
        text: Transcribed text
        locale: User locale (hy/ru/en)
        timezone: User timezone
    
    Returns:
        Tuple of (currency, corrected_text, warnings)
    """
    warnings: list[str] = []
    text_lower = text.lower()
    corrected_text = text
    
    # Check for AMD tokens
    has_amd = any(token in text_lower for token in AMD_TOKENS)
    
    # Check for RUB tokens
    has_rub = any(token in text_lower for token in RUB_TOKENS)
    
    # Case 1: Both AMD and RUB found (STT error - likely misheard "драм" as "рублей")
    if has_amd and has_rub:
        # AMD takes priority - this is likely an STT error
        currency = "AMD"
        # Correct the text - replace RUB tokens with correct Armenian
        for rub_token in RUB_TOKENS:
            pattern = re.compile(re.escape(rub_token) + r'\w*', re.IGNORECASE)
            if pattern.search(corrected_text):
                corrected_text = pattern.sub('դрам', corrected_text)
        warnings.append("Валюта исправлена на AMD (драм)")
        return currency, corrected_text, warnings
    
    # Case 2: Only AMD tokens found
    if has_amd:
        return "AMD", corrected_text, warnings
    
    # Case 3: Only RUB tokens found
    if has_rub:
        return "RUB", corrected_text, warnings
    
    # Case 4: No currency found - use defaults based on locale/timezone
    if timezone == "Asia/Yerevan" or locale == "hy":
        return "AMD", corrected_text, warnings
    
    # No currency detected
    return None, corrected_text, warnings


def correct_currency_in_text(text: str, locale: str, timezone: str) -> tuple[str, str | None, list[str]]:
    """
    Pre-process text before LLM to fix currency recognition errors.
    
    Returns:
        Tuple of (corrected_text, detected_currency, warnings)
    """
    currency, corrected_text, warnings = normalize_currency(text, locale, timezone)
    return corrected_text, currency, warnings


def transcribe_audio(
    audio_bytes: bytes,
    locale: Locale = "ru",
    filename: str = "audio.webm",
    language: str | None = None,
) -> str:
    """
    Transcribe audio using OpenAI Whisper.
    
    Args:
        audio_bytes: Raw audio data
        locale: Language hint (ru/hy/en) - DEPRECATED, use language
        filename: Original filename with extension
        language: Explicit Whisper language code (hy/ru/en/None for auto)
    
    Returns:
        Transcribed text
    """
    client = _get_openai_client()
    settings = get_settings()
    
    # Map locale to Whisper language code if language not provided
    # Whisper uses ISO 639-1 codes: 'hy' for Armenian, 'ru' for Russian, 'en' for English
    if language is None:
        language_map = {
            "ru": "ru",
            "hy": "hy",  # Armenian ISO 639-1
            "en": "en",
        }
        whisper_language = language_map.get(locale, "ru")
    else:
        whisper_language = language
    
    logger.info(
        f"[STT] Transcribing audio: size={len(audio_bytes)} bytes, "
        f"locale={locale}, whisper_lang={whisper_language}, file={filename}"
    )
    
    try:
        # Create a file-like object for the API
        response = client.audio.transcriptions.create(
            model=settings.AI_MODEL_STT,
            file=(filename, audio_bytes),
            language=whisper_language,
            response_format="text",
        )
        
        text = response.strip() if isinstance(response, str) else str(response).strip()
        
        # Log transcript (without audio data)
        logger.info(f"[STT] Transcription complete: locale={locale}, length={len(text)}")
        logger.debug(f"[STT] Transcript preview: {text[:150]}...")
        
        return text
        
    except Exception as e:
        logger.error(f"[STT] Whisper transcription failed: {e}")
        raise VoiceServiceError(f"Speech recognition failed: {e}")


def parse_voice_text(
    text: str,
    mode: VoiceMode,
    timezone: str = "Asia/Yerevan",
    today_override: str | None = None,
    locale: Locale = "ru",
) -> VoiceParseResult:
    """
    Parse transcribed text using LLM to extract structured data.
    
    Uses proper system/user message separation:
    - System message: Language-specific parsing instructions
    - User message: Transcript with context (dates, timezone, mode)
    
    Args:
        text: Transcribed speech text
        mode: Parsing mode (visit/diagnosis/payment/message)
        timezone: Timezone for date calculations
        today_override: Optional override for today's date (YYYY-MM-DD)
        locale: Response language (hy/ru/en)
    
    Returns:
        VoiceParseResult with extracted data
    """
    from app.services.armenian_normalizer import postprocess_voice_data
    from app.services.prompts import get_voice_system_prompt, build_voice_user_message
    
    client = _get_openai_client()
    settings = get_settings()
    
    logger.info(f"[LLM] Parsing voice text: mode={mode}, locale={locale}, timezone={timezone}")
    logger.debug(f"[LLM] Input text: {text[:200]}...")
    
    # Pre-process text for currency normalization (before LLM)
    corrected_text, pre_detected_currency, currency_warnings = correct_currency_in_text(
        text, locale, timezone
    )
    
    # Determine default currency based on locale/timezone
    default_currency = "AMD" if (timezone == "Asia/Yerevan" or locale == "hy") else "AMD"
    
    # Calculate dates
    try:
        tz = ZoneInfo(timezone)
    except Exception:
        tz = ZoneInfo("Asia/Yerevan")
    
    if today_override:
        try:
            today = date.fromisoformat(today_override)
        except ValueError:
            today = datetime.now(tz).date()
    else:
        today = datetime.now(tz).date()
    
    tomorrow = today + timedelta(days=1)
    day_after = today + timedelta(days=2)
    
    # Get language-specific system prompt (single source of truth)
    system_prompt = get_voice_system_prompt(locale)
    
    # Build user message with transcript and context
    user_message = build_voice_user_message(
        transcript=corrected_text,
        mode=mode,
        today_iso=today.isoformat(),
        tomorrow_iso=tomorrow.isoformat(),
        day_after_iso=day_after.isoformat(),
        timezone=timezone,
    )
    
    logger.debug(f"[LLM] System prompt length: {len(system_prompt)}")
    logger.debug(f"[LLM] User message preview: {user_message[:300]}...")
    
    try:
        # Use proper system/user message separation
        response = client.chat.completions.create(
            model=settings.AI_MODEL_TEXT,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,  # Low temperature for consistency
            max_tokens=800,
        )
        
        content = response.choices[0].message.content
        if not content:
            raise VoiceServiceError("Empty response from LLM")
        
        # Parse JSON response
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"[LLM] Failed to parse response as JSON: {content}")
            raise VoiceServiceError(f"Invalid JSON from LLM: {e}")
        
        logger.info(f"[LLM] Raw parsed data: {data}")
        
        # Extract data from new structured format (if using new schema)
        # The new schema has nested objects: visit, payment, patient, etc.
        visit_data = data.get("visit", {}) if isinstance(data.get("visit"), dict) else {}
        payment_data = data.get("payment", {}) if isinstance(data.get("payment"), dict) else {}
        
        # Flatten data for postprocessing (merge old and new formats)
        flat_data = {
            "visit_date": visit_data.get("visit_date") or data.get("visit_date"),
            "next_visit_date": visit_data.get("next_visit_date") or data.get("next_visit_date"),
            "diagnosis": data.get("diagnosis"),
            "notes": visit_data.get("notes") or data.get("notes"),
            "amount": payment_data.get("amount") or data.get("amount"),
            "currency": payment_data.get("currency") or data.get("currency"),
        }
        
        # Replace date tokens with actual dates
        for date_field in ["visit_date", "next_visit_date"]:
            if flat_data.get(date_field):
                val = str(flat_data[date_field])
                if "TODAY" in val:
                    flat_data[date_field] = today.isoformat()
                elif "TOMORROW" in val:
                    flat_data[date_field] = tomorrow.isoformat()
        
        # Apply Armenian-aware postprocessing
        postprocessed_data, postprocess_warnings = postprocess_voice_data(
            transcript=text,
            parsed_data=flat_data,
            locale=locale,
            timezone=timezone,
            today=today,
        )
        
        # Validate and normalize
        warnings: list[str] = []
        
        # Add currency correction warnings from pre-processing
        warnings.extend(currency_warnings)
        warnings.extend(postprocess_warnings)
        
        # Validate dates
        visit_date, date_warnings = _validate_date(postprocessed_data.get("visit_date"), today)
        warnings.extend(date_warnings)
        
        next_visit_date, next_warnings = _validate_date(postprocessed_data.get("next_visit_date"), today)
        warnings.extend(next_warnings)
        
        # Get normalized amount from postprocessor
        amount = postprocessed_data.get("amount")
        if amount is not None:
            amount = _normalize_amount(amount)
        
        # Get currency - priority: postprocessed > pre-detected > LLM > default
        currency = postprocessed_data.get("currency")
        if not currency and pre_detected_currency:
            currency = pre_detected_currency
        elif not currency and amount:
            currency = default_currency
        
        # Log action from new schema if present
        action = data.get("action", "unknown")
        confidence = data.get("confidence", 0.5)
        
        # GUARD: Only allow payment amount for payment actions
        # Numbers in visit/diagnosis/note commands are dates, not money
        if action in ("create_visit", "update_visit", "add_note", "update_patient", "set_diagnosis"):
            if amount is not None:
                logger.info(f"[LLM] Clearing amount={amount} for non-payment action={action}")
                amount = None
                currency = None
        
        logger.info(f"[LLM] Parsed: action={action}, confidence={confidence:.2f}, visit_date={visit_date}, amount={amount}, currency={currency}")
        
        return VoiceParseResult(
            text=text,  # Return original text, not corrected
            visit_date=visit_date,
            next_visit_date=next_visit_date,
            diagnosis=postprocessed_data.get("diagnosis"),
            notes=postprocessed_data.get("notes"),
            amount=amount,
            currency=currency,
            warnings=warnings,
        )
        
    except VoiceServiceError:
        raise
    except Exception as e:
        logger.error(f"[LLM] Parsing failed: {e}")
        raise VoiceServiceError(f"AI parsing failed: {e}")


def process_voice(
    audio_bytes: bytes,
    mode: VoiceMode,
    timezone: str = "Asia/Yerevan",
    locale: Locale = "ru",
    today_override: str | None = None,
    filename: str = "audio.webm",
) -> VoiceParseResult:
    """
    Full voice processing pipeline: STT -> LLM parsing -> Armenian postprocessing -> validation.
    
    Args:
        audio_bytes: Raw audio data
        mode: Parsing mode
        timezone: Timezone for date calculations
        locale: Language (hy/ru/en)
        today_override: Optional today date override
        filename: Audio filename with extension
    
    Returns:
        VoiceParseResult with transcription and extracted data
    """
    logger.info(
        f"[VOICE] Processing voice input: mode={mode}, locale={locale}, "
        f"timezone={timezone}, audio_size={len(audio_bytes)} bytes"
    )
    
    # Step 1: Transcribe audio with locale-specific language hint
    # Map 'hy' locale to 'hy' Whisper language code (Armenian)
    text = transcribe_audio(audio_bytes, locale, filename)
    
    if not text.strip():
        logger.warning(f"[VOICE] Empty transcription for locale={locale}")
        # Return locale-specific error message
        error_messages = {
            "hy": "Cannot recognize speech. Please try again.",
            "ru": "Cannot recognize speech. Please try again.",
            "en": "Cannot recognize speech. Please try again.",
        }
        return VoiceParseResult(
            text="",
            warnings=[error_messages.get(locale, error_messages["en"])],
        )
    
    logger.info(f"[VOICE] Transcription successful: {len(text)} chars")
    
    # Step 2: Parse with LLM + Armenian postprocessing
    result = parse_voice_text(
        text=text,
        mode=mode,
        timezone=timezone,
        today_override=today_override,
        locale=locale,
    )
    
    logger.info(
        f"[VOICE] Parse complete: visit_date={result.visit_date}, "
        f"amount={result.amount}, currency={result.currency}, "
        f"warnings={len(result.warnings)}"
    )
    
    return result

