from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import (
  PatientCreateRequest,
  PatientResponse,
  VisitCreateRequest,
  VisitResponse,
)
from app.services import patients_service, visits_service

router = APIRouter(prefix="/patients", tags=["patients"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


@router.get("/", response_model=list[PatientResponse])
async def list_patients(current_doctor: CurrentDoctor) -> list[PatientResponse]:
  patients = patients_service.list_by_doctor(current_doctor.doctor_id)
  return [PatientResponse(**patient) for patient in patients]


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(payload: PatientCreateRequest, current_doctor: CurrentDoctor) -> PatientResponse:
  patient = patients_service.create_patient(current_doctor.doctor_id, payload.dict())
  return PatientResponse(**patient)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str, current_doctor: CurrentDoctor) -> PatientResponse:
  patient = _get_patient_for_doctor(patient_id, current_doctor)
  return PatientResponse(**patient)


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
    payload=payload.dict(),
  )
  return VisitResponse(**visit)


def _get_patient_for_doctor(patient_id: str, current_doctor: AuthenticatedDoctor) -> dict[str, Any]:
  patient = patients_service.get_patient(patient_id)
  if not patient:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

  patient_doctor_id = patient.get("doctor_id")
  if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

  return patient

