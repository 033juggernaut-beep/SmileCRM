"""
AI Assistant API endpoints
"""
import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import AuthenticatedDoctor, get_current_doctor
from app.services.ai_service import AIService, AINotConfiguredError, AIServiceError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]


# Request/Response models
class AIAssistantRequest(BaseModel):
    """Request for AI assistant"""
    category: Literal["diagnosis", "visits", "finance", "marketing"] = Field(
        ..., description="Category of the request"
    )
    patient_id: str | None = Field(None, description="Patient ID if in patient context")
    text: str = Field(..., min_length=1, description="User's text input")
    locale: Literal["hy", "ru", "en"] = Field("ru", description="Response language")


class AIAction(BaseModel):
    """AI suggested action"""
    type: str
    patient_id: str | None = None
    # Dynamic fields based on action type
    diagnosis: str | None = None
    visit_date: str | None = None
    next_visit_date: str | None = None
    notes: str | None = None
    note: str | None = None  # For finance notes


class AIDraft(BaseModel):
    """AI draft content"""
    marketing_message: str | None = None


class AIAssistantResponse(BaseModel):
    """Response from AI assistant"""
    summary: str = Field(..., description="Brief summary of what AI understood")
    actions: list[dict] = Field(default_factory=list, description="Suggested actions")
    draft: dict = Field(default_factory=dict, description="Draft content")
    warnings: list[str] = Field(default_factory=list, description="Warnings if any")


class AIApplyRequest(BaseModel):
    """Request to apply AI actions"""
    actions: list[dict] = Field(..., description="Actions to apply")


class AIApplyResult(BaseModel):
    """Result of applying actions"""
    applied: list[dict] = Field(default_factory=list)
    failed: list[dict] = Field(default_factory=list)


class AIApplyResponse(BaseModel):
    """Response from apply endpoint"""
    success: bool
    results: AIApplyResult


@router.post("/assistant", response_model=AIAssistantResponse)
async def ai_assistant(
    request: AIAssistantRequest,
    current_doctor: CurrentDoctor,
):
    """
    Process AI assistant request
    
    Takes user text and category, returns structured suggestions
    """
    try:
        service = AIService(current_doctor.doctor_id)
        result = service.process_assistant_request(
            category=request.category,
            text=request.text,
            patient_id=request.patient_id,
            locale=request.locale,
        )
        return AIAssistantResponse(**result)
    
    except AINotConfiguredError as e:
        logger.error(f"AI not configured: {e}")
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set OPENAI_API_KEY.",
        )
    except AIServiceError as e:
        logger.error(f"AI service error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}",
        )
    except Exception as e:
        logger.exception(f"Unexpected error in AI assistant: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )


@router.post("/apply", response_model=AIApplyResponse)
async def apply_ai_actions(
    request: AIApplyRequest,
    current_doctor: CurrentDoctor,
):
    """
    Apply AI-suggested actions to the database
    
    Executes actions like updating diagnosis, creating visits, etc.
    """
    try:
        service = AIService(current_doctor.doctor_id)
        results = service.apply_actions(request.actions)
        
        return AIApplyResponse(
            success=len(results["failed"]) == 0,
            results=AIApplyResult(**results),
        )
    
    except Exception as e:
        logger.exception(f"Failed to apply AI actions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply actions: {str(e)}",
        )
