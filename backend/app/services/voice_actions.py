"""
Voice AI Action Router - Automatic DB operations from voice commands.

Routes parsed voice commands to the correct database tables:
- "add_medication" → patient_medications
- "create_payment" → patient_payments  
- "create_visit" → visits
- "update_patient" (diagnosis) → patients.diagnosis
- "add_note" → patients.notes

STRICT RULES:
- NEVER guess or invent data
- NEVER write if confidence < 0.75
- One action = one DB operation
- doctor_id MUST be enforced on every insert/update
"""

from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any, TypedDict
from uuid import UUID

from .supabase_client import SupabaseNotConfiguredError, supabase_client, SupabaseRequestError
from . import patients_service, visits_service, patient_payments_service, medications_service

logger = logging.getLogger(__name__)

# Confidence threshold - do not auto-commit below this
CONFIDENCE_THRESHOLD = 0.75


class ActionResult(TypedDict, total=False):
    """Result of applying a voice action."""
    performed_action: str
    updated: dict[str, Any] | None
    warnings: list[str]
    needs_confirmation: bool


class VoiceActionError(Exception):
    """Raised when voice action processing fails."""
    pass


def apply_voice_action(
    *,
    doctor_id: str | UUID,
    patient_id: str | UUID,
    parsed: dict[str, Any],
) -> ActionResult:
    """
    Apply a parsed voice command to the database.
    
    Routes the action to the correct table based on the 'action' field.
    
    Args:
        doctor_id: The authenticated doctor's ID (UUID)
        patient_id: The patient context ID (UUID)
        parsed: Parsed voice data from LLM containing:
            - action: str ("create_visit", "create_payment", etc.)
            - confidence: float (0.0 - 1.0)
            - visit: dict | None
            - payment: dict | None
            - diagnosis: str | None
            - medications: list[dict] | None (if applicable)
            - note: str | None
    
    Returns:
        ActionResult with performed_action, updated record, and warnings
    
    Raises:
        VoiceActionError: If action fails
    """
    doctor_id_str = str(doctor_id)
    patient_id_str = str(patient_id)
    
    action = parsed.get("action", "unknown")
    confidence = parsed.get("confidence", 0.0)
    warnings: list[str] = []
    
    logger.info(
        f"[VOICE_ACTION] Processing: action={action}, confidence={confidence:.2f}, "
        f"doctor={doctor_id_str[:8]}..., patient={patient_id_str[:8]}..."
    )
    
    # Check confidence threshold
    if confidence < CONFIDENCE_THRESHOLD:
        logger.warning(
            f"[VOICE_ACTION] Low confidence ({confidence:.2f} < {CONFIDENCE_THRESHOLD}), "
            "requiring user confirmation"
        )
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=[f"Низкая уверенность распознавания ({confidence:.0%}). Проверьте данные."],
            needs_confirmation=True,
        )
    
    try:
        # Route to appropriate handler
        if action == "create_visit":
            return _handle_create_visit(doctor_id_str, patient_id_str, parsed, warnings)
        
        elif action == "update_visit":
            return _handle_update_visit(doctor_id_str, patient_id_str, parsed, warnings)
        
        elif action == "create_payment":
            return _handle_create_payment(doctor_id_str, patient_id_str, parsed, warnings)
        
        elif action == "update_patient":
            return _handle_update_patient(doctor_id_str, patient_id_str, parsed, warnings)
        
        elif action == "add_note":
            return _handle_add_note(doctor_id_str, patient_id_str, parsed, warnings)
        
        elif action == "add_medication":
            return _handle_add_medications(doctor_id_str, patient_id_str, parsed, warnings)
        
        elif action == "unknown":
            logger.info("[VOICE_ACTION] Unknown action - no database operation")
            return ActionResult(
                performed_action="unknown",
                updated=None,
                warnings=["Команда не распознана. Попробуйте сформулировать иначе."],
                needs_confirmation=True,
            )
        
        else:
            logger.warning(f"[VOICE_ACTION] Unhandled action type: {action}")
            return ActionResult(
                performed_action="unknown",
                updated=None,
                warnings=[f"Неизвестная команда: {action}"],
                needs_confirmation=True,
            )
    
    except SupabaseRequestError as e:
        logger.error(f"[VOICE_ACTION] Database error: {e}")
        raise VoiceActionError(f"Ошибка сохранения в базу данных: {e}")
    except SupabaseNotConfiguredError:
        logger.error("[VOICE_ACTION] Supabase not configured")
        raise VoiceActionError("База данных не настроена")
    except Exception as e:
        logger.exception(f"[VOICE_ACTION] Unexpected error: {e}")
        raise VoiceActionError(f"Ошибка обработки команды: {e}")


