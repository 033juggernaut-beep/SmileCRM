"""
AI Usage Service - Tracks daily AI request limits per doctor.

Uses Supabase table ai_usage_daily to track usage.
If table doesn't exist, falls back to in-memory tracking (resets on restart).
"""

import logging
from collections import defaultdict
from datetime import date
from typing import Any, Dict, Optional, Tuple

from app.services.supabase_client import SupabaseNotConfiguredError, supabase_client

logger = logging.getLogger("smilecrm.ai_usage")

# In-memory fallback for when Supabase table doesn't exist
# Key: (doctor_id, date_str), Value: count
_memory_usage: Dict[Tuple[str, str], int] = defaultdict(int)


def _get_today_str() -> str:
    """Get today's date as ISO string."""
    return date.today().isoformat()


def get_limit_by_subscription(subscription_status: Optional[str]) -> int:
    """
    Determine daily AI request limit based on subscription status.
    
    Args:
        subscription_status: Doctor's subscription status from DB
        
    Returns:
        Daily request limit
    """
    status = (subscription_status or "trial").lower()
    
    if status in ("active", "pro", "premium"):
        return 50
    elif status in ("trial", "basic"):
        return 5
    elif status in ("expired", "canceled"):
        return 0
    else:
        # Unknown status, default to trial limit
        return 5


def get_today_usage(doctor_id: str) -> int:
    """
    Get today's AI request count for a doctor.
    
    Args:
        doctor_id: UUID of the doctor
        
    Returns:
        Number of requests made today
    """
    today = _get_today_str()
    
    try:
        # Try to fetch from Supabase
        rows = supabase_client.select(
            "ai_usage_daily",
            filters={"doctor_id": doctor_id, "day": today},
            limit=1,
        )
        if rows:
            return rows[0].get("count", 0)
        return 0
    except SupabaseNotConfiguredError:
        # Supabase not configured, use memory fallback
        return _memory_usage[(doctor_id, today)]
    except Exception as e:
        # Table might not exist yet, use memory fallback
        logger.debug(f"ai_usage_daily table not found, using memory fallback: {e}")
        return _memory_usage[(doctor_id, today)]


def increment_today(doctor_id: str) -> int:
    """
    Increment today's AI request count for a doctor.
    
    Args:
        doctor_id: UUID of the doctor
        
    Returns:
        New count after increment
    """
    today = _get_today_str()
    
    try:
        # Try to use Supabase with upsert
        client = supabase_client._client_or_raise()
        
        # Try to get current count
        existing = client.table("ai_usage_daily").select("*").eq(
            "doctor_id", doctor_id
        ).eq("day", today).execute()
        
        if existing.data:
            # Update existing row
            new_count = existing.data[0].get("count", 0) + 1
            client.table("ai_usage_daily").update(
                {"count": new_count}
            ).eq("doctor_id", doctor_id).eq("day", today).execute()
            return new_count
        else:
            # Insert new row
            client.table("ai_usage_daily").insert({
                "doctor_id": doctor_id,
                "day": today,
                "count": 1,
            }).execute()
            return 1
            
    except SupabaseNotConfiguredError:
        # Supabase not configured, use memory fallback
        _memory_usage[(doctor_id, today)] += 1
        return _memory_usage[(doctor_id, today)]
    except Exception as e:
        # Table might not exist yet, use memory fallback
        logger.debug(f"ai_usage_daily table not found, using memory fallback: {e}")
        _memory_usage[(doctor_id, today)] += 1
        return _memory_usage[(doctor_id, today)]


def check_and_increment(doctor_id: str, limit: int) -> tuple[bool, int, int]:
    """
    Check if doctor can make a request and increment if allowed.
    
    Args:
        doctor_id: UUID of the doctor
        limit: Daily request limit
        
    Returns:
        Tuple of (allowed, remaining_after, limit)
    """
    current = get_today_usage(doctor_id)
    
    if current >= limit:
        return False, 0, limit
    
    new_count = increment_today(doctor_id)
    remaining = max(0, limit - new_count)
    
    return True, remaining, limit

