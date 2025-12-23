"""
AI Assistant Service - OpenAI integration for dental assistant.

Provides safe, structured answers to doctor questions about dental topics.
Does NOT make diagnoses or request patient personal data.
"""

from __future__ import annotations

import logging
from typing import Any, Literal

from app.config import get_settings
from app.models.ai_assistant_dto import AILanguage

logger = logging.getLogger("smilecrm.ai_assistant")


class AIAssistantError(Exception):
    """Base error for AI assistant issues."""
    pass


class AINotConfiguredError(AIAssistantError):
    """Raised when AI is not configured."""
    pass


class AIRequestError(AIAssistantError):
    """Raised when AI request fails."""
    pass


# System prompt for the dental assistant
SYSTEM_PROMPT_TEMPLATE = """Ты — справочный ассистент для стоматолога. Твоя задача — помочь врачу найти общую информацию.

СТРОГИЕ ПРАВИЛА БЕЗОПАСНОСТИ:
1. НИКОГДА не ставь диагноз пациенту
2. НИКОГДА не назначай лечение или препараты как окончательное решение
3. НИКОГДА не запрашивай персональные данные пациента (имя, телефон, адрес и т.д.)
4. Всегда напоминай, что финальное решение принимает врач

ЧТО ТЫ МОЖЕШЬ:
- Давать общую информацию о методах лечения
- Описывать стоматологические материалы и их свойства
- Объяснять протоколы и стандарты
- Давать варианты подходов к типичным случаям
- Отвечать на вопросы о препаратах и их применении в стоматологии
- Помогать с формулировками для документации

ФОРМАТ ОТВЕТА:
- Пиши кратко и по пунктам
- Структурируй информацию
- Используй маркированные списки где уместно
- Избегай воды и общих фраз
- Отвечай на языке: {language}

{context_info}"""

LANGUAGE_NAMES = {
    "am": "армянский (հայերdelays: delays)",
    "ru": "русский",
    "en": "English",
}


def _get_language_name(language: AILanguage) -> str:
    """Get full language name for prompt."""
    return LANGUAGE_NAMES.get(language, "русский")


def _build_system_prompt(
    language: AILanguage,
    clinic_name: str | None = None,
    specialization: str | None = None,
) -> str:
    """Build system prompt with context."""
    context_parts = []
    
    if clinic_name:
        context_parts.append(f"Клиника: {clinic_name}")
    if specialization:
        context_parts.append(f"Специализация врача: {specialization}")
    
    context_info = ""
    if context_parts:
        context_info = "КОНТЕКСТ:\n" + "\n".join(context_parts)
    
    return SYSTEM_PROMPT_TEMPLATE.format(
        language=_get_language_name(language),
        context_info=context_info,
    )


async def ask(
    question: str,
    language: AILanguage = "ru",
    clinic_name: str | None = None,
    specialization: str | None = None,
    timeout: float = 20.0,
) -> str:
    """
    Ask the AI assistant a question.
    
    Args:
        question: Doctor's question
        language: Response language (am/ru/en)
        clinic_name: Optional clinic name for context
        specialization: Optional doctor's specialization
        timeout: Request timeout in seconds
        
    Returns:
        AI-generated answer
        
    Raises:
        AINotConfiguredError: If OpenAI is not configured
        AIRequestError: If request fails
    """
    settings = get_settings()
    
    if not settings.is_ai_configured:
        raise AINotConfiguredError(
            "AI is not configured. Set OPENAI_API_KEY in environment."
        )
    
    try:
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=timeout,
        )
        
        system_prompt = _build_system_prompt(
            language=language,
            clinic_name=clinic_name,
            specialization=specialization,
        )
        
        logger.info(f"AI Assistant request: language={language}, question_len={len(question)}")
        
        response = await client.chat.completions.create(
            model=settings.AI_MODEL_TEXT,  # gpt-4o-mini
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            temperature=0.7,
            max_tokens=800,
        )
        
        answer = response.choices[0].message.content or ""
        
        logger.info(f"AI Assistant response: answer_len={len(answer)}")
        
        return answer.strip()
        
    except ImportError:
        raise AINotConfiguredError(
            "OpenAI library not installed. Run: pip install openai"
        )
    except Exception as e:
        logger.error(f"AI Assistant error: {e}")
        raise AIRequestError(f"Failed to get AI response: {str(e)}")

