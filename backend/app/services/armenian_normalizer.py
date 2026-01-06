"""
Armenian Language Normalizer for SmileCRM Voice AI.

Handles:
- Amount normalization: "300.000 dram", "300 hazar", "300k" -> 300000
- Currency detection: AMD tokens in Armenian text
- Date parsing: "aysor", "vagh@", "hajord erbat", numeric dates
"""
import logging
import re
from datetime import date, timedelta
from typing import Tuple, Optional, List

logger = logging.getLogger("smilecrm.armenian_normalizer")


# =============================================================================
# Currency Constants
# =============================================================================

AMD_TOKENS = [
    # Armenian script - dram variants
    "\u0564\u0580\u0561\u0574",  # դdelays
    "\u0564\u0580\u0561\u0574\u056b",  # delays
    "\u0564\u0580\u0561\u0574\u0578\u057e",  # delays
    # Latin transliteration
    "dram", "drams", "drm", "dramov",
    # Currency code
    "amd",
]

RUB_TOKENS = [
    # Russian Cyrillic
    "\u0440\u0443\u0431",  # delays
    "\u0440\u0443\u0431\u043b\u0435\u0439",  # delays
    "\u0440\u0443\u0431\u043b\u044f",  # delays
    "\u0440\u0443\u0431\u043b\u044c",  # delays
    "\u0440\u0443\u0431\u043b\u0438",  # delays
    # English
    "ruble", "rubles", "rub",
]

USD_TOKENS = [
    # Armenian script
    "\u0564\u0578\u056c\u0561\u0580",  # delays
    "\u0564\u0578\u056c\u056c\u0561\u0580",  # delays
    # English
    "dollar", "dollars", "usd", "$",
]


# =============================================================================
# Amount Normalization
# =============================================================================

# Armenian number words (Latin transliteration for robustness)
ARMENIAN_NUMBER_WORDS = {
    # Thousands - various spellings
    "hazar": 1000,
    "hazari": 1000,
    "hazarov": 1000,
    "\u0570\u0561\u0566\u0561\u0580": 1000,  # delays
    "\u0570\u0566\u0580": 1000,  # delays (short form)
    # Millions  
    "million": 1000000,
    "milion": 1000000,
    "\u0574\u056b\u056c\u056b\u0578\u0576": 1000000,  # delays
    # Hundreds
    "haryur": 100,
    "\u0570\u0561\u0580\u0575\u0578\u0582\u0580": 100,  # delays
}

# Russian number words
RUSSIAN_NUMBER_WORDS = {
    "\u0442\u044b\u0441\u044f\u0447": 1000,  # delays
    "\u0442\u044b\u0441": 1000,  # delays
    "tysyach": 1000,
    "\u043c\u0438\u043b\u043b\u0438\u043e\u043d": 1000000,  # delays
    "\u0441\u043e\u0442": 100,  # delays
}

# English number words
ENGLISH_NUMBER_WORDS = {
    "thousand": 1000,
    "k": 1000,
    "million": 1000000,
    "mil": 1000000,
    "m": 1000000,
    "hundred": 100,
}


