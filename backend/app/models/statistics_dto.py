"""
Statistics DTOs - Pydantic schemas for statistics endpoint responses.
"""

from datetime import date
from typing import Any, Dict, List

from pydantic import BaseModel


class PatientsStats(BaseModel):
    total: int = 0
    active: int = 0
    vip: int = 0


class VisitsStats(BaseModel):
    today: int = 0
    last_7_days: int = 0
    last_30_days: int = 0


class FinanceStats(BaseModel):
    income_today: float = 0
    income_month: float = 0
    expenses_month: float = 0


class VisitChartPoint(BaseModel):
    date: str  # ISO date string
    count: int = 0


class VisitsChart(BaseModel):
    period: str = "7d"
    points: List[Dict[str, Any]] = []  # List of {date: str, count: int}


class StatisticsOverviewResponse(BaseModel):
    patients: Dict[str, int] = {}
    visits: Dict[str, int] = {}
    finance: Dict[str, float] = {}
    visits_chart: Dict[str, Any] = {}
