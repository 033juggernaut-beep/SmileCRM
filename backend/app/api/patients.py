from __future__ import annotations

from datetime import date
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from decimal import Decimal

from pydantic import BaseModel, condecimal

from app.api.deps import AuthenticatedDoctor, get_current_doctor, verify_patient_ownership
from app.models.dto import (
  PatientCreateRequest,
  PatientResponse,
  VisitCreateRequest,
  VisitResponse,
)
from app.services import patients_service, visits_service

# Alias for backward compatibility within this module
_get_patient_for_doctor = verify_patient_ownership

router = APIRouter(prefix="/patients", tags=["patients"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


class PatientUpdateRequest(BaseModel):
  """Request body for updating a patient."""
  first_name: str | None = None
  last_name: str | None = None
  diagnosis: str | None = None
  phone: str | None = None
  status: str | None = None
  birth_date: date | None = None
  treatment_plan_total: condecimal(max_digits=12, decimal_places=2) | None = None  # type: ignore
  treatment_plan_currency: str | None = None


@router.get("/", response_model=list[PatientResponse])
async def list_patients(current_doctor: CurrentDoctor) -> list[PatientResponse]:
  patients = patients_service.list_by_doctor(current_doctor.doctor_id)
  return [PatientResponse(**patient) for patient in patients]


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(payload: PatientCreateRequest, current_doctor: CurrentDoctor) -> PatientResponse:
  patient = patients_service.create_patient(current_doctor.doctor_id, payload.model_dump())
  return PatientResponse(**patient)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, current_doctor: CurrentDoctor) -> PatientResponse:
  patient = _get_patient_for_doctor(patient_id, current_doctor)
  return PatientResponse(**patient)


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
  patient_id: str,
  payload: PatientUpdateRequest,
  current_doctor: CurrentDoctor
) -> PatientResponse:
  """
  Update patient information.
  
  Only fields provided in the request will be updated.
  """
  # Check if patient exists and belongs to current doctor
  patient = _get_patient_for_doctor(patient_id, current_doctor)
  
  # Build update payload (only non-None fields)
  update_data = {
    k: v for k, v in payload.model_dump().items() if v is not None
  }
  
  if not update_data:
    # No fields to update, return existing patient
    return PatientResponse(**patient)
  
  # Update patient
  updated_patient = patients_service.update_patient(
    patient_id=patient_id,
    doctor_id=current_doctor.doctor_id,
    update_data=update_data
  )
  
  return PatientResponse(**updated_patient)


@router.get("/{patient_id}/visits", response_model=list[VisitResponse])
async def list_patient_visits(patient_id: str, current_doctor: CurrentDoctor) -> list[VisitResponse]:
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  visits = visits_service.list_by_patient(patient_id)
  return [VisitResponse(**visit) for visit in visits]


@router.post(
  "/{patient_id}/visits",
  response_model=VisitResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_patient_visit(
  patient_id: str,
  payload: VisitCreateRequest,
  current_doctor: CurrentDoctor,
) -> VisitResponse:
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  visit = visits_service.create_visit(
    doctor_id=current_doctor.doctor_id,
    patient_id=patient_id,
    payload=payload.model_dump(),
  )
  return VisitResponse(**visit)