def _handle_create_visit(
    doctor_id: str,
    patient_id: str,
    parsed: dict[str, Any],
    warnings: list[str],
) -> ActionResult:
    """Create a new visit record."""
    visit_data = parsed.get("visit", {}) or {}
    
    visit_date = visit_data.get("visit_date")
    if not visit_date:
        # Default to today if not specified but action is clear
        visit_date = date.today().isoformat()
        warnings.append("Дата визита не указана - установлено сегодня")
    
    payload: dict[str, Any] = {
        "visit_date": visit_date,
    }
    
    if visit_data.get("next_visit_date"):
        payload["next_visit_date"] = visit_data["next_visit_date"]
    
    if visit_data.get("notes"):
        payload["notes"] = visit_data["notes"]
    
    if visit_data.get("medications"):
        # Include medications in notes if present
        meds_text = visit_data["medications"]
        if payload.get("notes"):
            payload["notes"] = f"{payload['notes']}\nМедикаменты: {meds_text}"
        else:
            payload["notes"] = f"Медикаменты: {meds_text}"
    
    # Check for diagnosis in parsed root
    diagnosis = parsed.get("diagnosis")
    if diagnosis:
        if payload.get("notes"):
            payload["notes"] = f"{payload['notes']}\nДиагноз: {diagnosis}"
        else:
            payload["notes"] = f"Диагноз: {diagnosis}"
    
    logger.info(f"[VOICE_ACTION] Creating visit: {payload}")
    
    created = visits_service.create_visit(
        doctor_id=doctor_id,
        patient_id=patient_id,
        payload=payload,
    )
    
    logger.info(f"[VOICE_ACTION] Visit created: id={created.get('id')}")
    
    return ActionResult(
        performed_action="create_visit",
        updated={
            "table": "visits",
            "patient_id": patient_id,
            "id": created.get("id"),
            "visit_date": visit_date,
        },
        warnings=warnings,
        needs_confirmation=False,
    )


def _handle_update_visit(
    doctor_id: str,
    patient_id: str,
    parsed: dict[str, Any],
    warnings: list[str],
) -> ActionResult:
    """Update an existing visit or create with next_visit_date."""
    visit_data = parsed.get("visit", {}) or {}
    
    # If we have next_visit_date, this is likely scheduling a follow-up
    next_visit_date = visit_data.get("next_visit_date")
    notes = visit_data.get("notes")
    
    if next_visit_date:
        # Create a new visit record for the next appointment
        payload: dict[str, Any] = {
            "visit_date": next_visit_date,
            "status": "scheduled",
        }
        if notes:
            payload["notes"] = notes
        
        logger.info(f"[VOICE_ACTION] Scheduling next visit: {payload}")
        
        created = visits_service.create_visit(
            doctor_id=doctor_id,
            patient_id=patient_id,
            payload=payload,
        )
        
        return ActionResult(
            performed_action="schedule_visit",
            updated={
                "table": "visits",
                "patient_id": patient_id,
                "id": created.get("id"),
                "visit_date": next_visit_date,
            },
            warnings=warnings,
            needs_confirmation=False,
        )
    
    # If no specific date, just append notes to patient
    if notes:
        return _handle_add_note(doctor_id, patient_id, {"note": notes}, warnings)
    
    warnings.append("Нет данных для обновления визита")
    return ActionResult(
        performed_action="none",
        updated=None,
        warnings=warnings,
        needs_confirmation=True,
    )