def normalize_amount(text: str, locale: str = "hy") -> Tuple[Optional[int], List[str]]:
    """
    Normalize amount strings from various formats to integer.
    
    Examples:
        "300.000 dram" -> 300000
        "300 hazar" -> 300000
        "300k" -> 300000
        "25,000" -> 25000
    
    Args:
        text: Input text containing amount
        locale: Language hint (hy/ru/en)
        
    Returns:
        Tuple of (amount_int, warnings)
    """
    warnings: List[str] = []
    text_lower = text.lower().strip()
    
    if not text_lower:
        return None, warnings
    
    # Combine all number word dictionaries based on locale priority
    number_words = {}
    if locale == "hy":
        number_words.update(ENGLISH_NUMBER_WORDS)
        number_words.update(RUSSIAN_NUMBER_WORDS)
        number_words.update(ARMENIAN_NUMBER_WORDS)  # Armenian has priority
    elif locale == "ru":
        number_words.update(ENGLISH_NUMBER_WORDS)
        number_words.update(ARMENIAN_NUMBER_WORDS)
        number_words.update(RUSSIAN_NUMBER_WORDS)  # Russian has priority
    else:
        number_words.update(RUSSIAN_NUMBER_WORDS)
        number_words.update(ARMENIAN_NUMBER_WORDS)
        number_words.update(ENGLISH_NUMBER_WORDS)  # English has priority
    
    # Pattern 1: "300.000" or "300,000" (European/US thousands separator)
    # Must be followed by space or end, not another digit
    thousands_pattern = re.compile(r'(\d{1,3})[\.,](\d{3})(?:[\.,](\d{3}))?(?!\d)')
    match = thousands_pattern.search(text_lower)
    if match:
        groups = [g for g in match.groups() if g]
        number_str = "".join(groups)
        try:
            amount = int(number_str)
            logger.debug(f"Amount normalized via thousands separator: {text} -> {amount}")
            return amount, warnings
        except ValueError:
            pass
    
    # Pattern 2: "300 hazar" (number + word multiplier)
    for word, multiplier in number_words.items():
        # Match patterns like "300 hazar", "300hazar", "3 million"
        pattern = re.compile(rf'(\d+(?:\.\d+)?)\s*{re.escape(word)}', re.IGNORECASE)
        match = pattern.search(text_lower)
        if match:
            try:
                base = float(match.group(1))
                amount = int(base * multiplier)
                logger.debug(f"Amount normalized via word multiplier: {text} -> {amount} (base={base}, mult={multiplier})")
                return amount, warnings
            except ValueError:
                continue
    
    # Pattern 3: Plain number (possibly with decimal)
    plain_number = re.compile(r'(\d+(?:[\.,]\d+)?)')
    match = plain_number.search(text_lower)
    if match:
        num_str = match.group(1).replace(',', '.')
        try:
            # Check if it looks like a decimal (e.g., 25.50) vs thousands (e.g., 25.000)
            if '.' in num_str:
                parts = num_str.split('.')
                # If decimal part is exactly 3 digits and original had . separator, treat as thousands
                if len(parts) == 2 and len(parts[1]) == 3:
                    amount = int(parts[0] + parts[1])
                else:
                    amount = int(float(num_str))
            else:
                amount = int(num_str)
            logger.debug(f"Amount normalized via plain number: {text} -> {amount}")
            return amount, warnings
        except ValueError:
            pass
    
    return None, warnings


# =============================================================================
# Currency Detection
# =============================================================================

def detect_currency(
    text: str,
    locale: str = "hy",
    default_currency: str = "AMD"
) -> Tuple[str, List[str]]:
    """
    Detect currency from text.
    
    Priority:
    1. Explicit AMD tokens (Armenian/Russian/English) -> "AMD"
    2. Explicit RUB tokens -> "RUB" (only if NO AMD tokens)
    3. Default based on locale (hy -> AMD)
    
    Args:
        text: Input text
        locale: User's locale (hy/ru/en)
        default_currency: Default if no currency detected
        
    Returns:
        Tuple of (currency_code, warnings)
    """
    warnings: List[str] = []
    text_lower = text.lower()
    
    # Check AMD tokens
    has_amd = any(token in text_lower for token in AMD_TOKENS)
    
    # Check RUB tokens
    has_rub = any(token in text_lower for token in RUB_TOKENS)
    
    # Check USD tokens
    has_usd = any(token in text_lower for token in USD_TOKENS)
    
    # Priority: AMD > USD > RUB
    if has_amd:
        if has_rub:
            # Both AMD and RUB found - likely STT error, AMD takes priority
            warnings.append("Detected both AMD and RUB tokens; using AMD (common STT error)")
            logger.warning(f"Currency conflict in text: {text[:100]}... - using AMD")
        return "AMD", warnings
    
    if has_usd:
        return "USD", warnings
    
    if has_rub:
        # Only use RUB if no AMD tokens found AND locale is not Armenian
        if locale == "hy":
            warnings.append("RUB detected but locale is Armenian; using AMD")
            return "AMD", warnings
        return "RUB", warnings
    
    # No currency found - use default based on locale
    if locale == "hy" or default_currency == "AMD":
        return "AMD", warnings
    
    return default_currency, warnings


