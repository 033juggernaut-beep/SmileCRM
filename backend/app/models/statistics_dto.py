"""
Statistics DTOs - Pydantic schemas for statistics endpoint responses.

All fields are strictly typed and guaranteed to return 0 when no data available,
never null/None, for frontend compatibility.
"""

from datetime import date
from typing import List

from pydantic import BaseModel, Field


class PatientsStats(BaseModel):
    """Patient counts aggregation."""
    total: int = Field(default=0, ge=0, description="Total number of patients")
    active: int = Field(default=0, ge=0, description="Patients with status 'in_progress'")
    vip: int = Field(default=0, ge=0, description="VIP patients (segment='vip')")


class VisitsStats(BaseModel):
    """Visit counts for different periods."""
    today: int = Field(default=0, ge=0, description="Visits scheduled for today")
    last_7_days: int = Field(default=0, ge=0, description="Visits in the last 7 days")
    last_30_days: int = Field(default=0, ge=0, description="Visits in the last 30 days")


class FinanceStats(BaseModel):
    """Financial aggregations."""
    income_today: float = Field(default=0, ge=0, description="Total payments received today")
    income_month: float = Field(default=0, ge=0, description="Total payments received this calendar month")
    expenses_month: float = Field(default=0, ge=0, description="Total expenses this month (stub: always 0)")


class VisitChartPoint(BaseModel):
    """Single point on the visits chart."""
    date: date = Field(description="Date of visits")
    count: int = Field(default=0, ge=0, description="Number of visits on this date")


class VisitsChart(BaseModel):
    """Chart data for visit dynamics."""
    period: str = Field(default="7d", description="Chart period: 7d or 30d")
    points: List[VisitChartPoint] = Field(default_factory=list, description="Data points sorted by date ASC")


class StatisticsOverviewResponse(BaseModel):
    """
    Full statistics overview response.
    
    This is the complete response returned by GET /api/statistics/overview
    """
    patients: PatientsStats = Field(default_factory=PatientsStats)
    visits: VisitsStats = Field(default_factory=VisitsStats)
    finance: FinanceStats = Field(default_factory=FinanceStats)
    visits_chart: VisitsChart = Field(default_factory=VisitsChart)
