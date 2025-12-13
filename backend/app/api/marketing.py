"""Marketing API endpoints for patient marketing events and birthday management."""
from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query

from app.api.deps import AuthenticatedDoctor, get_current_doctor, verify_patient_ownership
from app.models.dto import (
    MarketingEventCreateRequest,
    MarketingEventResponse,
    PatientBirthdayResponse,
)
from app.services import marketing_service

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
