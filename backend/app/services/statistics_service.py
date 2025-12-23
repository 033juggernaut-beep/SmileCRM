"""
Statistics Service - Business logic for statistics aggregation.

All aggregation logic is contained here. The API layer only calls this service.
Uses Supabase client for data fetching and performs aggregations in Python.

Design decisions:
- Returns 0 for any missing data, never null
- Ready for extension to 30d/90d periods
- Handles missing columns gracefully (e.g., segment field)
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any

from app.models.statistics_dto import (
    FinanceStats,
    PatientsStats,
    StatisticsOverviewResponse,
    StatsPeriod,
    VisitChartPoint,
    VisitsChart,
    VisitsStats,
)
from app.services.supabase_client import SupabaseNotConfiguredError, supabase_client


def _parse_date(value: Any) -> date | None:
    """Parse a date value from various formats."""
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        try:
            # Handle ISO format with or without time
            if "T" in value:
                return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def _parse_datetime(value: Any) -> datetime | None:
    """Parse a datetime value from various formats."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def get_patients_stats(doctor_id: str) -> PatientsStats:
    """
    Aggregate patient statistics for a doctor.
    
    - total: count(*)
    - active: count where status = 'in_progress'
    - vip: count where segment = 'vip' (fallback to 0 if field missing)
    """
    try:
        patients = supabase_client.select("patients", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return PatientsStats()
    
    total = len(patients)
    active = sum(1 for p in patients if p.get("status") == "in_progress")
    
    # VIP: check segment field (may not exist in older records)
    vip = sum(1 for p in patients if p.get("segment") == "vip")
    
    return PatientsStats(total=total, active=active, vip=vip)


def get_visits_stats(doctor_id: str) -> VisitsStats:
    """
    Aggregate visit statistics for a doctor.
    
    - today: visit_date = today
    - last_7_days: visit_date >= today - 7 days (inclusive of today)
    - last_30_days: visit_date >= today - 30 days (inclusive of today)
    """
    try:
        visits = supabase_client.select("visits", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return VisitsStats()
    
    today = date.today()
    seven_days_ago = today - timedelta(days=7)
    thirty_days_ago = today - timedelta(days=30)
    
    today_count = 0
    week_count = 0
    month_count = 0
    
    for visit in visits:
        visit_date = _parse_date(visit.get("visit_date"))
        if visit_date is None:
            continue
        
        if visit_date == today:
            today_count += 1
        
        if visit_date >= seven_days_ago:
            week_count += 1
        
        if visit_date >= thirty_days_ago:
            month_count += 1
    
    return VisitsStats(
        today=today_count,
        last_7_days=week_count,
        last_30_days=month_count,
    )


def get_finance_stats(doctor_id: str) -> FinanceStats:
    """
    Aggregate financial statistics for a doctor.
    
    Uses patient_payments table:
    - income_today: sum(amount) where paid_at is today
    - income_month: sum(amount) where paid_at is in current calendar month
    - expenses_month: stub, always returns 0 (no expenses table yet)
    """
    try:
        payments = supabase_client.select("patient_payments", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return FinanceStats()
    
    today = date.today()
    month_start = today.replace(day=1)
    
    income_today = Decimal(0)
    income_month = Decimal(0)
    
    for payment in payments:
        paid_at = _parse_datetime(payment.get("paid_at"))
        if paid_at is None:
            continue
        
        payment_date = paid_at.date()
        amount = Decimal(str(payment.get("amount", 0)))
        
        if payment_date == today:
            income_today += amount
        
        if payment_date >= month_start:
            income_month += amount
    
    return FinanceStats(
        income_today=float(income_today),
        income_month=float(income_month),
        expenses_month=0,  # Stub: no expenses tracking yet
    )


def get_visits_chart(doctor_id: str, period: StatsPeriod = "7d") -> VisitsChart:
    """
    Generate visits chart data for visualizing trends.
    
    - Groups visits by date
    - Returns count per date
    - Fills in missing dates with 0
    - Sorted by date ASC
    
    Args:
        doctor_id: UUID of the doctor
        period: "7d" or "30d" - how many days to include
    """
    try:
        visits = supabase_client.select("visits", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return VisitsChart(period=period, points=[])
    
    # Determine date range
    today = date.today()
    days = 7 if period == "7d" else 30
    start_date = today - timedelta(days=days - 1)  # Include today, so days-1 ago
    
    # Count visits per date
    visits_by_date: dict[date, int] = defaultdict(int)
    
    for visit in visits:
        visit_date = _parse_date(visit.get("visit_date"))
        if visit_date is None:
            continue
        
        if start_date <= visit_date <= today:
            visits_by_date[visit_date] += 1
    
    # Generate all dates in range (fill missing with 0)
    points: list[VisitChartPoint] = []
    current_date = start_date
    
    while current_date <= today:
        points.append(VisitChartPoint(
            date=current_date,
            count=visits_by_date.get(current_date, 0),
        ))
        current_date += timedelta(days=1)
    
    return VisitsChart(period=period, points=points)


def get_statistics_overview(
    doctor_id: str,
    chart_period: StatsPeriod = "7d",
) -> StatisticsOverviewResponse:
    """
    Get complete statistics overview for a doctor.
    
    This is the main entry point called by the API endpoint.
    Aggregates all statistics in a single response.
    
    Args:
        doctor_id: UUID of the authenticated doctor
        chart_period: Period for the visits chart ("7d" or "30d")
    
    Returns:
        StatisticsOverviewResponse with all aggregated data
    """
    return StatisticsOverviewResponse(
        patients=get_patients_stats(doctor_id),
        visits=get_visits_stats(doctor_id),
        finance=get_finance_stats(doctor_id),
        visits_chart=get_visits_chart(doctor_id, chart_period),
    )

