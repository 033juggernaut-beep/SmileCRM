"""
Clinics service - handles clinic-related database operations.

Provides functionality to:
- List clinics visible to current doctor
- Get clinic by ID
- List doctors in a clinic
"""

from __future__ import annotations

from typing import Any

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_clinics() -> list[dict[str, Any]]:
    """Fetch all clinics (admin use only)."""
    try:
        return supabase_client.select("clinics")
    except SupabaseNotConfiguredError:
        return []


def get_clinic_by_id(clinic_id: str) -> dict[str, Any] | None:
    """Fetch a single clinic by ID."""
    try:
        rows = supabase_client.select(
            "clinics",
            filters={"id": clinic_id},
            limit=1,
        )
    except SupabaseNotConfiguredError:
        return None
    return rows[0] if rows else None


def list_clinics_for_doctor(doctor_id: str) -> list[dict[str, Any]]:
    """
    List clinics visible to a specific doctor.
    
    Currently, a doctor can only see their own clinic.
    In future, this could be extended to show clinics where
    the doctor has any association.
    """
    try:
        # Get doctor's clinic_id
        doctor_rows = supabase_client.select(
            "doctors",
            columns=["clinic_id"],
            filters={"id": doctor_id},
            limit=1,
        )
        if not doctor_rows or not doctor_rows[0].get("clinic_id"):
            return []
        
        clinic_id = doctor_rows[0]["clinic_id"]
        
        # Get the clinic
        clinic_rows = supabase_client.select(
            "clinics",
            filters={"id": clinic_id},
            limit=1,
        )
        return clinic_rows
    except SupabaseNotConfiguredError:
        return []


def list_doctors_in_clinic(clinic_id: str) -> list[dict[str, Any]]:
    """
    List all doctors in a specific clinic.
    
    Returns doctor records with basic info (id, first_name, last_name, specialization).
    """
    try:
        return supabase_client.select(
            "doctors",
            columns=["id", "first_name", "last_name", "specialization", "clinic_id"],
            filters={"clinic_id": clinic_id},
        )
    except SupabaseNotConfiguredError:
        return []


def can_doctor_access_clinic(doctor_id: str, clinic_id: str) -> bool:
    """
    Check if a doctor has access to a specific clinic.
    
    Currently, a doctor can only access their own clinic.
    """
    try:
        doctor_rows = supabase_client.select(
            "doctors",
            columns=["clinic_id"],
            filters={"id": doctor_id},
            limit=1,
        )
        if not doctor_rows:
            return False
        
        return doctor_rows[0].get("clinic_id") == clinic_id
    except SupabaseNotConfiguredError:
        return False


def can_doctor_access_doctor(current_doctor_id: str, target_doctor_id: str) -> bool:
    """
    Check if current doctor can access another doctor's data.
    
    Currently:
    - A doctor can always access their own data
    - A doctor can access other doctors in the same clinic
    """
    if current_doctor_id == target_doctor_id:
        return True
    
    try:
        # Get both doctors' clinic_ids
        rows = supabase_client.select(
            "doctors",
            columns=["id", "clinic_id"],
        )
        
        current_clinic_id = None
        target_clinic_id = None
        
        for row in rows:
            if row["id"] == current_doctor_id:
                current_clinic_id = row.get("clinic_id")
            elif row["id"] == target_doctor_id:
                target_clinic_id = row.get("clinic_id")
        
        # Both must have a clinic_id and it must match
        if current_clinic_id and target_clinic_id:
            return current_clinic_id == target_clinic_id
        
        return False
    except SupabaseNotConfiguredError:
        return False

