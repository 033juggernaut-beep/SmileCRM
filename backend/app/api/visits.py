from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.dto import VisitResponse, VisitUpdateRequest
from app.services import visits_service

router = APIRouter(prefix="/visits", tags=["visits"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


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

