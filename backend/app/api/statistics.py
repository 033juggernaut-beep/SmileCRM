"""
Statistics API - Endpoints for clinic statistics.

Provides aggregated data for the Statistics screen in SmileCRM.
All endpoints require JWT Bearer token authentication.
"""

from typing import Annotated, Any, Dict

from fastapi import APIRouter, Depends, Query

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.services import statistics_service

router = APIRouter(prefix="/statistics", tags=["statistics"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


@router.get("/overview")
async def get_statistics_overview(
    current_doctor: CurrentDoctor,
    chart_period: str = Query(
        default="7d",
        description="Period for visits chart: '7d' or '30d'",
    ),
) -> Dict[str, Any]:
    """
    Get aggregated statistics overview for the authenticated doctor.
    
    Returns:
        - patients: total, active (in_progress), VIP counts
        - visits: today, last 7 days, last 30 days counts
        - finance: income today, income this month, expenses (stub: 0)
        - visits_chart: daily visit counts for the selected period
    
    All numeric fields default to 0 if no data exists (never null).
    """
    return statistics_service.get_statistics_overview(
        doctor_id=current_doctor.doctor_id,
        chart_period=chart_period,
    )