def _handle_create_payment(
    doctor_id: str,
    patient_id: str,
    parsed: dict[str, Any],
    warnings: list[str],
) -> ActionResult:
    """Create a payment record."""
    payment_data = parsed.get("payment", {}) or {}
    
    amount = payment_data.get("amount")
    if not amount:
        warnings.append("Сумма оплаты не указана")
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=warnings,
            needs_confirmation=True,
        )
    
    # Validate amount is positive
    try:
        amount = float(amount)
        if amount <= 0:
            warnings.append("Сумма должна быть положительной")
            return ActionResult(
                performed_action="none",
                updated=None,
                warnings=warnings,
                needs_confirmation=True,
            )
    except (TypeError, ValueError):
        warnings.append(f"Некорректная сумма: {amount}")
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=warnings,
            needs_confirmation=True,
        )
    
    currency = payment_data.get("currency") or "AMD"
    comment = payment_data.get("comment")
    
    # Get visit_date if provided for paid_at
    visit_data = parsed.get("visit", {}) or {}
    paid_at = visit_data.get("visit_date") or date.today()
    
    logger.info(f"[VOICE_ACTION] Creating payment: amount={amount} {currency}")
    
    created = patient_payments_service.create_payment(
        doctor_id=doctor_id,
        patient_id=patient_id,
        amount=amount,
        paid_at=paid_at,
        comment=comment,
        currency=currency,
    )
    
    logger.info(f"[VOICE_ACTION] Payment created: id={created.get('id')}")
    
    return ActionResult(
        performed_action="create_payment",
        updated={
            "table": "patient_payments",
            "patient_id": patient_id,
            "id": created.get("id"),
            "amount": amount,
            "currency": currency,
        },
        warnings=warnings,
        needs_confirmation=False,
    )


def _handle_update_patient(
    doctor_id: str,
    patient_id: str,
    parsed: dict[str, Any],
    warnings: list[str],
) -> ActionResult:
    """Update patient record (diagnosis, status, etc.)."""
    update_data: dict[str, Any] = {}
    
    # Handle diagnosis
    diagnosis = parsed.get("diagnosis")
    if diagnosis:
        update_data["diagnosis"] = diagnosis
    
    # Handle patient fields if present
    patient_data = parsed.get("patient", {}) or {}
    if patient_data.get("diagnosis"):
        update_data["diagnosis"] = patient_data["diagnosis"]
    if patient_data.get("status"):
        update_data["status"] = patient_data["status"]
    
    if not update_data:
        warnings.append("Нет данных для обновления пациента")
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=warnings,
            needs_confirmation=True,
        )
    
    logger.info(f"[VOICE_ACTION] Updating patient: {update_data}")
    
    updated = patients_service.update_patient(
        patient_id=patient_id,
        doctor_id=doctor_id,
        update_data=update_data,
    )
    
    logger.info(f"[VOICE_ACTION] Patient updated: id={updated.get('id')}")
    
    return ActionResult(
        performed_action="update_patient",
        updated={
            "table": "patients",
            "patient_id": patient_id,
            "fields": list(update_data.keys()),
        },
        warnings=warnings,
        needs_confirmation=False,
    )


