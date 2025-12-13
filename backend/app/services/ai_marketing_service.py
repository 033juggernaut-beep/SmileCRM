"""AI Marketing Service for generating personalized marketing messages."""
from __future__ import annotations

import logging
from typing import Literal

from app.config import get_settings

logger = logging.getLogger(__name__)

# Type aliases
MessageType = Literal["birthday", "discount", "recall"]
Language = Literal["am", "ru", "en"]
Segment = Literal["regular", "vip"]

# Language names for prompts
LANGUAGE_NAMES = {
    "am": "Armenian",
    "ru": "Russian", 
    "en": "English",
}

# Fallback templates when AI is unavailable
FALLBACK_TEMPLATES = {
    "birthday": {
        "am": {
            "regular": "🎂 Շdelays shnorհdelays, {name}! Ցdelays ենdelays delays delays delays- delays!\n🦷 SmileCRM",
            "vip": "🎂 Тdelays {name}! Ши delays-delays delays-delays delays-delays! Ви delays-delays delays delays!\n🦷 SmileCRM",
        },
        "ru": {
            "regular": "🎂 С днём рождения, {name}! Желаем вам здоровья и красивой улыбки!\n🦷 SmileCRM",
            "vip": "🎂 Дорогой {name}! Поздравляем вас с днём рождения! Вы — наш особенный пациент. Желаем счастья и здоровья!\n🦷 SmileCRM",
        },
        "en": {
            "regular": "🎂 Happy Birthday, {name}! Wishing you health and a beautiful smile!\n🦷 SmileCRM",
            "vip": "🎂 Dear {name}! Happy Birthday! You are a special patient to us. Wishing you happiness and health!\n🦷 SmileCRM",
        },
    },
    "discount": {
        "am": {
            "regular": "🎁 {name}, delays-delays {discount}% delays delays-delays!\n🦷 SmileCRM",
            "vip": "🎁 {name}, delays-delays delays delays! {discount}% delays-delays delays delays!\n🦷 SmileCRM",
        },
        "ru": {
            "regular": "🎁 {name}, для вас персональная скидка {discount}% на следующий визит!\n🦷 SmileCRM",
            "vip": "🎁 Дорогой {name}! Специально для вас как VIP-пациента — скидка {discount}%! Ждём вас!\n🦷 SmileCRM",
        },
        "en": {
            "regular": "🎁 {name}, you have a personal {discount}% discount on your next visit!\n🦷 SmileCRM",
            "vip": "🎁 Dear {name}! As our VIP patient, enjoy a special {discount}% discount! We look forward to seeing you!\n🦷 SmileCRM",
        },
    },
    "recall": {
        "am": {
            "regular": "📅 {name}, delays-delays delays delays-delays! Запdelays delays-delays!\n🦷 SmileCRM",
            "vip": "📅 {name}, delays delays-delays delays delays-delays! delays-delays delays delays!\n🦷 SmileCRM",
        },
        "ru": {
            "regular": "📅 {name}, напоминаем о плановом осмотре! Запишитесь на приём.\n🦷 SmileCRM",
            "vip": "📅 Дорогой {name}! Пора на плановый осмотр. Мы всегда рады видеть вас!\n🦷 SmileCRM",
        },
        "en": {
            "regular": "📅 {name}, time for your regular checkup! Book your appointment.\n🦷 SmileCRM",
            "vip": "📅 Dear {name}! It's time for your checkup. We're always happy to see you!\n🦷 SmileCRM",
        },
    },
}


def _get_fallback_text(
    msg_type: MessageType,
    language: Language,
    segment: Segment,
    patient_name: str,
    discount_percent: int | None = None,
) -> str:
    """Get fallback template text when AI is unavailable."""
    template = FALLBACK_TEMPLATES.get(msg_type, {}).get(language, {}).get(segment, "")
    
    if not template:
        # Ultimate fallback
        template = f"Hello {patient_name}! SmileCRM"
    
    return template.format(
        name=patient_name,
        discount=discount_percent or 10,
    )


def _build_ai_prompt(
    msg_type: MessageType,
    language: Language,
    segment: Segment,
    patient_name: str,
    context: dict,
) -> str:
    """Build the prompt for AI generation."""
    lang_name = LANGUAGE_NAMES.get(language, "English")
    
    tone_instruction = ""
    if segment == "vip":
        tone_instruction = "Use a warm, personal tone. Address them as a valued VIP patient. Be appreciative."
    else:
        tone_instruction = "Use a friendly, professional tone. Keep it neutral and welcoming."
    
    type_instructions = {
        "birthday": f"Write a birthday greeting for {patient_name}.",
        "discount": f"Write a discount offer message for {patient_name}. The discount is {context.get('discount_percent', 10)}%.",
        "recall": f"Write a gentle reminder for {patient_name} to schedule their regular checkup.",
    }
    
    base_instruction = type_instructions.get(msg_type, f"Write a message for {patient_name}.")
    
    prompt = f"""You are a dental clinic assistant. Generate a short marketing message.

LANGUAGE: Write ONLY in {lang_name}. Do not use any other language.

TASK: {base_instruction}

TONE: {tone_instruction}

RULES:
- Keep it SHORT (under 200 characters for SMS compatibility)
- No medical claims or promises
- No aggressive sales language
- Include one relevant emoji
- End with: 🦷 SmileCRM

Generate the message now:"""
    
    return prompt


async def generate_marketing_text(
    *,
    msg_type: MessageType,
    language: Language,
    segment: Segment,
    patient_name: str,
    context: dict | None = None,
) -> str:
    """
    Generate personalized marketing text using AI or fallback templates.
    
    Args:
        msg_type: Type of message (birthday, discount, recall)
        language: Target language (am, ru, en)
        segment: Patient segment (regular, vip)
        patient_name: Patient's full name
        context: Additional context (discount_percent, last_visit, etc.)
    
    Returns:
        Generated marketing message text
    """
    context = context or {}
    settings = get_settings()
    
    # Try AI generation if configured
    if settings.is_ai_configured:
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            prompt = _build_ai_prompt(
                msg_type=msg_type,
                language=language,
                segment=segment,
                patient_name=patient_name,
                context=context,
            )
            
            response = await client.chat.completions.create(
                model=settings.AI_MODEL_TEXT,
                messages=[
                    {"role": "system", "content": "You are a helpful dental clinic marketing assistant. Generate short, friendly messages."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=150,
                temperature=0.7,
            )
            
            generated_text = response.choices[0].message.content
            if generated_text:
                return generated_text.strip()
            
        except Exception as e:
            logger.warning(f"AI generation failed, using fallback: {e}")
    
    # Fallback to templates
    return _get_fallback_text(
        msg_type=msg_type,
        language=language,
        segment=segment,
        patient_name=patient_name,
        discount_percent=context.get("discount_percent"),
    )