def correct_currency_misrecognition(text: str, locale: str = "hy") -> Tuple[str, List[str]]:
    """
    Correct common STT misrecognitions of Armenian currency.
    
    Whisper sometimes transcribes "dram" as "rubles" or similar.
    This function corrects such errors before LLM processing.
    
    Args:
        text: Transcribed text
        locale: User's locale
        
    Returns:
        Tuple of (corrected_text, warnings)
    """
    warnings: List[str] = []
    corrected = text
    
    # Only apply corrections if locale is Armenian
    if locale != "hy":
        return corrected, warnings
    
    # Pattern: "X rubles" in Armenian context -> likely "X dram"
    has_amd_context = any(token in text.lower() for token in AMD_TOKENS)
    
    if not has_amd_context:
        # Check for RUB words that might be misrecognitions
        rub_pattern = re.compile(r'\b(\u0440\u0443\u0431\u043b\u0435\u0439|\u0440\u0443\u0431\u043b\u044f|\u0440\u0443\u0431\u043b\u044c)\b', re.IGNORECASE)
        if rub_pattern.search(text):
            warnings.append("Detected Russian currency word in Armenian locale - please verify")
            logger.info(f"Possible currency misrecognition: {text[:100]}...")
    
    return corrected, warnings


# =============================================================================
# Armenian Date Parsing
# =============================================================================

# Armenian day words (Latin transliteration for Whisper output)
ARMENIAN_DATE_WORDS = {
    # Today/Tomorrow - Armenian transliteration
    "aysor": 0,       # aysor (today)
    "aiso": 0,        # common misspelling
    "vaghe": 1,       # vaghe (tomorrow)
    "vagh": 1,
    "vaghy": 1,
    "verevaghy": 2,   # verevaghy (day after tomorrow)
    "mekelor": 2,     # mek el or (one more day)
    
    # Days of week - Armenian transliteration
    "yerkushabti": "monday",
    "yerekshapti": "tuesday", 
    "choreqshapti": "wednesday",
    "hingshapti": "thursday",
    "urbat": "friday",
    "shabat": "saturday",
    "kiraki": "sunday",
    
    # Common variations
    "erkushabti": "monday",
    "erekshabti": "tuesday",
    "chorekshabti": "wednesday",
    "hingshabti": "thursday",
    "erbat": "friday",
}

# Russian day words
RUSSIAN_DATE_WORDS = {
    "segodnya": 0,
    "sevodnya": 0,
    "zavtra": 1,
    "poslezavtra": 2,
    "ponedelnik": "monday",
    "vtornik": "tuesday",
    "sreda": "wednesday",
    "chetverg": "thursday",
    "pyatnica": "friday",
    "subbota": "saturday",
    "voskresenie": "sunday",
}

# English day words
ENGLISH_DATE_WORDS = {
    "today": 0,
    "tomorrow": 1,
    "monday": "monday",
    "tuesday": "tuesday",
    "wednesday": "wednesday",
    "thursday": "thursday",
    "friday": "friday",
    "saturday": "saturday",
    "sunday": "sunday",
}

# Day name to weekday number (Monday=0)
DAY_NAME_TO_WEEKDAY = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}


