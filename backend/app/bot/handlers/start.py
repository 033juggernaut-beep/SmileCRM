from __future__ import annotations

import logging
from typing import Literal

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from app.config import get_settings
from app.services import doctors_service

logger = logging.getLogger(__name__)

start_router = Router()
settings = get_settings()
FRONTEND_URL = settings.FRONTEND_WEBAPP_URL

# ---------------------------------------------------------------------------
# Localized welcome messages (AM / RU / EN)
# ---------------------------------------------------------------------------

WELCOME_MESSAGES = {
    "am": (
        "Bari galusт SmileCRM 👋\n\n"
        "Stomatalognerit hamar: hivandner, aycer, buzhman plan ev vcharumner — mek teghum.\n\n"
        "Havelvatsqy batselu hamar seghmek nerqevi SmileCRM kochaky 👇"
    ),
    "ru": (
        "Добро пожаловать в SmileCRM 👋\n\n"
        "CRM для стоматолога: пациенты, визиты, план лечения и оплаты — всё в одном месте.\n\n"
        "Чтобы открыть приложение, нажмите кнопку SmileCRM ниже 👇"
    ),
    "en": (
        "Welcome to SmileCRM 👋\n\n"
        "Dental CRM: patients, visits, treatment plan, and payments — in one place.\n\n"
        "To open the app, tap the SmileCRM button below 👇"
    ),
}

# Button labels per language
BUTTON_LABELS = {
    "am": "🦷 SmileCRM",
    "ru": "🦷 SmileCRM",
    "en": "🦷 SmileCRM",
}


def get_user_lang(language_code: str | None) -> Literal["am", "ru", "en"]:
    """
    Determine user language based on Telegram language_code.
    - 'hy*' -> Armenian (am)
    - 'ru*' -> Russian (ru)
    - else  -> English (en)
    """
    if not language_code:
        return "en"
    lang = language_code.lower()
    if lang.startswith("hy"):
        return "am"
    if lang.startswith("ru"):
        return "ru"
    return "en"


def _build_webapp_button(lang: Literal["am", "ru", "en"] = "en") -> InlineKeyboardMarkup:
    """Build WebApp button to open SmileCRM Mini App."""
    label = BUTTON_LABELS.get(lang, BUTTON_LABELS["en"])
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(
                text=label,
                web_app=WebAppInfo(url=FRONTEND_URL)
            )],
        ]
    )


@start_router.message(CommandStart())
async def handle_start(message: Message) -> None:
    """Handle /start command - always respond with localized welcome + WebApp button."""
    user = message.from_user
    telegram_user_id = user.id if user else None
    language_code = user.language_code if user else None

    # Determine language
    lang = get_user_lang(language_code)
    
    logger.info(
        "/start received | user_id=%s | language_code=%s | selected_lang=%s",
        telegram_user_id,
        language_code,
        lang,
    )

    # Check if doctor already registered (optional, for future personalization)
    doctor = None
    if telegram_user_id is not None:
        try:
            doctor = doctors_service.get_by_telegram_user_id(telegram_user_id)
        except Exception as exc:
            logger.warning("Failed to check doctor registration: %s", exc)
            doctor = None

    if doctor:
        logger.info("Existing doctor found: %s", doctor.get("id") if isinstance(doctor, dict) else doctor)

    # Get localized welcome message
    welcome_text = WELCOME_MESSAGES.get(lang, WELCOME_MESSAGES["en"])

    # Always send welcome message with WebApp button
    await message.answer(
        welcome_text,
        reply_markup=_build_webapp_button(lang)
    )


__all__ = ["start_router"]
