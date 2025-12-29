"""
Voice AI API endpoints - Whisper STT + LLM parsing + commit
"""
import logging
from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.services import patients_service, visits_service, patient_payments_service
from app.services.voice_service import (
    VoiceNotConfiguredError,
    VoiceServiceError,
    process_voice,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai/voice", tags=["voice-ai"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]

# Max audio file size: 25MB
MAX_AUDIO_SIZE = 25 * 1024 * 1024


# ============== Response Models ==============

class VoiceParsedData(BaseModel):
    """Parsed data from voice input"""
    visit_date: str | None = Field(None, description="Visit date YYYY-MM-DD")
    next_visit_date: str | None = Field(None, description="Next visit date YYYY-MM-DD")
    diagnosis: str | None = Field(None, description="Diagnosis text")
    notes: str | None = Field(None, description="Doctor notes")
    amount: float | None = Field(None, description="Payment amount")
    currency: str | None = Field(None, description="Currency (AMD)")


class VoiceParseResponse(BaseModel):
    """Response from voice parse endpoint"""
    ok: bool = True
    text: str = Field(..., description="Transcribed text from audio")
    data: VoiceParsedData = Field(..., description="Parsed structured data")
    warnings: list[str] = Field(default_factory=list, description="Validation warnings")


class VoiceCommitRequest(BaseModel):
    """Request to commit voice-parsed data"""
    mode: Literal["visit", "diagnosis", "payment", "message"] = Field(
        ..., description="What type of data to commit"
    )
    patient_id: str = Field(..., description="Patient UUID")
    data: VoiceParsedData = Field(..., description="Data to commit (may be edited by user)")


class VoiceCommitResponse(BaseModel):
    """Response from commit endpoint"""
    ok: bool = True
    message: str = Field(..., description="Success message")
    created: dict[str, Any] | None = Field(None, description="Created record if applicable")


# ============== Endpoints ==============

@router.post("/parse", response_model=VoiceParseResponse)
async def parse_voice(
    current_doctor: CurrentDoctor,
    file: UploadFile = File(..., description="Audio file (webm/wav/mp3)"),
    mode: Literal["visit", "diagnosis", "payment", "message"] = Form(...),
    patient_id: str = Form(..., description="Patient UUID"),
    timezone: str = Form("Asia/Yerevan", description="Client timezone"),
    locale: Literal["ru", "hy", "en"] = Form("ru", description="Language hint"),
    today: str | None = Form(None, description="Optional today override YYYY-MM-DD"),
):
    """
    Parse voice audio into structured data.
    
    Flow:
    1. Receive audio file
    2. Transcribe with Whisper STT
    3. Parse with LLM to extract structured fields
    4. Validate dates and amounts
    5. Return parsed data for user review
    
    The user should review the data and call /commit to save.
    """
    # Validate patient exists and belongs to doctor
    patient = patients_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.get("doctor_id") != current_doctor.doctor_id:
        raise HTTPException(status_code=403, detail="Access denied to this patient")
    
    # Read audio file
    try:
        audio_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read audio file: {e}")
        raise HTTPException(status_code=400, detail="Failed to read audio file")
    
    if len(audio_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file too large (max 25MB)")
    
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file too small or empty")
    
    # Get filename
    filename = file.filename or "audio.webm"
    
    logger.info(
        f"Voice parse request: mode={mode}, patient={patient_id}, "
        f"timezone={timezone}, locale={locale}, file={filename} ({len(audio_bytes)} bytes)"
    )
    
    try:
        result = process_voice(
            audio_bytes=audio_bytes,
            mode=mode,
            timezone=timezone,
            locale=locale,
            today_override=today,
            filename=filename,
        )
        
        return VoiceParseResponse(
            ok=True,
            text=result.text,
            data=VoiceParsedData(**result.to_dict()),
            warnings=result.warnings,
        )
        
    except VoiceNotConfiguredError as e:
        logger.error(f"Voice AI not configured: {e}")
        raise HTTPException(
            status_code=503,
            detail="Voice AI is not configured. Please set OPENAI_API_KEY.",
        )
    except VoiceServiceError as e:
        logger.error(f"Voice service error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception(f"Unexpected error in voice parse: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/commit", response_model=VoiceCommitResponse)
async def commit_voice_data(
    request: VoiceCommitRequest,
    current_doctor: CurrentDoctor,
):
    """
    Commit voice-parsed data to the database.
    
    This endpoint is called after the user reviews and optionally edits
    the parsed data from /parse.
    
    Modes:
    - visit: Creates a visit record (requires visit_date)
    - diagnosis: Updates patient diagnosis (requires diagnosis text)
    - payment: Creates a payment record (requires amount)
    - message: Saves notes to patient or visit
    """
    # Validate patient
    patient = patients_service.get_patient(request.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.get("doctor_id") != current_doctor.doctor_id:
        raise HTTPException(status_code=403, detail="Access denied to this patient")
    
    data = request.data
    mode = request.mode
    
    logger.info(f"Voice commit: mode={mode}, patient={request.patient_id}, data={data.model_dump()}")
    
    try:
        if mode == "visit":
            # Create visit - requires visit_date
            if not data.visit_date:
                raise HTTPException(
                    status_code=400,
                    detail="Дата визита обязательна. Укажите дату визита.",
                )
            
            visit_payload: dict[str, Any] = {
                "visit_date": data.visit_date,
            }
            if data.next_visit_date:
                visit_payload["next_visit_date"] = data.next_visit_date
            if data.notes:
                visit_payload["notes"] = data.notes
            if data.diagnosis:
                visit_payload["notes"] = f"{visit_payload.get('notes', '')} Диагноз: {data.diagnosis}".strip()
            
            created = visits_service.create_visit(
                doctor_id=current_doctor.doctor_id,
                patient_id=request.patient_id,
                payload=visit_payload,
            )
            
            return VoiceCommitResponse(
                ok=True,
                message=f"Визит на {data.visit_date} создан",
                created=created,
            )
        
        elif mode == "diagnosis":
            # Update patient diagnosis
            if not data.diagnosis:
                raise HTTPException(
                    status_code=400,
                    detail="Диагноз не указан. Скажите диагноз.",
                )
            
            updated = patients_service.update_patient(
                patient_id=request.patient_id,
                doctor_id=current_doctor.doctor_id,
                update_data={"diagnosis": data.diagnosis},
            )
            
            return VoiceCommitResponse(
                ok=True,
                message="Диагноз сохранён",
                created=updated,
            )
        
        elif mode == "payment":
            # Create payment - requires amount
            if not data.amount or data.amount <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Сумма оплаты не указана или некорректна.",
                )
            
            from datetime import date as date_type
            payment_date = date_type.fromisoformat(data.visit_date) if data.visit_date else date_type.today()
            
            created = patient_payments_service.create_payment(
                doctor_id=current_doctor.doctor_id,
                patient_id=request.patient_id,
                amount=data.amount,
                paid_at=payment_date,
                comment=data.notes,
            )
            
            return VoiceCommitResponse(
                ok=True,
                message=f"Оплата {data.amount} {data.currency or 'AMD'} записана",
                created=created,
            )
        
        elif mode == "message":
            # Save notes to patient
            notes_text = data.notes or data.diagnosis or ""
            if not notes_text:
                raise HTTPException(
                    status_code=400,
                    detail="Заметка пуста. Скажите что записать.",
                )
            
            # Append to existing notes
            current_notes = patient.get("notes") or ""
            from datetime import datetime
            timestamp = datetime.now().strftime("%d.%m.%Y %H:%M")
            new_notes = f"{current_notes}\n\n[{timestamp}] {notes_text}".strip()
            
            updated = patients_service.update_patient(
                patient_id=request.patient_id,
                doctor_id=current_doctor.doctor_id,
                update_data={"notes": new_notes},
            )
            
            return VoiceCommitResponse(
                ok=True,
                message="Заметка сохранена",
                created=updated,
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown mode: {mode}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to commit voice data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")


# ============== Patient Creation Voice Parse ==============

class PatientVoiceParsedData(BaseModel):
    """Parsed data for patient creation from voice"""
    first_name: str | None = Field(None, description="Patient first name")
    last_name: str | None = Field(None, description="Patient last name")
    phone: str | None = Field(None, description="Phone number")
    diagnosis: str | None = Field(None, description="Initial diagnosis")
    birth_date: str | None = Field(None, description="Birth date YYYY-MM-DD")
    notes: str | None = Field(None, description="Additional notes")


class PatientVoiceParseResponse(BaseModel):
    """Response from patient voice parse endpoint"""
    transcript: str = Field(..., description="Transcribed text from audio")
    language: str = Field(..., description="Detected language")
    mode: str = Field(default="patient")
    structured: dict = Field(..., description="Parsed structured data")
    warnings: list[str] = Field(default_factory=list, description="Validation warnings")


@router.post("/patient-parse", response_model=PatientVoiceParseResponse)
async def parse_patient_voice(
    current_doctor: CurrentDoctor,
    file: UploadFile = File(..., description="Audio file (webm/wav/mp3)"),
    mode: str = Form("patient", description="Mode - always 'patient' for this endpoint"),
    language: Literal["auto", "hy", "ru", "en"] = Form("auto", description="Speech language"),
    timezone: str = Form("Asia/Yerevan", description="Client timezone"),
    patient_id: str | None = Form(None, description="Not used for patient creation"),
):
    """
    Parse voice audio for patient creation.
    
    Extracts: first_name, last_name, phone, diagnosis, birth_date, notes
    from spoken input.
    
    Language hint helps Whisper with transcription accuracy.
    """
    from app.services.voice_service import transcribe_audio
    from app.config import settings
    import openai
    import json
    
    # Read audio file
    try:
        audio_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read audio file: {e}")
        raise HTTPException(status_code=400, detail="Failed to read audio file")
    
    if len(audio_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file too large (max 25MB)")
    
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file too small or empty")
    
    filename = file.filename or "audio.webm"
    
    logger.info(
        f"Patient voice parse: language={language}, timezone={timezone}, "
        f"file={filename} ({len(audio_bytes)} bytes)"
    )
    
    # Transcribe with Whisper
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503, 
            detail="Voice AI not configured. Please set OPENAI_API_KEY."
        )
    
    try:
        # Map language for Whisper
        whisper_lang = None
        if language != "auto":
            whisper_lang = language
        
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            filename=filename,
            language=whisper_lang,
        )
        
        if not transcript or not transcript.strip():
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
        logger.info(f"Transcribed text: {transcript[:100]}...")
        
    except Exception as e:
        logger.exception(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    # Parse with LLM to extract patient info
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    system_prompt = """You are a medical assistant helping to extract patient registration data from speech.

Extract from the text:
- first_name: Patient's first name
- last_name: Patient's last name (family name)
- phone: Phone number (clean digits, may have +374 prefix)
- diagnosis: Initial diagnosis or reason for visit
- birth_date: Birth date in YYYY-MM-DD format (calculate from age if given)
- notes: Any additional notes

If information is not mentioned, use null.
Return ONLY valid JSON, no markdown:
{
  "first_name": "string or null",
  "last_name": "string or null", 
  "phone": "string or null",
  "diagnosis": "string or null",
  "birth_date": "YYYY-MM-DD or null",
  "notes": "string or null"
}"""

    try:
        response = client.chat.completions.create(
            model=settings.AI_MODEL_TEXT,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract patient data from:\n\n{transcript}"}
            ],
            temperature=0.1,
            max_tokens=500,
        )
        
        content = response.choices[0].message.content or "{}"
        content = content.strip()
        
        # Clean markdown if present
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
        
        parsed = json.loads(content)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}")
        parsed = {}
    except Exception as e:
        logger.exception(f"LLM parsing failed: {e}")
        parsed = {}
    
    # Build structured response
    structured = {
        "patient": {
            "first_name": parsed.get("first_name"),
            "last_name": parsed.get("last_name"),
            "phone": parsed.get("phone"),
            "diagnosis": parsed.get("diagnosis"),
            "birth_date": parsed.get("birth_date"),
        }
    }
    
    warnings = []
    if parsed.get("notes"):
        warnings.append(f"Notes: {parsed.get('notes')}")
    
    return PatientVoiceParseResponse(
        transcript=transcript,
        language=language if language != "auto" else "auto",
        mode="patient",
        structured=structured,
        warnings=warnings,
    )

