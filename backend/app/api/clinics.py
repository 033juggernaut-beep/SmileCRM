"""
Clinics API Router

Provides endpoints for the Clinic → Doctor → Patients hierarchy:
- GET /api/clinics - list clinics visible to current doctor
- GET /api/clinics/{clinic_id}/doctors - list doctors in a clinic
- GET /api/doctors/{doctor_id}/patients - list patients for a specific doctor

Authorization rules:
- Normal doctor: can only see their own clinic, their own doctor record, and their own patients
- Future: clinic admin could see all doctors and their patients
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import (
    ClinicOut,
    DoctorOut,
    PatientResponse,
    PatientWithDoctorResponse,
    DoctorSummary,
)
from app.services import clinics_service, doctors_service, patients_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clinics", tags=["clinics"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


@router.get("/", response_model=list[ClinicOut])
async def list_clinics(current_doctor: CurrentDoctor) -> list[ClinicOut]:
    """
    List clinics visible to the current doctor.
    
    Currently returns only the doctor's own clinic.
    In future, could return multiple clinics if doctor has access to several.
    """
    clinics = clinics_service.list_clinics_for_doctor(current_doctor.doctor_id)
    return [ClinicOut(**clinic) for clinic in clinics]


@router.get("/{clinic_id}", response_model=ClinicOut)
async def get_clinic(clinic_id: str, current_doctor: CurrentDoctor) -> ClinicOut:
    """
    Get a specific clinic by ID.
    
    Only accessible if current doctor has access to this clinic.
    """
    # Check access
    if not clinics_service.can_doctor_access_clinic(current_doctor.doctor_id, clinic_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this clinic"
        )
    
    clinic = clinics_service.get_clinic_by_id(clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    return ClinicOut(**clinic)


@router.get("/{clinic_id}/doctors", response_model=list[DoctorOut])
async def list_clinic_doctors(clinic_id: str, current_doctor: CurrentDoctor) -> list[DoctorOut]:
    """
    List all doctors in a specific clinic.
    
    Only accessible if current doctor has access to this clinic.
    """
    # Check access
    if not clinics_service.can_doctor_access_clinic(current_doctor.doctor_id, clinic_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this clinic"
        )
    
    doctors = clinics_service.list_doctors_in_clinic(clinic_id)
    
    # Get clinic name for response
    clinic = clinics_service.get_clinic_by_id(clinic_id)
    clinic_name = clinic.get("name") if clinic else None
    
    return [
        DoctorOut(
            id=doc["id"],
            first_name=doc["first_name"],
            last_name=doc.get("last_name"),
            specialization=doc.get("specialization"),
            clinic_id=doc.get("clinic_id"),
            clinic_name=clinic_name,
        )
        for doc in doctors
    ]


# ============================================================
# Doctor-specific endpoints (mounted here for logical grouping)
# ============================================================

doctors_router = APIRouter(prefix="/doctors", tags=["doctors"])


@doctors_router.get("/{doctor_id}/patients", response_model=list[PatientWithDoctorResponse])
async def list_doctor_patients(
    doctor_id: str, 
    current_doctor: CurrentDoctor
) -> list[PatientWithDoctorResponse]:
    """
    List all patients for a specific doctor.
    
    Only accessible if current doctor has access to target doctor's data:
    - Own patients (doctor_id matches current doctor)
    - Same clinic doctors' patients (if in same clinic)
    """
    # Check access
    if not clinics_service.can_doctor_access_doctor(current_doctor.doctor_id, doctor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this doctor's patients"
        )
    
    # Get patients with doctor info
    patients = patients_service.list_by_doctor_with_doctor_info(doctor_id)
    
    # Get doctor info for embedding
    doctor = doctors_service.get_by_id(doctor_id)
    doctor_summary = None
    if doctor:
        full_name = doctor.get("first_name", "")
        if doctor.get("last_name"):
            full_name += " " + doctor.get("last_name")
        doctor_summary = DoctorSummary(
            id=doctor["id"],
            first_name=doctor.get("first_name", ""),
            last_name=doctor.get("last_name"),
            full_name=full_name.strip() or None,
        )
    
    result = []
    for patient in patients:
        # Extract clinic_name from view or use None
        clinic_name = patient.get("clinic_name")
        
        result.append(PatientWithDoctorResponse(
            id=patient["id"],
            first_name=patient["first_name"],
            last_name=patient["last_name"],
            diagnosis=patient.get("diagnosis"),
            phone=patient.get("phone"),
            status=patient.get("status"),
            birth_date=patient.get("birth_date"),
            gender=patient.get("gender"),
            segment=patient.get("segment"),
            notes=patient.get("notes"),
            treatment_plan_total=patient.get("treatment_plan_total"),
            treatment_plan_currency=patient.get("treatment_plan_currency"),
            telegram_username=patient.get("telegram_username"),
            whatsapp_phone=patient.get("whatsapp_phone"),
            viber_phone=patient.get("viber_phone"),
            doctor_id=patient.get("doctor_id"),
            created_at=patient.get("created_at"),
            marketing_opt_in=patient.get("marketing_opt_in"),
            doctor=doctor_summary,
            clinic_name=clinic_name,
        ))
    
    return result


@doctors_router.get("/me/clinic", response_model=ClinicOut | None)
async def get_my_clinic(current_doctor: CurrentDoctor) -> ClinicOut | None:
    """
    Get the current doctor's clinic.
    
    Returns None if doctor is not assigned to any clinic.
    """
    clinics = clinics_service.list_clinics_for_doctor(current_doctor.doctor_id)
    if not clinics:
        return None
    
    return ClinicOut(**clinics[0])

