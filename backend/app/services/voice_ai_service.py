"""
Voice AI Service for SmileCRM.
Handles Speech-to-Text (STT) and LLM-based JSON parsing for voice input.

Supports Armenian (HY), Russian (RU), English (EN) and mixed language input.
"""
import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Literal

from app.config import get_settings

logger = logging.getLogger("smilecrm.voice_ai")

# Type definitions
VoiceMode = Literal["patient", "visit", "note"]
Language = Literal["auto", "hy", "ru", "en"]

# File constraints
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-wav",
    "audio/wave",
}


@dataclass
class VoiceParseResult:
    """Result of voice parsing operation."""
    mode: VoiceMode
    language: Language
    transcript: str
    structured: dict[str, Any]
    warnings: list[str]


class VoiceAIError(Exception):
    """Base exception for Voice AI errors."""
    pass


class AINotConfiguredError(VoiceAIError):
    """Raised when AI provider is not configured."""
    pass


class AudioValidationError(VoiceAIError):
    """Raised when audio file validation fails."""
    pass


class TranscriptionError(VoiceAIError):
    """Raised when STT transcription fails."""
    pass


class ParsingError(VoiceAIError):
    """Raised when LLM parsing fails."""
    pass


def validate_audio_file(file_data: bytes, content_type: str | None, filename: str | None) -> None:
    """
    Validate audio file size and type.
    
    Args:
        file_data: Raw file bytes
        content_type: MIME type of the file
        filename: Original filename
        
    Raises:
        AudioValidationError: If validation fails
    """
    # Check file size
    if len(file_data) > MAX_FILE_SIZE:
        raise AudioValidationError(
            f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if len(file_data) == 0:
        raise AudioValidationError("File is empty")
    
    # Valid audio extensions
    valid_extensions = {"webm", "wav", "ogg", "mp3", "m4a"}
    
    # Check content type if provided
    if content_type:
        # Normalize content type (remove charset etc)
        base_type = content_type.split(";")[0].strip().lower()
        if base_type not in ALLOWED_AUDIO_TYPES:
            # Also check by file extension as fallback
            if filename:
                ext = filename.lower().split(".")[-1] if "." in filename else ""
                if ext not in valid_extensions:
                    raise AudioValidationError(
                        "Invalid audio format. Allowed: webm, wav, ogg, mp3, m4a"
                    )
            else:
                raise AudioValidationError(
                    "Invalid audio format. Allowed: webm, wav, ogg, mp3, m4a"
                )
    else:
        # No content type provided - validate by filename extension
        if filename:
            ext = filename.lower().split(".")[-1] if "." in filename else ""
            if ext not in valid_extensions:
                raise AudioValidationError(
                    "Invalid audio format. Allowed: webm, wav, ogg, mp3, m4a"
                )
        else:
            raise AudioValidationError(
                "Cannot determine audio format. Please provide a valid audio file."
            )


def get_language_hint(language: Language) -> str | None:
    """Convert language code to OpenAI Whisper language hint."""
    language_map = {
        "hy": "hy",  # Armenian
        "ru": "ru",  # Russian
        "en": "en",  # English
        "auto": None,  # Auto-detect
    }
    return language_map.get(language)


async def transcribe_audio(
    file_data: bytes,
    filename: str,
    language: Language = "auto"
) -> str:
    """
    Transcribe audio to text using OpenAI Whisper.
    
    Args:
        file_data: Audio file bytes
        filename: Original filename
        language: Language hint (auto/hy/ru/en)
        
    Returns:
        Transcribed text
        
    Raises:
        AINotConfiguredError: If OpenAI is not configured
        TranscriptionError: If transcription fails
    """
    settings = get_settings()
    
    if not settings.is_ai_configured:
        raise AINotConfiguredError("AI is not configured. Set OPENAI_API_KEY in environment.")
    
    try:
        # Import OpenAI here to avoid import errors if not installed
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Prepare language parameter
        language_hint = get_language_hint(language)
        
        # Create file-like object for OpenAI
        # OpenAI expects a tuple of (filename, file_data, content_type)
        audio_file = (filename, file_data)
        
        logger.info(f"Transcribing audio: {filename}, language={language}")
        
        # Call Whisper API
        kwargs: dict[str, Any] = {
            "model": settings.AI_MODEL_STT,
            "file": audio_file,
            "response_format": "text",
        }
        
        if language_hint:
            kwargs["language"] = language_hint
        
        transcript = await client.audio.transcriptions.create(**kwargs)
        
        logger.info(f"Transcription successful, length: {len(str(transcript))}")
        
        return str(transcript).strip()
        
    except ImportError:
        raise AINotConfiguredError("OpenAI library not installed. Run: pip install openai")
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise TranscriptionError(f"Failed to transcribe audio: {str(e)}")


def build_parsing_prompt(mode: VoiceMode, transcript: str) -> str:
    """
    Build the LLM prompt for parsing transcript to structured JSON.
    
    Args:
        mode: Parsing mode (patient/visit/note)
        transcript: Transcribed text
        
    Returns:
        Formatted prompt string
    """
    base_rules = """
You are a medical data extraction assistant for a dental clinic.
The input text may be in Armenian (Հայdelays:), Russian, English, or mixed.

IMPORTANT RULES:
1. Return ONLY valid JSON, no explanations or markdown.
2. If you are not confident about a value, use null.
3. Never invent or guess data - if unclear, use null.
4. For phone numbers starting with 0 (Armenian format), normalize to +374 format:
   - 077123456 -> +37477123456
   - 093123456 -> +37493123456
5. Status can only be: "in_progress", "completed", or null.
6. Dates must be in YYYY-MM-DD format or null.
"""

    if mode == "patient":
        schema = """
Extract patient information from the text and return this exact JSON structure:
{
  "patient": {
    "first_name": "string or null",
    "last_name": "string or null", 
    "phone": "string or null (normalized to +374...)",
    "diagnosis": "string or null",
    "status": "in_progress or completed or null"
  }
}
"""
    elif mode == "visit":
        schema = """
Extract visit information and medications from the text and return this exact JSON structure:
{
  "visit": {
    "visit_date": "YYYY-MM-DD or null",
    "next_visit_date": "YYYY-MM-DD or null",
    "notes": "string or null",
    "diagnosis": "string or null"
  },
  "medications": [
    {
      "name": "string (required)",
      "dose": "string or null",
      "frequency": "string or null",
      "duration": "string or null"
    }
  ]
}

If no medications mentioned, return empty array: "medications": []
"""
    else:  # mode == "note"
        schema = """
Extract notes from the text and return this exact JSON structure:
{
  "note": {
    "notes": "string or null"
  }
}
"""

    return f"""{base_rules}

{schema}

TEXT TO PARSE:
\"\"\"{transcript}\"\"\"

Return only the JSON:"""


def normalize_armenian_phone(phone: str | None) -> str | None:
    """Normalize Armenian phone numbers to +374 format."""
    if not phone:
        return None
    
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # If starts with 0 and looks like Armenian mobile (9-10 digits after 0)
    if cleaned.startswith('0') and len(cleaned) >= 9:
        # Remove leading 0 and add +374
        cleaned = '+374' + cleaned[1:]
    
    # If just digits without country code
    if cleaned.isdigit() and len(cleaned) >= 8:
        # Check if it looks like Armenian mobile (starts with 7, 9, etc.)
        if cleaned[0] in '79':
            cleaned = '+374' + cleaned
    
    return cleaned if cleaned else None


def validate_and_fix_structured(mode: VoiceMode, data: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """
    Validate and fix structured data, returning warnings.
    
    Args:
        mode: Parsing mode
        data: Parsed JSON data
        
    Returns:
        Tuple of (fixed_data, warnings)
    """
    warnings: list[str] = []
    
    if mode == "patient":
        patient = data.get("patient", {})
        if not isinstance(patient, dict):
            patient = {}
            data["patient"] = patient
        
        # Normalize phone
        if "phone" in patient:
            patient["phone"] = normalize_armenian_phone(patient.get("phone"))
        
        # Validate status
        valid_statuses = {"in_progress", "completed", None}
        if patient.get("status") not in valid_statuses:
            patient["status"] = None
            warnings.append("Invalid status value was reset to null")
        
        # Check for empty required fields
        null_count = sum(1 for v in patient.values() if v is None or v == "")
        if null_count >= 3:
            warnings.append("Many fields are empty - please verify the transcription")
            
    elif mode == "visit":
        visit = data.get("visit", {})
        if not isinstance(visit, dict):
            visit = {}
            data["visit"] = visit
        
        medications = data.get("medications", [])
        if not isinstance(medications, list):
            medications = []
            data["medications"] = medications
        
        # Validate date formats
        date_pattern = re.compile(r'^\d{4}-\d{2}-\d{2}$')
        for field in ["visit_date", "next_visit_date"]:
            if visit.get(field) and not date_pattern.match(str(visit.get(field))):
                warnings.append(f"Invalid {field} format, should be YYYY-MM-DD")
                visit[field] = None
        
        # Check for empty
        if not visit.get("notes") and not visit.get("diagnosis") and not medications:
            warnings.append("Visit data is mostly empty - please verify the transcription")
            
    else:  # note
        note = data.get("note", {})
        if not isinstance(note, dict):
            note = {}
            data["note"] = note
        
        if not note.get("notes"):
            warnings.append("No notes extracted from the recording")
    
    return data, warnings


async def parse_transcript(mode: VoiceMode, transcript: str) -> tuple[dict[str, Any], list[str]]:
    """
    Parse transcript to structured JSON using LLM.
    
    Args:
        mode: Parsing mode (patient/visit/note)
        transcript: Transcribed text
        
    Returns:
        Tuple of (structured_data, warnings)
        
    Raises:
        AINotConfiguredError: If OpenAI is not configured
        ParsingError: If parsing fails
    """
    settings = get_settings()
    
    if not settings.is_ai_configured:
        raise AINotConfiguredError("AI is not configured. Set OPENAI_API_KEY in environment.")
    
    if not transcript or not transcript.strip():
        # Return empty structure based on mode
        if mode == "patient":
            return {"patient": {"first_name": None, "last_name": None, "phone": None, "diagnosis": None, "status": None}}, ["Empty transcript"]
        elif mode == "visit":
            return {"visit": {"visit_date": None, "next_visit_date": None, "notes": None, "diagnosis": None}, "medications": []}, ["Empty transcript"]
        else:
            return {"note": {"notes": None}}, ["Empty transcript"]
    
    try:
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = build_parsing_prompt(mode, transcript)
        
        logger.info(f"Parsing transcript for mode={mode}")
        
        response = await client.chat.completions.create(
            model=settings.AI_MODEL_TEXT,
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON extraction assistant. Return only valid JSON, no markdown or explanations."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Low temperature for consistent output
            max_tokens=1000,
        )
        
        raw_response = response.choices[0].message.content or ""
        
        # Clean response - remove markdown code blocks if present
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            # Remove opening ```json or ``` and closing ```
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)
        
        logger.debug(f"LLM response: {cleaned[:200]}...")
        
        # Parse JSON
        try:
            structured = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}, raw: {cleaned[:200]}")
            raise ParsingError(f"Failed to parse LLM response as JSON: {e}")
        
        # Validate and fix
        structured, warnings = validate_and_fix_structured(mode, structured)
        
        return structured, warnings
        
    except ImportError:
        raise AINotConfiguredError("OpenAI library not installed. Run: pip install openai")
    except ParsingError:
        raise
    except Exception as e:
        logger.error(f"Parsing failed: {e}")
        raise ParsingError(f"Failed to parse transcript: {str(e)}")


async def process_voice_input(
    file_data: bytes,
    filename: str,
    content_type: str | None,
    mode: VoiceMode,
    language: Language = "auto",
    context_patient_id: str | None = None,
) -> VoiceParseResult:
    """
    Main entry point for processing voice input.
    
    Args:
        file_data: Audio file bytes
        filename: Original filename
        content_type: MIME type
        mode: Processing mode (patient/visit/note)
        language: Language hint (auto/hy/ru/en)
        context_patient_id: Optional patient ID for context
        
    Returns:
        VoiceParseResult with transcript and structured data
        
    Raises:
        VoiceAIError: On any processing error
    """
    # Validate file
    validate_audio_file(file_data, content_type, filename)
    
    # Transcribe
    transcript = await transcribe_audio(file_data, filename, language)
    
    # Parse to structured JSON
    structured, warnings = await parse_transcript(mode, transcript)
    
    return VoiceParseResult(
        mode=mode,
        language=language,
        transcript=transcript,
        structured=structured,
        warnings=warnings,
    )
