"""
Treatment Plan Service - CRUD operations for treatment plan items.

Handles creating, reading, updating, and deleting treatment plan items for patients.
"""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_by_patient(patient_id: str, doctor_id: str) -> List[Dict[str, Any]]:
    """Get all treatment plan items for a patient."""
    try:
        items = supabase_client.select(
            "treatment_plan_items",
            filters={"patient_id": patient_id, "doctor_id": doctor_id},
        )
        # Sort by sort_order in Python
        return sorted(items, key=lambda x: x.get("sort_order", 0))
    except SupabaseNotConfiguredError:
        return []


def get_by_id(item_id: str) -> Optional[Dict[str, Any]]:
    """Get a single treatment plan item by ID."""
    try:
        rows = supabase_client.select(
            "treatment_plan_items",
            filters={"id": item_id},
            limit=1,
        )
        return rows[0] if rows else None
    except SupabaseNotConfiguredError:
        return None


def create_item(
    patient_id: str,
    doctor_id: str,
    title: str,
    price_amd: float = 0,
    tooth: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a new treatment plan item."""
    # Get max sort_order for this patient
    existing = list_by_patient(patient_id, doctor_id)
    max_order = max((item.get("sort_order", 0) for item in existing), default=-1)
    
    body = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "title": title,
        "price_amd": price_amd,
        "is_done": False,
        "tooth": tooth,
        "sort_order": max_order + 1,
    }
    
    try:
        inserted = supabase_client.insert("treatment_plan_items", body)
        return inserted[0] if inserted else body
    except SupabaseNotConfiguredError:
        return {"id": f"local-{datetime.utcnow().timestamp()}", **body}


def update_item(item_id: str, values: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update a treatment plan item."""
    if not values:
        return None
    
    # Add updated_at timestamp
    values["updated_at"] = datetime.utcnow().isoformat()
    
    try:
        updated = supabase_client.update(
            "treatment_plan_items",
            filters={"id": item_id},
            values=values,
        )
        return updated[0] if updated else None
    except SupabaseNotConfiguredError:
        return {"id": item_id, **values}


def toggle_done(item_id: str) -> Optional[Dict[str, Any]]:
    """Toggle the is_done status of a treatment plan item."""
    item = get_by_id(item_id)
    if not item:
        return None
    
    new_done = not item.get("is_done", False)
    return update_item(item_id, {"is_done": new_done})


def delete_item(item_id: str) -> bool:
    """Delete a treatment plan item."""
    try:
        supabase_client.delete("treatment_plan_items", filters={"id": item_id})
        return True
    except SupabaseNotConfiguredError:
        return False
    except Exception:
        return False


def get_treatment_total(patient_id: str, doctor_id: str) -> Dict[str, float]:
    """
    Calculate treatment plan totals for a patient.
    
    Returns:
        {
            "total_amd": sum of all items,
            "completed_amd": sum of completed items (is_done=True),
            "pending_amd": sum of pending items (is_done=False)
        }
    """
    items = list_by_patient(patient_id, doctor_id)
    
    total = Decimal(0)
    completed = Decimal(0)
    
    for item in items:
        price = Decimal(str(item.get("price_amd", 0) or 0))
        total += price
        if item.get("is_done"):
            completed += price
    
    return {
        "total_amd": float(total),
        "completed_amd": float(completed),
        "pending_amd": float(total - completed),
    }