def _handle_add_note(
    doctor_id: str,
    patient_id: str,
    parsed: dict[str, Any],
    warnings: list[str],
) -> ActionResult:
    """Add a note to patient record (appends to patients.notes)."""
    # Get note from various possible locations
    note_text = (
        parsed.get("note") or 
        (parsed.get("visit", {}) or {}).get("notes") or
        parsed.get("notes")
    )
    
    if not note_text:
        warnings.append("Текст заметки пуст")
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=warnings,
            needs_confirmation=True,
        )
    
    # Get current patient to append note
    patient = patients_service.get_patient(patient_id)
    if not patient:
        raise VoiceActionError("Пациент не найден")
    
    # Verify doctor ownership
    if patient.get("doctor_id") != doctor_id:
        raise VoiceActionError("Доступ к данному пациенту запрещён")
    
    # Append note with timestamp
    current_notes = patient.get("notes") or ""
    timestamp = datetime.now().strftime("%d.%m.%Y %H:%M")
    new_notes = f"{current_notes}\n\n[{timestamp}] {note_text}".strip()
    
    logger.info(f"[VOICE_ACTION] Adding note to patient: {len(note_text)} chars")
    
    updated = patients_service.update_patient(
        patient_id=patient_id,
        doctor_id=doctor_id,
        update_data={"notes": new_notes},
    )
    
    logger.info(f"[VOICE_ACTION] Note added to patient: id={updated.get('id')}")
    
    return ActionResult(
        performed_action="add_note",
        updated={
            "table": "patients",
            "patient_id": patient_id,
            "field": "notes",
        },
        warnings=warnings,
        needs_confirmation=False,
    )


def _handle_add_medications(
    doctor_id: str,
    patient_id: str,
    parsed: dict[str, Any],
    warnings: list[str],
) -> ActionResult:
    """Add medications to patient_medications table."""
    medications = parsed.get("medications", [])
    
    # Also check visit.medications as a string
    visit_data = parsed.get("visit", {}) or {}
    meds_text = visit_data.get("medications")
    
    # If medications is a string (from visit), parse it
    if not medications and meds_text:
        # Simple parsing: split by commas or newlines
        medications = [{"name": m.strip()} for m in meds_text.replace("\n", ",").split(",") if m.strip()]
    
    if not medications:
        warnings.append("Список медикаментов пуст")
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=warnings,
            needs_confirmation=True,
        )
    
    created_meds: list[dict[str, Any]] = []
    
    for med in medications:
        if not isinstance(med, dict):
            continue
        
        name = med.get("name")
        if not name:
            continue
        
        # Build dosage string from various fields
        dosage_parts = []
        if med.get("dose"):
            dosage_parts.append(str(med["dose"]))
        if med.get("frequency"):
            dosage_parts.append(str(med["frequency"]))
        if med.get("duration"):
            dosage_parts.append(str(med["duration"]))
        
        dosage = ", ".join(dosage_parts) if dosage_parts else None
        
        logger.info(f"[VOICE_ACTION] Creating medication: {name}, dosage={dosage}")
        
        created = medications_service.create_medication(
            patient_id=patient_id,
            doctor_id=doctor_id,
            name=name,
            dosage=dosage,
            comment=med.get("comment"),
        )
        
        created_meds.append(created)
    
    if not created_meds:
        warnings.append("Не удалось добавить медикаменты")
        return ActionResult(
            performed_action="none",
            updated=None,
            warnings=warnings,
            needs_confirmation=True,
        )
    
    logger.info(f"[VOICE_ACTION] {len(created_meds)} medications created")
    
    return ActionResult(
        performed_action="add_medication",
        updated={
            "table": "patient_medications",
            "patient_id": patient_id,
            "count": len(created_meds),
            "medications": [m.get("name") for m in created_meds],
        },
        warnings=warnings,
        needs_confirmation=False,
    )


# Convenience function to check if action should auto-commit
def should_auto_commit(parsed: dict[str, Any]) -> bool:
    """
    Check if the parsed result has high enough confidence for auto-commit.
    
    Args:
        parsed: Parsed voice data with 'confidence' field
        
    Returns:
        True if confidence >= CONFIDENCE_THRESHOLD
    """
    confidence = parsed.get("confidence", 0.0)
    return confidence >= CONFIDENCE_THRESHOLD
