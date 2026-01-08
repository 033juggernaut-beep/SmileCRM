from __future__ import annotations

from datetime import date, datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import (
  PatientSummary,
  TodayVisitsResponse,
  VisitResponse,
  VisitStatusUpdateRequest,
  VisitUpdateRequest,
  VisitWithPatientResponse,
)
from app.services import visits_service

router = APIRouter(prefix="/visits", tags=["visits"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


def _map_visit_with_patient(row: dict) -> VisitWithPatientResponse:
  """Map a visit row with joined patient data to response model."""
  patient_data = row.pop("patients", None)
  patient = None
  if patient_data:
    patient = PatientSummary(
      id=patient_data.get("id", ""),
      first_name=patient_data.get("first_name", ""),
      last_name=patient_data.get("last_name", ""),
      phone=patient_data.get("phone"),
      telegram_user_id=patient_data.get("telegram_user_id"),
      telegram_username=patient_data.get("telegram_username"),
      whatsapp_phone=patient_data.get("whatsapp_phone"),
    )
  
  return VisitWithPatientResponse(
    id=row.get("id", ""),
    doctor_id=row.get("doctor_id"),
    patient_id=row.get("patient_id", ""),
    visit_date=row.get("visit_date"),
    visit_time=row.get("visit_time"),
    next_visit_date=row.get("next_visit_date"),
    notes=row.get("notes"),
    medications=row.get("medications"),
    status=row.get("status", "scheduled"),
    status_changed_at=row.get("status_changed_at"),
    status_note=row.get("status_note"),
    rescheduled_to=row.get("rescheduled_to"),
    rescheduled_time=row.get("rescheduled_time"),
    reminder_status=row.get("reminder_status"),
    reminder_sent_at=row.get("reminder_sent_at"),
    reminder_channel=row.get("reminder_channel"),
    created_at=row.get("created_at"),
    patient=patient,
  )


@router.get(
  "/today",
  response_model=TodayVisitsResponse,
  status_code=status.HTTP_200_OK,
)
async def get_today_visits(
  current_doctor: CurrentDoctor,
) -> TodayVisitsResponse:
  """
  Get all visits for today for the current doctor.
  Returns visits ordered by time with patient data included.
  """
  today = date.today()
  rows = visits_service.list_by_doctor_and_date(current_doctor.doctor_id, today)
  
  visits = [_map_visit_with_patient(row) for row in rows]
  
  return TodayVisitsResponse(
    date=today,
    count=len(visits),
    visits=visits,
  )


@router.get(
  "",
  response_model=TodayVisitsResponse,
  status_code=status.HTTP_200_OK,
)
async def get_visits_by_date(
  current_doctor: CurrentDoctor,
  date_param: date = Query(alias="date", default=None, description="Date to get visits for (YYYY-MM-DD)"),
) -> TodayVisitsResponse:
  """
  Get all visits for a specific date for the current doctor.
  If no date is provided, returns today's visits.
  """
  target_date = date_param or date.today()
  rows = visits_service.list_by_doctor_and_date(current_doctor.doctor_id, target_date)
  
  visits = [_map_visit_with_patient(row) for row in rows]
  
  return TodayVisitsResponse(
    date=target_date,
    count=len(visits),
    visits=visits,
  )


@router.patch(
  "/{visit_id}",
  response_model=VisitResponse,
  status_code=status.HTTP_200_OK,
)
async def update_visit(
  visit_id: str,
  payload: VisitUpdateRequest,
  current_doctor: CurrentDoctor,
) -> VisitResponse:
  """Update visit details (date, time, notes, medications)."""
  update_values = payload.dict(exclude_unset=True)
  if not update_values:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty update payload.")

  try:
    updated = visits_service.update_visit(visit_id, update_values)
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  if not updated:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found.")

  return VisitResponse(**updated)


@router.delete(
  "/{visit_id}",
  status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_visit(
  visit_id: str,
  current_doctor: CurrentDoctor,
) -> None:
  """Delete a visit by ID."""
  # Check if visit exists
  visit = visits_service.get_visit_by_id(visit_id)
  if not visit:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found.")
  
  # Delete the visit
  deleted = visits_service.delete_visit(visit_id)
  if not deleted:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found.")


@router.patch(
  "/{visit_id}/status",
  response_model=VisitWithPatientResponse,
  status_code=status.HTTP_200_OK,
)
async def update_visit_status(
  visit_id: str,
  payload: VisitStatusUpdateRequest,
  current_doctor: CurrentDoctor,
) -> VisitWithPatientResponse:
  """
  Update visit status with business logic:
  - in_progress/completed: only for today or past visits
  - rescheduled: creates a new visit on the new date
  - no_show: marks patient as no-show
  """
  # Get current visit
  visit = visits_service.get_visit_by_id(visit_id)
  if not visit:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found.")
  
  # Validate: in_progress/completed only for today or past
  visit_date = visit.get("visit_date")
  if isinstance(visit_date, str):
    visit_date = date.fromisoformat(visit_date)
  
  today = date.today()
  
  if payload.status in ("in_progress", "completed"):
    if visit_date and visit_date > today:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Cannot set status '{payload.status}' for future visits."
      )
  
  # Validate: rescheduled requires new date
  if payload.status == "rescheduled":
    if not payload.rescheduled_to:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="rescheduled_to date is required when status is 'rescheduled'."
      )
    
    # Parse rescheduled_time if provided
    rescheduled_time = None
    if payload.rescheduled_time:
      try:
        rescheduled_time = time.fromisoformat(payload.rescheduled_time)
      except ValueError:
        raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Invalid rescheduled_time format. Use HH:MM."
        )
    
    # Update current visit as rescheduled
    visits_service.update_visit_status(
      visit_id,
      status="rescheduled",
      note=payload.note,
      rescheduled_to=payload.rescheduled_to,
      rescheduled_time=rescheduled_time,
    )
    
    # Create new visit on the rescheduled date
    new_visit_payload = {
      "visit_date": payload.rescheduled_to.isoformat(),
      "visit_time": payload.rescheduled_time if payload.rescheduled_time else visit.get("visit_time"),
      "notes": visit.get("notes"),
      "medications": visit.get("medications"),
    }
    
    visits_service.create_visit(
      doctor_id=visit.get("doctor_id", current_doctor.doctor_id),
      patient_id=visit.get("patient_id"),
      payload=new_visit_payload,
    )
  else:
    # Simple status update
    visits_service.update_visit_status(
      visit_id,
      status=payload.status,
      note=payload.note,
    )
  
  # Return updated visit with patient data
  updated = visits_service.get_visit_with_patient(visit_id)
  if not updated:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found after update.")
  
  return _map_visit_with_patient(updated)
