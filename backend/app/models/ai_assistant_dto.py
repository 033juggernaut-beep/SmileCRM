"""
AI Assistant DTOs - Pydantic schemas for AI assistant endpoint.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel


class AIAssistantAskRequest(BaseModel):
    question: str
    language: str = "ru"
    context: Optional[Dict[str, Any]] = None


class AIAssistantAskResponse(BaseModel):
    answer: str
    remaining_today: int = 0
    limit_today: int = 0
    
    class Config:
        # Allow both snake_case and camelCase
        fields = {
            'remaining_today': {'alias': 'remainingToday'},
            'limit_today': {'alias': 'limitToday'},
        }
        populate_by_name = True
