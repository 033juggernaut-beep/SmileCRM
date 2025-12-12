"""
AI Voice Assistant API endpoints for SmileCRM.
Provides voice-to-structured-data conversion for patient/visit/note input.
"""
import logging
from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.config import get_settings
from app.services.voice_ai_service import (
    AINotConfiguredError,
    AudioValidationError,
    ParsingError,
    TranscriptionError,
    VoiceAIError,
    process_voice_input,
)

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger("smilecrm.ai")

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


class VoiceParseResponse(BaseModel):
    """Response model for voice parse endpoint."""
    mode: Literal["patient", "visit", "note"]
    language: Literal["auto", "hy", "ru", "en"]
    transcript: str
    structured: dict[str, Any]
    warnings: list[str]


@router.post("/voice/parse", response_model=VoiceParseResponse)
async def parse_voice_input(
    current_doctor: CurrentDoctor,
    mode: Literal["patient", "visit", "note"] = Form(...),
    language: Literal["auto", "hy", "ru", "en"] = Form(default="auto"),
    audio: UploadFile = File(...),
    contextPatientId: str | None = Form(default=None),
) -> VoiceParseResponse:
    """
    Parse voice input to structured data.
    
    Accepts audio recording, transcribes it using STT (Whisper),
    then parses the transcript to structured JSON using LLM.
    
    **Modes:**
    - `patient`: Extract patient info (name, phone, diagnosis, status)
    - `visit`: Extract visit info (dates, notes, diagnosis, medications)
    - `note`: Extract just notes/comments
    
    **Languages:**
    - `auto`: Auto-detect language (supports Armenian, Russian, English, mixed)
    - `hy`: Force Armenian
    - `ru`: Force Russian
    - `en`: Force English
    
    **Audio formats:** webm, wav, ogg, mp3, m4a (max 10MB)
    
    Returns:
        VoiceParseResponse with transcript and structured data
        
    Raises:
        501: AI not configured (missing OPENAI_API_KEY)
        400: Invalid audio file or processing error
    """
    settings = get_settings()
    
    # Check if AI is configured
    if not settings.is_ai_configured:
        logger.warning("AI voice parse requested but AI is not configured")
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI is not configured. Please contact administrator."
        )
    
    logger.info(
        f"Voice parse request: doctor={current_doctor.doctor_id}, "
        f"mode={mode}, language={language}, file={audio.filename}"
    )
    
    try:
        # Read file data
        file_data = await audio.read()
        
        # Process voice input
        result = await process_voice_input(
            file_data=file_data,
            filename=audio.filename or "audio.webm",
            content_type=audio.content_type,
            mode=mode,
            language=language,
            context_patient_id=contextPatientId,
        )
        
        logger.info(
            f"Voice parse success: doctor={current_doctor.doctor_id}, "
            f"transcript_len={len(result.transcript)}, warnings={len(result.warnings)}"
        )
        
        return VoiceParseResponse(
            mode=result.mode,
            language=result.language,
            transcript=result.transcript,
            structured=result.structured,
            warnings=result.warnings,
        )
        
    except AudioValidationError as e:
        logger.warning(f"Audio validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except TranscriptionError as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to transcribe audio: {str(e)}"
        )
    except ParsingError as e:
        logger.error(f"Parsing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse transcript: {str(e)}"
        )
    except AINotConfiguredError as e:
        logger.error(f"AI not configured: {e}")
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI is not configured. Please contact administrator."
        )
    except VoiceAIError as e:
        logger.error(f"Voice AI error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in voice parse: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )
