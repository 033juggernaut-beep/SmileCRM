"""
AI Assistant DTOs - Pydantic schemas for AI assistant endpoint.
"""

from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class AIAssistantAskRequest(BaseModel):
    """Request body for AI assistant ask endpoint."""
    question: str = Field(
        ..., 
        min_length=3, 
        max_length=1000,
        description="Doctor's question to the AI assistant"
    )
    language: str = Field(
        default="ru",
        description="Language for the response: am (Armenian), ru (Russian), en (English)"
    )
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional context: {clinicName, specialization}"
    )


class AIAssistantAskResponse(BaseModel):
    """Response from AI assistant ask endpoint."""
    answer: str = Field(..., description="AI-generated answer")
    remaining_today: int = Field(
        default=0, 
        ge=0, 
        alias="remainingToday",
        description="Remaining requests for today"
    )
    limit_today: int = Field(
        default=0, 
        ge=0, 
        alias="limitToday",
        description="Total daily limit"
    )
    
    model_config = {"populate_by_name": True}


class AIUsageLimitError(BaseModel):
    """Error response when daily limit is reached."""
    detail: str = "Daily limit reached"
    remaining_today: int = Field(default=0, alias="remainingToday")
    limit_today: int = Field(default=0, alias="limitToday")
    
    model_config = {"populate_by_name": True}
