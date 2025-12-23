"""
AI Assistant DTOs - Pydantic schemas for AI assistant endpoint.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class AIAssistantContext(BaseModel):
    """Optional context for AI assistant."""
    clinic_name: Optional[str] = Field(default=None, alias="clinicName")
    specialization: Optional[str] = None
    
    model_config = {"populate_by_name": True}


class AIAssistantAskRequest(BaseModel):
    """Request body for AI assistant ask endpoint."""
    question: str = Field(
        ..., 
        min_length=3, 
        max_length=1000,
        description="Doctor's question to the AI assistant"
    )
    language: Literal["am", "ru", "en"] = Field(
        default="ru",
        description="Language for the response: am (Armenian), ru (Russian), en (English)"
    )
    context: Optional[AIAssistantContext] = Field(
        default=None,
        description="Optional context about clinic/doctor"
    )


class AIAssistantAskResponse(BaseModel):
    """Response from AI assistant ask endpoint."""
    answer: str = Field(..., description="AI-generated answer")
    remaining_today: int = Field(
        ..., 
        ge=0, 
        alias="remainingToday",
        description="Remaining requests for today"
    )
    limit_today: int = Field(
        ..., 
        ge=0, 
        alias="limitToday",
        description="Total daily limit"
    )
    
    model_config = {"populate_by_name": True}


class AIUsageLimitError(BaseModel):
    """Error response when daily limit is reached."""
    detail: str = "Daily limit reached"
    remaining_today: int = Field(default=0, alias="remainingToday")
    limit_today: int = Field(..., alias="limitToday")
    
    model_config = {"populate_by_name": True}


# Type alias for use in service layer (not in Pydantic models)
AILanguage = Literal["am", "ru", "en"]
