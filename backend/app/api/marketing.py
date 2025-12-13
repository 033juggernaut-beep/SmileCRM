"""Marketing API endpoints for patient marketing events and birthday management."""
from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query

from app.api.deps import AuthenticatedDoctor, get_current_doctor, verify_patient_ownership
from app.models.dto import (
    AIGenerateRequest,
    AIGenerateResponse,
    MarketingEventCreateRequest,
    MarketingEventResponse,
    PatientBirthdayResponse,
)
from app.services import marketing_service, patients_service
from app.services import ai_marketing_service

router = APIRouter(prefix="/marketing", tags=["marketing"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


@router.post("/events", response_model=MarketingEventResponse)
async def create_marketing_event(
    payload: MarketingEventCreateRequest,
    current_doctor: CurrentDoctor
) -> MarketingEventResponse:
    """
    Create a marketing event log entry.
    
    This is used to track when doctors copy/send marketing messages to patients.
    Types: birthday_greeting, promo_offer, recall_reminder
    """
    # Verify patient belongs to this doctor
    verify_patient_ownership(payload.patient_id, current_doctor)
    
    event = marketing_service.create_marketing_event(
        doctor_id=current_doctor.doctor_id,
        patient_id=payload.patient_id,
        event_type=payload.type,
        channel=payload.channel,
        payload=payload.payload,
    )
    
    return MarketingEventResponse(**event)


@router.get("/events", response_model=list[MarketingEventResponse])
async def list_marketing_events(
    current_doctor: CurrentDoctor,
    patient_id: str | None = Query(None, description="Filter by patient ID"),
    event_type: str | None = Query(None, description="Filter by event type"),
    limit: int = Query(100, ge=1, le=500),
) -> list[MarketingEventResponse]:
    """
    List marketing events for the current doctor.
    """
    events = marketing_service.list_marketing_events(
        doctor_id=current_doctor.doctor_id,
        patient_id=patient_id,
        event_type=event_type,
        limit=limit,
    )
    
    return [MarketingEventResponse(**event) for event in events]


@router.get("/birthdays", response_model=list[PatientBirthdayResponse])
async def get_upcoming_birthdays(
    current_doctor: CurrentDoctor,
    range: Literal["today", "week", "month"] = Query("month", description="Birthday range filter"),
) -> list[PatientBirthdayResponse]:
    """
    Get patients with upcoming birthdays.
    
    - today: Only patients whose birthday is today
    - week: Patients with birthdays in the next 7 days
    - month: Patients with birthdays in the next 30 days
    """
    patients = marketing_service.get_patients_with_upcoming_birthdays(
        doctor_id=current_doctor.doctor_id,
        range_type=range,
    )
    
    return [PatientBirthdayResponse(**patient) for patient in patients]


@router.post("/ai-generate", response_model=AIGenerateResponse)
async def generate_ai_marketing_text(
    payload: AIGenerateRequest,
    current_doctor: CurrentDoctor,
) -> AIGenerateResponse:
    """
    Generate AI-powered marketing text for a patient.
    
    The doctor can then review, edit, and copy the text.
    No automatic sending - copy only.
    """
    # Verify patient belongs to this doctor and get patient data
    patient = verify_patient_ownership(payload.patient_id, current_doctor)
    
    patient_name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
    segment = patient.get("segment", "regular")
    
    # Build context
    context = {
        "discount_percent": payload.discount_percent,
        "birth_date": patient.get("birth_date"),
    }
    
    # Generate text
    generated_text = await ai_marketing_service.generate_marketing_text(
        msg_type=payload.type,
        language=payload.language,
        segment=segment,
        patient_name=patient_name,
        context=context,
    )
    
    # Log the generation event
    marketing_service.create_marketing_event(
        doctor_id=current_doctor.doctor_id,
        patient_id=payload.patient_id,
        event_type=f"ai_{payload.type}_generated",
        channel="ai",
        payload={
            "language": payload.language,
            "segment": segment,
            "discount_percent": payload.discount_percent,
        },
    )
    
    return AIGenerateResponse(
        text=generated_text,
        type=payload.type,
        language=payload.language,
        segment=segment,
        char_count=len(generated_text),
    )
