"""
AI Assistant API - Endpoints for AI dental assistant.

Provides safe, structured answers to doctor questions.
Includes daily request limits based on subscription status.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.models.ai_assistant_dto import (
    AIAssistantAskRequest,
    AIAssistantAskResponse,
)
from app.services import ai_assistant_service, ai_usage_service, doctors_service
from app.services.ai_assistant_service import (
    AIAssistantError,
    AINotConfiguredError,
    AIRequestError,
)

logger = logging.getLogger("smilecrm.api.ai_assistant")

router = APIRouter(prefix="/ai/assistant", tags=["ai-assistant"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]

# Fallback messages for different languages
FALLBACK_MESSAGES = {
    "ru": "Временно не удалось получить ответ. Пожалуйста, попробуйте позже.",
    "en": "Temporarily unable to get a response. Please try again later.",
    "am": "Jamanakavorapes chi hnaravorvum pataskhan stanalu. Xndrum enk pordzel aveli uzh.",
}


def _get_fallback_message(language: str) -> str:
    """Get fallback error message in requested language."""
    return FALLBACK_MESSAGES.get(language, FALLBACK_MESSAGES["ru"])


def _get_doctor_subscription_status(doctor_id: str) -> str:
    """Get doctor's subscription status from database."""
    try:
        doctor = doctors_service.get_by_id(doctor_id)
        if doctor:
            return doctor.get("subscription_status", "trial") or "trial"
    except Exception as e:
        logger.warning(f"Failed to get doctor subscription status: {e}")
    return "trial"


@router.post("/ask", response_model=AIAssistantAskResponse)
async def ask_ai_assistant(
    request: AIAssistantAskRequest,
    current_doctor: CurrentDoctor,
) -> AIAssistantAskResponse:
    """
    Ask the AI dental assistant a question.
    
    The assistant provides general information about:
    - Treatment methods and approaches
    - Dental materials and their properties
    - Protocols and standards
    - Medication information
    
    The assistant does NOT:
    - Make diagnoses
    - Prescribe specific treatments
    - Request patient personal data
    
    Rate limits apply based on subscription status:
    - Trial/Basic: 5 requests/day
    - Pro/Active: 50 requests/day
    - Expired: 0 requests/day
    
    Returns:
        AI-generated answer with remaining daily limit info
        
    Raises:
        429: Daily limit reached
    """
    doctor_id = current_doctor.doctor_id
    
    # Validate language
    language = request.language if request.language in ("am", "ru", "en") else "ru"
    
    # Get subscription status and determine limit
    subscription_status = _get_doctor_subscription_status(doctor_id)
    limit = ai_usage_service.get_limit_by_subscription(subscription_status)
    
    logger.info(f"AI request from doctor {doctor_id[:8]}..., subscription={subscription_status}, limit={limit}")
    
    # Check and increment usage
    allowed, remaining, limit = ai_usage_service.check_and_increment(doctor_id, limit)
    
    if not allowed:
        logger.warning(f"Daily limit reached for doctor {doctor_id[:8]}...")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Daily limit reached. Upgrade your subscription for more requests.",
                "remainingToday": 0,
                "limitToday": limit,
            },
        )
    
    # Get context from request
    context = request.context or {}
    clinic_name = context.get("clinicName")
    specialization = context.get("specialization")
    
    logger.info(f"Calling OpenAI for question (len={len(request.question)})")
    
    try:
        # Ask AI
        answer = await ai_assistant_service.ask(
            question=request.question,
            language=language,
            clinic_name=clinic_name,
            specialization=specialization,
        )
        
        logger.info(f"OpenAI response received (len={len(answer)})")
        
        return AIAssistantAskResponse(
            answer=answer,
            remainingToday=remaining,
            limitToday=limit,
        )
        
    except AINotConfiguredError as e:
        # AI not configured - return fallback message, NOT error
        logger.error(f"AI not configured: {e}")
        return AIAssistantAskResponse(
            answer=f"⚠️ {_get_fallback_message(language)}\n\n(Сервис AI временно недоступен)",
            remainingToday=remaining,
            limitToday=limit,
        )
        
    except AIRequestError as e:
        # AI request failed - return fallback message, NOT error
        logger.error(f"AI request failed: {e}")
        return AIAssistantAskResponse(
            answer=f"⚠️ {_get_fallback_message(language)}",
            remainingToday=remaining,
            limitToday=limit,
        )
        
    except Exception as e:
        # Unexpected error - return fallback message, NOT error
        logger.error(f"Unexpected error in AI assistant: {type(e).__name__}: {e}")
        return AIAssistantAskResponse(
            answer=f"⚠️ {_get_fallback_message(language)}",
            remainingToday=remaining,
            limitToday=limit,
        )


@router.get("/limits")
async def get_ai_limits(
    current_doctor: CurrentDoctor,
) -> dict:
    """
    Get current AI usage limits for the authenticated doctor.
    
    Returns:
        Current usage count, remaining requests, and daily limit
    """
    doctor_id = current_doctor.doctor_id
    
    subscription_status = _get_doctor_subscription_status(doctor_id)
    limit = ai_usage_service.get_limit_by_subscription(subscription_status)
    used = ai_usage_service.get_today_usage(doctor_id)
    remaining = max(0, limit - used)
    
    return {
        "usedToday": used,
        "remainingToday": remaining,
        "limitToday": limit,
        "subscriptionStatus": subscription_status,
    }
