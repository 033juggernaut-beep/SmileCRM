"""
Statistics Service - Business logic for statistics aggregation.

All aggregation logic is contained here. The API layer only calls this service.
Uses Supabase client for data fetching and performs aggregations in Python.
"""

from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from app.services.supabase_client import SupabaseNotConfiguredError, supabase_client


def _parse_date(value: Any) -> Optional[date]:
    """Parse a date value from various formats."""
    if value is None:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        try:
            if "T" in value:
                return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def _parse_datetime(value: Any) -> Optional[datetime]:
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


def get_patients_stats(doctor_id: str) -> Dict[str, int]:
    """Aggregate patient statistics for a doctor."""
    try:
        patients = supabase_client.select("patients", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return {"total": 0, "active": 0, "vip": 0}
    
    total = len(patients)
    active = sum(1 for p in patients if p.get("status") == "in_progress")
    # Check both is_vip boolean and segment='vip'
    vip = sum(1 for p in patients if p.get("is_vip") is True or p.get("segment") == "vip")
    
    return {"total": total, "active": active, "vip": vip}


def get_visits_stats(doctor_id: str) -> Dict[str, int]:
    """Aggregate visit statistics for a doctor."""
    try:
        visits = supabase_client.select("visits", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return {"total": 0, "today": 0, "last_7_days": 0, "last_30_days": 0}
    
    today = date.today()
    seven_days_ago = today - timedelta(days=6)  # Include today = 7 days
    thirty_days_ago = today - timedelta(days=29)  # Include today = 30 days
    
    total_count = len(visits)
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
    
    return {
        "total": total_count,
        "today": today_count,
        "last_7_days": week_count,
        "last_30_days": month_count
    }


def get_finance_stats(doctor_id: str) -> Dict[str, float]:
    """Aggregate financial statistics for a doctor."""
    try:
        payments = supabase_client.select("patient_payments", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return {"income_today": 0, "income_month": 0, "expenses_month": 0}
    
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
    
    # TODO: Add expenses table support when available
    return {
        "income_today": float(income_today),
        "income_month": float(income_month),
        "expenses_month": 0,  # No expenses table yet
    }


def get_visits_series(doctor_id: str, period: str = "7d") -> List[Dict[str, Any]]:
    """Generate visits series data for chart visualization."""
    try:
        visits = supabase_client.select("visits", filters={"doctor_id": doctor_id})
    except SupabaseNotConfiguredError:
        return []
    
    today = date.today()
    days = 7 if period == "7d" else 30
    start_date = today - timedelta(days=days - 1)
    
    visits_by_date: Dict[date, int] = defaultdict(int)
    
    for visit in visits:
        visit_date = _parse_date(visit.get("visit_date"))
        if visit_date is None:
            continue
        if start_date <= visit_date <= today:
            visits_by_date[visit_date] += 1
    
    # Build series with all days (including zeros for empty days)
    series: List[Dict[str, Any]] = []
    current_date = start_date
    
    while current_date <= today:
        series.append({
            "date": current_date.isoformat(),
            "count": visits_by_date.get(current_date, 0),
        })
        current_date += timedelta(days=1)
    
    return series


def get_statistics_overview(doctor_id: str, chart_period: str = "7d") -> Dict[str, Any]:
    """
    Get complete statistics overview for a doctor.
    
    Returns flat JSON structure:
    {
        "patients_total": 0,
        "patients_active": 0,
        "patients_vip": 0,
        "visits_total": 0,
        "visits_today": 0,
        "visits_last_7d": 0,
        "visits_last_30d": 0,
        "finance_today_income_amd": 0,
        "finance_month_income_amd": 0,
        "finance_month_expense_amd": 0,
        "visits_series": [{"date": "...", "count": 0}, ...]
    }
    """
    patients = get_patients_stats(doctor_id)
    visits = get_visits_stats(doctor_id)
    finance = get_finance_stats(doctor_id)
    series = get_visits_series(doctor_id, chart_period)
    
    return {
        # Patients
        "patients_total": patients["total"],
        "patients_active": patients["active"],
        "patients_vip": patients["vip"],
        # Visits
        "visits_total": visits["total"],
        "visits_today": visits["today"],
        "visits_last_7d": visits["last_7_days"],
        "visits_last_30d": visits["last_30_days"],
        # Finance (AMD currency)
        "finance_today_income_amd": finance["income_today"],
        "finance_month_income_amd": finance["income_month"],
        "finance_month_expense_amd": finance["expenses_month"],
        # Chart series
        "visits_series": series,
    }