def parse_armenian_date(text: str, today: date, locale: str = "hy") -> Tuple[Optional[date], List[str]]:
    """
    Parse date from Armenian/Russian/English text.
    
    Handles:
    - "aysor" (today) -> today's date
    - "vaghe" (tomorrow) -> tomorrow
    - "hajord urbat" (next Friday) -> next Friday
    - "5 hunvar" (5th of January) -> 2024-01-05 or 2025-01-05
    - "25.12" -> December 25th (current or next year)
    
    Args:
        text: Input text containing date reference
        today: Reference date for relative calculations
        locale: User's locale
        
    Returns:
        Tuple of (parsed_date, warnings)
    """
    warnings: List[str] = []
    text_lower = text.lower().strip()
    
    if not text_lower:
        return None, warnings
    
    # Combine date word dictionaries based on locale
    date_words = {}
    if locale == "hy":
        date_words.update(ENGLISH_DATE_WORDS)
        date_words.update(RUSSIAN_DATE_WORDS)
        date_words.update(ARMENIAN_DATE_WORDS)
    elif locale == "ru":
        date_words.update(ENGLISH_DATE_WORDS)
        date_words.update(ARMENIAN_DATE_WORDS)
        date_words.update(RUSSIAN_DATE_WORDS)
    else:
        date_words.update(RUSSIAN_DATE_WORDS)
        date_words.update(ARMENIAN_DATE_WORDS)
        date_words.update(ENGLISH_DATE_WORDS)
    
    # Check for relative date words
    for word, value in date_words.items():
        if word in text_lower:
            if isinstance(value, int):
                # Relative day offset
                result = today + timedelta(days=value)
                logger.debug(f"Date parsed via relative word: {word} -> {result}")
                return result, warnings
            elif isinstance(value, str) and value in DAY_NAME_TO_WEEKDAY:
                # Day of week - find next occurrence
                target_weekday = DAY_NAME_TO_WEEKDAY[value]
                days_ahead = target_weekday - today.weekday()
                if days_ahead <= 0:  # Target day already happened this week
                    days_ahead += 7
                
                # Check for "next" prefix
                next_words = ["hajord", "sleduyushiy", "next", "hachord"]
                has_next = any(nw in text_lower for nw in next_words)
                if has_next and days_ahead < 7:
                    days_ahead += 7
                
                result = today + timedelta(days=days_ahead)
                logger.debug(f"Date parsed via day name: {word} -> {result}")
                return result, warnings
    
    # Pattern: "through N days" / "mech N or" / "cherez N dney"
    through_pattern = re.compile(
        r'(?:mech|cherez|through|in)\s*(\d+)\s*(?:or|orov|dney|days?)',
        re.IGNORECASE
    )
    match = through_pattern.search(text_lower)
    if match:
        days = int(match.group(1))
        result = today + timedelta(days=days)
        logger.debug(f"Date parsed via 'through N days': {days} -> {result}")
        return result, warnings
    
    # Month names for date extraction
    armenian_months = {
        "hunvar": 1, "hunvari": 1,
        "petrar": 2, "petrari": 2, "februari": 2,
        "mart": 3, "marti": 3,
        "april": 4, "aprili": 4,
        "mayis": 5, "mayisi": 5,
        "hunis": 6, "hunisi": 6,
        "hulis": 7, "hulisi": 7,
        "ogostos": 8, "ogostosi": 8,
        "september": 9, "septemberi": 9,
        "hoktember": 10, "hoktemberi": 10,
        "noyember": 11, "noyemberi": 11,
        "dektember": 12, "dektemberi": 12,
    }
    
    russian_months = {
        "yanvar": 1, "fevral": 2, "mart": 3, "aprel": 4,
        "may": 5, "iyun": 6, "iyul": 7, "avgust": 8,
        "sentyabr": 9, "oktyabr": 10, "noyabr": 11, "dekabr": 12,
    }
    
    english_months = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12,
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }
    
    all_months = {}
    all_months.update(english_months)
    all_months.update(russian_months)
    all_months.update(armenian_months)
    
    for month_name, month_num in all_months.items():
        # Pattern: "5 January" or "January 5"
        pattern1 = re.compile(rf'(\d{{1,2}})\s*[-]?\s*{re.escape(month_name)}', re.IGNORECASE)
        pattern2 = re.compile(rf'{re.escape(month_name)}\s*[-]?\s*(\d{{1,2}})', re.IGNORECASE)
        
        for pattern in [pattern1, pattern2]:
            match = pattern.search(text_lower)
            if match:
                day = int(match.group(1))
                if 1 <= day <= 31:
                    year = today.year
                    try:
                        result = date(year, month_num, day)
                        if result < today:
                            result = date(year + 1, month_num, day)
                        logger.debug(f"Date parsed via month name: {month_name} {day} -> {result}")
                        return result, warnings
                    except ValueError:
                        continue
    
    # Pattern: DD.MM or DD/MM
    date_pattern = re.compile(r'(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?')
    match = date_pattern.search(text)
    if match:
        day = int(match.group(1))
        month = int(match.group(2))
        year_str = match.group(3)
        
        if year_str:
            year = int(year_str)
            if year < 100:
                year += 2000
        else:
            year = today.year
        
        if 1 <= day <= 31 and 1 <= month <= 12:
            try:
                result = date(year, month, day)
                if not year_str and result < today:
                    result = date(year + 1, month, day)
                logger.debug(f"Date parsed via DD.MM format: {match.group(0)} -> {result}")
                return result, warnings
            except ValueError:
                pass
    
    return None, warnings


