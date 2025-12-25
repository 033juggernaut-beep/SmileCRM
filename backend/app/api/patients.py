from __future__ import annotations

import logging
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
  MedicationCreateRequest,
  MedicationResponse,
)
from app.services import patients_service, visits_service, medications_service, treatment_plan_service

logger = logging.getLogger(__name__)

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
  segment: str | None = None
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
  try:
    updated_patient = patients_service.update_patient(
      patient_id=patient_id,
      doctor_id=current_doctor.doctor_id,
      update_data=update_data
    )
  except Exception as e:
    logger.error(f"Failed to update patient {patient_id}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to update patient: {str(e)}"
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


# ============ Medications Endpoints ============

@router.get("/{patient_id}/medications", response_model=list[MedicationResponse])
async def list_patient_medications(
  patient_id: str,
  current_doctor: CurrentDoctor
) -> list[MedicationResponse]:
  """Get all medications for a patient."""
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  medications = medications_service.list_by_patient(patient_id, current_doctor.doctor_id)
  return [MedicationResponse(**med) for med in medications]


@router.post(
  "/{patient_id}/medications",
  response_model=MedicationResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_patient_medication(
  patient_id: str,
  payload: MedicationCreateRequest,
  current_doctor: CurrentDoctor,
) -> MedicationResponse:
  """Create a new medication prescription for a patient."""
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  try:
    medication = medications_service.create_medication(
      patient_id=patient_id,
      doctor_id=current_doctor.doctor_id,
      name=payload.name,
      dosage=payload.dosage,
      comment=payload.comment,
    )
  except Exception as e:
    logger.error(f"Failed to create medication for patient {patient_id}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to create medication: {str(e)}"
    )
  return MedicationResponse(**medication)


# ============ Treatment Plan Endpoints ============

class TreatmentPlanItemRequest(BaseModel):
  """Request body for creating/updating treatment plan item."""
  title: str
  price_amd: float = 0
  tooth: str | None = None


class TreatmentPlanItemUpdateRequest(BaseModel):
  """Request body for updating treatment plan item."""
  title: str | None = None
  price_amd: float | None = None
  is_done: bool | None = None
  tooth: str | None = None


class TreatmentPlanItemResponse(BaseModel):
  """Response model for treatment plan item."""
  id: str
  patient_id: str
  doctor_id: str
  title: str
  price_amd: float
  is_done: bool
  tooth: str | None = None
  sort_order: int = 0
  created_at: str | None = None
  updated_at: str | None = None


class TreatmentTotalResponse(BaseModel):
  """Response model for treatment plan totals."""
  total_amd: float
  completed_amd: float
  pending_amd: float


@router.get("/{patient_id}/treatment-plan", response_model=list[TreatmentPlanItemResponse])
async def list_treatment_plan(
  patient_id: str,
  current_doctor: CurrentDoctor,
) -> list[TreatmentPlanItemResponse]:
  """Get all treatment plan items for a patient."""
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  items = treatment_plan_service.list_by_patient(patient_id, current_doctor.doctor_id)
  return [TreatmentPlanItemResponse(**item) for item in items]


@router.post(
  "/{patient_id}/treatment-plan/items",
  response_model=TreatmentPlanItemResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_treatment_plan_item(
  patient_id: str,
  payload: TreatmentPlanItemRequest,
  current_doctor: CurrentDoctor,
) -> TreatmentPlanItemResponse:
  """Create a new treatment plan item for a patient."""
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  item = treatment_plan_service.create_item(
    patient_id=patient_id,
    doctor_id=current_doctor.doctor_id,
    title=payload.title,
    price_amd=payload.price_amd,
    tooth=payload.tooth,
  )
  return TreatmentPlanItemResponse(**item)


@router.get("/{patient_id}/treatment-plan/total", response_model=TreatmentTotalResponse)
async def get_treatment_plan_total(
  patient_id: str,
  current_doctor: CurrentDoctor,
) -> TreatmentTotalResponse:
  """Get treatment plan totals for a patient."""
  _ = _get_patient_for_doctor(patient_id, current_doctor)
  totals = treatment_plan_service.get_treatment_total(patient_id, current_doctor.doctor_id)
  return TreatmentTotalResponse(**totals)


@router.patch(
  "/treatment-plan/items/{item_id}",
  response_model=TreatmentPlanItemResponse,
)
async def update_treatment_plan_item(
  item_id: str,
  payload: TreatmentPlanItemUpdateRequest,
  current_doctor: CurrentDoctor,
) -> TreatmentPlanItemResponse:
  """Update a treatment plan item."""
  item = treatment_plan_service.get_by_id(item_id)
  if not item:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
  
  # Verify ownership
  if item.get("doctor_id") != current_doctor.doctor_id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
  
  update_values = payload.model_dump(exclude_unset=True)
  if not update_values:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")
  
  updated = treatment_plan_service.update_item(item_id, update_values)
  if not updated:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
  
  return TreatmentPlanItemResponse(**updated)


@router.delete("/treatment-plan/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_treatment_plan_item(
  item_id: str,
  current_doctor: CurrentDoctor,
) -> None:
  """Delete a treatment plan item."""
  item = treatment_plan_service.get_by_id(item_id)
  if not item:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
  
  # Verify ownership
  if item.get("doctor_id") != current_doctor.doctor_id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
  
  if not treatment_plan_service.delete_item(item_id):
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete")


