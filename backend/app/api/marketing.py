"""
Marketing API endpoints.

Endpoints for generating marketing messages for patients.
"""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.services import patients_service

router = APIRouter(prefix="/marketing", tags=["marketing"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]

MessageTemplate = Literal["birthday", "visit_reminder", "promo", "post_treatment"]


class MessagePreviewRequest(BaseModel):
    patient_id: str
    template: MessageTemplate


class MessagePreviewResponse(BaseModel):
    text: str
    template: MessageTemplate


# Simple message templates (placeholder for AI generation)
TEMPLATES = {
    "birthday": """Здравствуйте, {first_name}! 🎂

Поздравляем вас с днём рождения! Желаем крепкого здоровья, счастья и красивой улыбки!

В честь вашего праздника мы дарим вам скидку 10% на все услуги в течение недели.

С наилучшими пожеланиями,
Ваша стоматология""",
    
    "visit_reminder": """Здравствуйте, {first_name}!

Мы заметили, что вы давно не были у нас на приёме. Рекомендуем пройти профилактический осмотр для поддержания здоровья полости рта.

Запишитесь на удобное время — мы будем рады вас видеть!

С заботой о вашем здоровье,
Ваша стоматология""",
    
    "promo": """Здравствуйте, {first_name}!

Специальное предложение для наших пациентов: скидка 15% на профессиональную гигиену полости рта!

Акция действует до конца месяца. Запишитесь прямо сейчас!

С уважением,
Ваша стоматология""",
    
    "post_treatment": """Здравствуйте, {first_name}!

Как вы себя чувствуете после лечения? Надеемся, что всё хорошо!

Если у вас есть вопросы или беспокойство — свяжитесь с нами, мы всегда готовы помочь.

С заботой о вас,
Ваша стоматология""",
}


@router.post("/message/preview", response_model=MessagePreviewResponse)
async def preview_message(
    payload: MessagePreviewRequest,
    current_doctor: CurrentDoctor,
) -> MessagePreviewResponse:
    """
    Generate a marketing message preview for a patient.
    
    This is a simple template-based generation.
    In the future, this can be replaced with AI-powered generation.
    """
    # Get patient data
    patient = patients_service.get_patient_by_id(
        patient_id=payload.patient_id,
        doctor_id=current_doctor.doctor_id,
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    template_text = TEMPLATES.get(payload.template)
    if not template_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown template: {payload.template}"
        )
    
    # Format message with patient data
    message_text = template_text.format(
        first_name=patient.get("first_name", ""),
        last_name=patient.get("last_name", ""),
    )
    
    return MessagePreviewResponse(text=message_text, template=payload.template)