# =============================================================================
# Main Postprocessor
# =============================================================================

def postprocess_voice_data(
    transcript: str,
    parsed_data: dict,
    locale: str = "hy",
    timezone: str = "Asia/Yerevan",
    today: Optional[date] = None,
) -> Tuple[dict, List[str]]:
    """
    Postprocess LLM-parsed voice data with Armenian-aware normalization.
    
    This function:
    1. Normalizes amounts ("300.000 dram" -> 300000)
    2. Corrects currency (AMD priority for Armenian locale)
    3. Validates and normalizes dates
    
    Args:
        transcript: Original transcribed text
        parsed_data: Data parsed by LLM
        locale: User's locale (hy/ru/en)
        timezone: User's timezone
        today: Reference date (defaults to now)
        
    Returns:
        Tuple of (normalized_data, warnings)
    """
    from datetime import datetime
    from zoneinfo import ZoneInfo
    
    warnings: List[str] = []
    result = parsed_data.copy()
    
    # Get today's date
    if today is None:
        try:
            tz = ZoneInfo(timezone)
            today = datetime.now(tz).date()
        except Exception:
            today = datetime.now().date()
    
    logger.info(f"Postprocessing voice data: locale={locale}, timezone={timezone}, today={today}")
    logger.debug(f"Input data: {parsed_data}")
    logger.debug(f"Transcript: {transcript[:200] if transcript else 'empty'}...")
    
    # 1. Normalize amount if present
    if result.get("amount") is not None:
        original_amount = result["amount"]
        
        # If amount is already a number, keep it
        if isinstance(original_amount, (int, float)):
            result["amount"] = int(original_amount) if original_amount > 0 else None
        else:
            # Try to normalize from string
            amount, amount_warnings = normalize_amount(str(original_amount), locale)
            result["amount"] = amount
            warnings.extend(amount_warnings)
        
        logger.debug(f"Amount normalized: {original_amount} -> {result['amount']}")
    
    # Also try to extract amount from transcript if not found
    if result.get("amount") is None and transcript:
        amount, amount_warnings = normalize_amount(transcript, locale)
        if amount and amount > 0:
            result["amount"] = amount
            warnings.append(f"Extracted amount from transcript: {amount}")
            warnings.extend(amount_warnings)
    
    # 2. Detect and normalize currency
    if transcript:
        detected_currency, currency_warnings = detect_currency(
            transcript, 
            locale, 
            default_currency="AMD" if locale == "hy" else "AMD"
        )
        warnings.extend(currency_warnings)
        
        # Override LLM currency if we detected AMD tokens
        llm_currency = result.get("currency")
        if detected_currency == "AMD" and llm_currency == "RUB":
            result["currency"] = "AMD"
            warnings.append("Currency corrected from RUB to AMD based on text analysis")
            logger.info(f"Currency correction: RUB -> AMD")
        elif not llm_currency and result.get("amount"):
            result["currency"] = detected_currency
    
    # 3. Validate and parse dates
    for date_field in ["visit_date", "next_visit_date"]:
        if date_field in result and result[date_field]:
            date_value = result[date_field]
            
            # If it's already ISO format, validate it
            if isinstance(date_value, str) and len(date_value) == 10:
                try:
                    parsed = date.fromisoformat(date_value)
                    # Sanity check
                    if parsed < today - timedelta(days=30):
                        warnings.append(f"{date_field} is too far in the past")
                        result[date_field] = None
                    elif parsed > today + timedelta(days=365):
                        warnings.append(f"{date_field} is too far in the future")
                        result[date_field] = None
                except ValueError:
                    result[date_field] = None
                    warnings.append(f"Invalid {date_field} format")
    
    # Also try to parse dates from transcript for Armenian relative words
    if transcript and not result.get("visit_date"):
        parsed_date, date_warnings = parse_armenian_date(transcript, today, locale)
        if parsed_date:
            result["visit_date"] = parsed_date.isoformat()
            warnings.extend(date_warnings)
            logger.debug(f"Extracted visit_date from transcript: {parsed_date}")
    
    logger.info(f"Postprocessing complete: {result}")
    return result, warnings
