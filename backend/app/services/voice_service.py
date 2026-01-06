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


# System prompt for LLM parsing - supports Armenian, Russian, English
PARSE_PROMPT_TEMPLATE_HY = """You are a medical AI assistant for a dental CRM in Armenia.
Extract structured data from the doctor's speech in Armenian.

CRITICAL RULES:
1. DO NOT invent data that is not in the text
2. DO NOT change or invent dates
3. If date is NOT explicitly mentioned — return null
4. Recognize relative dates in Armenian:
   - "aysor" (այdelays) → {TODAY}
   - "vaghe" (delays) → {TOMORROW}  
   - "verevaghy" (delaysdelays) → {DAY_AFTER}
   - "mech N or" (delaysdelays N delays) → calculate from {TODAY}
   - specific dates (5 hunvar, 25.12, etc) → convert to YYYY-MM-DD
5. If year not specified — use {YEAR} (or next year if date passed)

CURRENCY RULES (CRITICAL for Armenia):
- If you see 'dram', 'dramov', 'AMD' → currency = "AMD"
- Default currency for Armenia = AMD (Armenian Dram)
- NEVER use RUB unless explicitly mentioned as "rubles"
- Default currency: {DEFAULT_CURRENCY}

LANGUAGE RULES:
- Input may be in Armenian script, Latin transliteration, or mixed
- Output text fields (diagnosis, notes) should be in Armenian if input was Armenian
- Keep the original language of the content

Current date: {TODAY} (timezone: {TIMEZONE})
Mode: {MODE}
Locale: {LOCALE}

Return STRICT JSON without markdown:
{{
  "visit_date": "YYYY-MM-DD or null",
  "next_visit_date": "YYYY-MM-DD or null",
  "diagnosis": "diagnosis text in original language or null",
  "notes": "doctor notes in original language or null",
  "amount": number or null,
  "currency": "AMD" | "RUB" | "USD" | null
}}

Examples for Armenian:
- "aysor vizit" → visit_date: "{TODAY}"
- "vaghe galu" → visit_date: "{TOMORROW}"
- "25 dektemberi" → visit_date: "YYYY-12-25"
- "300 hazar dram" → amount: 300000, currency: "AMD"
- "20000 dramov" → amount: 20000, currency: "AMD"

Doctor's speech: \"\"\"{TEXT}\"\"\"
"""

PARSE_PROMPT_TEMPLATE_RU = """Ты — медицинский AI-ассистент стоматологической CRM.
Твоя задача — извлечь структурированные данные из речи врача.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. НЕ ПРИДУМЫВАЙ данные, которых нет в тексте
2. НЕ МЕНЯЙ И НЕ ВЫДУМЫВАЙ ДАТЫ
3. Если дата НЕ указана явно — верни null
4. Распознавай относительные даты:
   - "сегодня" → {TODAY}
   - "завтра" → {TOMORROW}
   - "послезавтра" → {DAY_AFTER}
   - "через N дней" → вычисли от {TODAY}
   - конкретные даты (5 января, 25.12, etc) → преобразуй в YYYY-MM-DD
5. Если год не указан — используй {YEAR} (или следующий год если дата уже прошла)

ПРАВИЛА ВАЛЮТЫ (КРИТИЧЕСКИ ВАЖНО для Армении):
- Если встречается 'dram', 'драм', 'драма', 'драмов', 'AMD', 'drams' → currency = "AMD"
- RUB допускается ТОЛЬКО если явно сказано 'рубль/рублей/руб' И НЕТ признаков 'драм/AMD'
- Для Armenia (timezone: Asia/Yerevan) валюта по умолчанию = AMD
- НИКОГДА не подменяй "драм" на "рубли"
- Предустановленная валюта: {DEFAULT_CURRENCY}

Текущая дата: {TODAY} (timezone: {TIMEZONE})
Режим: {MODE}
Язык: {LOCALE}

Верни СТРОГО JSON без markdown:
{{
  "visit_date": "YYYY-MM-DD или null",
  "next_visit_date": "YYYY-MM-DD или null",
  "diagnosis": "текст диагноза или null",
  "notes": "заметки врача или null",
  "amount": число или null,
  "currency": "AMD" | "RUB" | null
}}

Примеры:
- "Сегодня визит" → visit_date: "{TODAY}"
- "Запиши на завтра" → visit_date: "{TOMORROW}"
- "Визит 25 декабря" → visit_date: "YYYY-12-25" (правильный год)
- "Оплата 20000 драм" → amount: 20000, currency: "AMD"
- "Оплата 20000 dram" → amount: 20000, currency: "AMD"
- "Новый визит" (без даты) → visit_date: null

Текст врача: \"\"\"{TEXT}\"\"\"
"""

PARSE_PROMPT_TEMPLATE_EN = """You are a medical AI assistant for a dental CRM.
Extract structured data from the doctor's speech.

CRITICAL RULES:
1. DO NOT invent data that is not in the text
2. DO NOT change or invent dates
3. If date is NOT explicitly mentioned — return null
4. Recognize relative dates:
   - "today" → {TODAY}
   - "tomorrow" → {TOMORROW}
   - "day after tomorrow" → {DAY_AFTER}
   - "in N days" → calculate from {TODAY}
   - specific dates (January 5, 25.12, etc) → convert to YYYY-MM-DD
5. If year not specified — use {YEAR} (or next year if date passed)

CURRENCY RULES:
- Default currency: {DEFAULT_CURRENCY}
- For Armenia timezone, default = AMD (Armenian Dram)
- Use explicit currency if mentioned (USD, RUB, AMD)

Current date: {TODAY} (timezone: {TIMEZONE})
Mode: {MODE}
Locale: {LOCALE}

Return STRICT JSON without markdown:
{{
  "visit_date": "YYYY-MM-DD or null",
  "next_visit_date": "YYYY-MM-DD or null",
  "diagnosis": "diagnosis text or null",
  "notes": "doctor notes or null",
  "amount": number or null,
  "currency": "AMD" | "RUB" | "USD" | null
}}

Doctor's speech: \"\"\"{TEXT}\"\"\"
"""

def _get_parse_prompt_template(locale: Locale) -> str:
    """Get the appropriate prompt template based on locale."""
    if locale == "hy":
        return PARSE_PROMPT_TEMPLATE_HY
    elif locale == "ru":
        return PARSE_PROMPT_TEMPLATE_RU
    else:
        return PARSE_PROMPT_TEMPLATE_EN


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
    
    # Get locale-specific prompt template
    prompt_template = _get_parse_prompt_template(locale)
    
    # Build prompt with corrected text
    prompt = prompt_template.format(
        TODAY=today.isoformat(),
        TOMORROW=tomorrow.isoformat(),
        DAY_AFTER=day_after.isoformat(),
        YEAR=today.year,
        TIMEZONE=timezone,
        MODE=mode,
        TEXT=corrected_text,
        DEFAULT_CURRENCY=default_currency,
        LOCALE=locale,
    )
    
    logger.debug(f"[LLM] Prompt preview: {prompt[:300]}...")
    
    try:
        response = client.chat.completions.create(
            model=settings.AI_MODEL_TEXT,
            messages=[
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,  # Low temperature for consistency
            max_tokens=500,
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
        
        # Apply Armenian-aware postprocessing
        postprocessed_data, postprocess_warnings = postprocess_voice_data(
            transcript=text,
            parsed_data=data,
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
        
        logger.info(f"[LLM] Final parsed result: visit_date={visit_date}, amount={amount}, currency={currency}")
        
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

