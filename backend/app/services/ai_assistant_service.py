"""
AI Assistant Service - OpenAI integration for dental assistant.

Provides safe, structured answers to doctor questions about dental topics.
Does NOT make diagnoses or request patient personal data.
"""

import logging
from typing import Literal, Optional

from app.config import get_settings

# Type alias for language (local to avoid import issues)
AILanguage = Literal["am", "ru", "en"]

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
    "am": "Armenian (Hayeren)",
    "ru": "русский",
    "en": "English",
}


def _get_language_name(language: AILanguage) -> str:
    """Get full language name for prompt."""
    return LANGUAGE_NAMES.get(language, "русский")


def _build_system_prompt(
    language: AILanguage,
    clinic_name: Optional[str] = None,
    specialization: Optional[str] = None,
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
    clinic_name: Optional[str] = None,
    specialization: Optional[str] = None,
    timeout: float = 30.0,
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
    
    # Check if AI is configured
    logger.info(f"Checking AI configuration: is_ai_configured={settings.is_ai_configured}")
    
    if not settings.is_ai_configured:
        logger.error("OpenAI API key not configured")
        raise AINotConfiguredError(
            "AI is not configured. Set OPENAI_API_KEY in environment."
        )
    
    # Log API key presence (safely)
    api_key = settings.OPENAI_API_KEY or ""
    logger.info(f"OpenAI API key present: {len(api_key) > 0}, key_prefix={api_key[:8]}..." if api_key else "No API key")
    
    try:
        logger.info("Importing OpenAI library...")
        from openai import AsyncOpenAI
        
        logger.info("Creating OpenAI client...")
        client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=timeout,
        )
        
        system_prompt = _build_system_prompt(
            language=language,
            clinic_name=clinic_name,
            specialization=specialization,
        )
        
        model = settings.AI_MODEL_TEXT
        logger.info(f"Calling OpenAI API: model={model}, language={language}, question_len={len(question)}")
        
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            temperature=0.7,
            max_tokens=800,
        )
        
        logger.info(f"OpenAI response received: choices={len(response.choices)}")
        
        if not response.choices:
            logger.error("OpenAI returned empty choices")
            raise AIRequestError("OpenAI returned empty response")
        
        answer = response.choices[0].message.content or ""
        
        logger.info(f"AI response success: answer_len={len(answer)}")
        
        return answer.strip()
        
    except ImportError as e:
        logger.error(f"OpenAI library not installed: {e}")
        raise AINotConfiguredError(
            "OpenAI library not installed. Run: pip install openai"
        )
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error(f"OpenAI API error: {error_type}: {error_msg}")
        raise AIRequestError(f"OpenAI API error: {error_type}: {error_msg}")
