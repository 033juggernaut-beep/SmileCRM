"""
AI Assistant DTOs - Pydantic schemas for AI assistant endpoint.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# Supported languages for AI responses
AILanguage = Literal["am", "ru", "en"]


class AIAssistantContext(BaseModel):
    """Optional context for AI assistant."""
    clinic_name: str | None = Field(default=None, alias="clinicName")
    specialization: str | None = None
    
    class Config:
        populate_by_name = True


class AIAssistantAskRequest(BaseModel):
    """Request body for AI assistant ask endpoint."""
    question: str = Field(
        ..., 
        min_length=3, 
        max_length=1000,
        description="Doctor's question to the AI assistant"
    )
    language: AILanguage = Field(
        default="ru",
        description="Language for the response: am (Armenian), ru (Russian), en (English)"
    )
    context: AIAssistantContext | None = Field(
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
    
    class Config:
        populate_by_name = True


class AIUsageLimitError(BaseModel):
    """Error response when daily limit is reached."""
    detail: str = "Daily limit reached"
    remaining_today: int = Field(default=0, alias="remainingToday")
    limit_today: int = Field(..., alias="limitToday")
    
    class Config:
        populate_by_name = True

