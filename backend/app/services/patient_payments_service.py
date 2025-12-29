from __future__ import annotations

from decimal import Decimal
from typing import Any, Mapping

from .supabase_client import SupabaseNotConfiguredError, supabase_client


def list_by_patient(patient_id: str, doctor_id: str) -> list[dict[str, Any]]:
  """Fetch all payments for a specific patient and doctor."""
  try:
    payments = supabase_client.select(
      "patient_payments",
      filters={"patient_id": patient_id, "doctor_id": doctor_id},
    )
    # Sort by paid_at descending (most recent first)
    return sorted(payments, key=lambda p: p.get("paid_at", ""), reverse=True)
  except SupabaseNotConfiguredError:
    return []


def create_payment(
  doctor_id: str,
  patient_id: str,
  amount: Decimal | float,
  paid_at: Any = None,
  comment: str | None = None,
  visit_id: str | None = None,
  currency: str = "AMD",
) -> dict[str, Any]:
  """Create a new payment record for a patient."""
  from datetime import date, datetime
  
  # Handle paid_at date
  if paid_at is None:
    paid_at_str = date.today().isoformat()
  elif isinstance(paid_at, date):
    paid_at_str = paid_at.isoformat()
  elif isinstance(paid_at, str):
    paid_at_str = paid_at
  else:
    paid_at_str = date.today().isoformat()
  
  payment_data = {
    "patient_id": patient_id,
    "doctor_id": doctor_id,
    "amount": float(amount),  # Convert Decimal/float for JSON serialization
    "currency": currency,
    "comment": comment,
    "visit_id": visit_id,
    "paid_at": paid_at_str,
  }
  
  try:
    inserted = supabase_client.insert("patient_payments", payment_data)
    return inserted[0] if inserted else payment_data
  except SupabaseNotConfiguredError:
    # Fallback for development without Supabase
    import uuid
    return {
      "id": str(uuid.uuid4()),
      "created_at": datetime.now().isoformat(),
      **payment_data,
    }


def get_finance_summary(patient_id: str, doctor_id: str) -> dict[str, Any]:
  """
  Calculate financial summary for a patient:
  - treatment_plan_total: sum of all treatment_plan_items.price_amd
  - total_paid: sum of all payments
  - remaining: plan total - paid
  """
  # 1. Calculate treatment plan total from treatment_plan_items table
  treatment_plan_total = Decimal(0)
  try:
    items = supabase_client.select(
      "treatment_plan_items",
      filters={"patient_id": patient_id, "doctor_id": doctor_id},
    )
    treatment_plan_total = sum(
      Decimal(str(item.get("price_amd", 0) or 0)) for item in items
    )
  except SupabaseNotConfiguredError:
    pass
  
  # 2. Sum all payments for this patient
  try:
    payments = supabase_client.select(
      "patient_payments",
      filters={"patient_id": patient_id, "doctor_id": doctor_id},
    )
    total_paid = sum(Decimal(str(p.get("amount", 0))) for p in payments)
  except SupabaseNotConfiguredError:
    total_paid = Decimal(0)
  
  # 3. Calculate remaining
  remaining = treatment_plan_total - total_paid
  
  return {
    "treatment_plan_total": float(treatment_plan_total),
    "treatment_plan_currency": "AMD",
    "total_paid": float(total_paid),
    "remaining": float(remaining),
  }


def update_payment(
  payment_id: str,
  doctor_id: str,
  amount: Decimal | None = None,
  comment: str | None = None,
) -> dict[str, Any] | None:
  """
  Update a payment record. Returns the updated payment or None if not found.
  Only allows updates if the payment belongs to the doctor.
  """
  try:
    # First verify the payment belongs to this doctor
    payments = supabase_client.select(
      "patient_payments",
      filters={"id": payment_id, "doctor_id": doctor_id},
      limit=1,
    )
    if not payments:
      return None
    
    # Build update data
    update_data: dict[str, Any] = {}
    if amount is not None:
      update_data["amount"] = float(amount)
    if comment is not None:
      update_data["comment"] = comment
    
    if not update_data:
      # Nothing to update, return existing payment
      return payments[0]
    
    # Update the payment
    updated = supabase_client.update(
      "patient_payments",
      filters={"id": payment_id},
      values=update_data,
    )
    return updated[0] if updated else payments[0]
  except SupabaseNotConfiguredError:
    return None


def delete_payment(payment_id: str, doctor_id: str) -> bool:
  """
  Delete a payment record. Returns True if successful.
  Only allows deletion if the payment belongs to the doctor.
  """
  try:
    # First verify the payment belongs to this doctor
    payments = supabase_client.select(
      "patient_payments",
      filters={"id": payment_id, "doctor_id": doctor_id},
      limit=1,
    )
    if not payments:
      return False
    
    # Delete the payment
    supabase_client.delete("patient_payments", filters={"id": payment_id})
    return True
  except SupabaseNotConfiguredError:
    return False

