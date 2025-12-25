"""
Statistics API - Endpoints for clinic statistics.

Provides aggregated data for the Statistics screen in SmileCRM.
All endpoints require JWT Bearer token authentication.
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.services import statistics_service

router = APIRouter(prefix="/statistics", tags=["statistics"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


class VisitSeriesPoint(BaseModel):
    """A single point in the visits time series."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    count: int = Field(..., description="Number of visits on this date")


class StatsOverviewResponse(BaseModel):
    """Statistics overview response model."""
    # Patients
    patients_total: int = Field(default=0, description="Total number of patients")
    patients_active: int = Field(default=0, description="Active patients (in_progress status or recent visits)")
    patients_vip: int = Field(default=0, description="VIP patients count")
    
    # Visits
    visits_total: int = Field(default=0, description="Total visits ever")
    visits_today: int = Field(default=0, description="Visits scheduled for today")
    visits_last_7d: int = Field(default=0, description="Visits in last 7 days (including today)")
    visits_last_30d: int = Field(default=0, description="Visits in last 30 days (including today)")
    
    # Finance (AMD - Armenian Dram)
    finance_today_income_amd: float = Field(default=0, description="Today's income in AMD")
    finance_month_income_amd: float = Field(default=0, description="This month's income in AMD")
    finance_month_expense_amd: float = Field(default=0, description="This month's expenses in AMD")
    
    # Chart data
    visits_series: List[VisitSeriesPoint] = Field(default_factory=list, description="Daily visit counts for chart")


@router.get("/overview", response_model=StatsOverviewResponse)
async def get_statistics_overview(
    current_doctor: CurrentDoctor,
    range: str = Query(
        default="7d",
        alias="range",
        description="Period for visits chart and series: '7d' or '30d'",
    ),
) -> StatsOverviewResponse:
    """
    Get aggregated statistics overview for the authenticated doctor.
    
    All data is calculated from real database records:
    - Patients: counted from patients table filtered by doctor_id
    - Visits: counted from visits table filtered by doctor_id
    - Finance: summed from patient_payments table filtered by doctor_id
    
    Query params:
    - range: '7d' or '30d' - affects visits_series data for chart
    
    Returns all numeric fields defaulting to 0 if no data exists.
    """
    data = statistics_service.get_statistics_overview(
        doctor_id=current_doctor.doctor_id,
        chart_period=range,
    )
    return StatsOverviewResponse(**data)
