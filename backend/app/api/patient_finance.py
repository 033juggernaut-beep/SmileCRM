from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import (
  PatientFinanceSummary,
  PatientPaymentCreateRequest,
  PatientPaymentResponse,
  PatientPaymentUpdateRequest,
)
from app.services import patient_payments_service, patients_service

router = APIRouter(prefix="/patients", tags=["patient-finance"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


@router.get("/{patient_id}/payments", response_model=list[PatientPaymentResponse])
async def list_patient_payments(
  patient_id: str,
  current_doctor: CurrentDoctor,
) -> list[PatientPaymentResponse]:
  """List all payments for a specific patient."""
  # Verify patient belongs to this doctor
  patient = patients_service.get_patient(patient_id)
  if not patient:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  patient_doctor_id = patient.get("doctor_id")
  if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  payments = patient_payments_service.list_by_patient(patient_id, current_doctor.doctor_id)
  return [PatientPaymentResponse(**payment) for payment in payments]


@router.post(
  "/{patient_id}/payments",
  response_model=PatientPaymentResponse,
  status_code=status.HTTP_201_CREATED,
)
async def create_patient_payment(
  patient_id: str,
  payload: PatientPaymentCreateRequest,
  current_doctor: CurrentDoctor,
) -> PatientPaymentResponse:
  """Create a new payment record for a patient."""
  # Verify patient belongs to this doctor
  patient = patients_service.get_patient(patient_id)
  if not patient:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  patient_doctor_id = patient.get("doctor_id")
  if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  payment = patient_payments_service.create_payment(
    patient_id=patient_id,
    doctor_id=current_doctor.doctor_id,
    amount=payload.amount,
    comment=payload.comment,
    visit_id=payload.visit_id,
  )
  
  return PatientPaymentResponse(**payment)


@router.get("/{patient_id}/finance-summary", response_model=PatientFinanceSummary)
async def get_patient_finance_summary(
  patient_id: str,
  current_doctor: CurrentDoctor,
) -> PatientFinanceSummary:
  """Get financial summary for a patient (plan total, paid, remaining)."""
  # Verify patient belongs to this doctor
  patient = patients_service.get_patient(patient_id)
  if not patient:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  patient_doctor_id = patient.get("doctor_id")
  if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  summary = patient_payments_service.get_finance_summary(patient_id, current_doctor.doctor_id)
  return PatientFinanceSummary(**summary)


@router.patch(
  "/{patient_id}/payments/{payment_id}",
  response_model=PatientPaymentResponse,
)
async def update_patient_payment(
  patient_id: str,
  payment_id: str,
  payload: PatientPaymentUpdateRequest,
  current_doctor: CurrentDoctor,
) -> PatientPaymentResponse:
  """Update a payment record (amount or comment)."""
  # Verify patient belongs to this doctor
  patient = patients_service.get_patient(patient_id)
  if not patient:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  patient_doctor_id = patient.get("doctor_id")
  if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  updated = patient_payments_service.update_payment(
    payment_id=payment_id,
    doctor_id=current_doctor.doctor_id,
    amount=payload.amount,
    comment=payload.comment,
  )
  
  if not updated:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Payment not found.",
    )
  
  return PatientPaymentResponse(**updated)


@router.delete("/{patient_id}/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient_payment(
  patient_id: str,
  payment_id: str,
  current_doctor: CurrentDoctor,
) -> None:
  """Delete a payment record."""
  # Verify patient belongs to this doctor
  patient = patients_service.get_patient(patient_id)
  if not patient:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  patient_doctor_id = patient.get("doctor_id")
  if patient_doctor_id and patient_doctor_id != current_doctor.doctor_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Patient not found.",
    )
  
  success = patient_payments_service.delete_payment(payment_id, current_doctor.doctor_id)
  if not success:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Payment not found.",
    )

