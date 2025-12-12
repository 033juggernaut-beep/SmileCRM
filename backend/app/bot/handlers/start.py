from __future__ import annotations

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from app.config import get_settings
from app.services import doctors_service

start_router = Router()
settings = get_settings()
FRONTEND_URL = settings.FRONTEND_WEBAPP_URL


# Multilingual welcome message for new users
WELCOME_NEW = (
  "\U0001F44B Barev Dzez! Welcome to SmileCRM!\n\n"
  "\U0001F9B7 SmileCRM \u2014 CRM for dental clinics\n\n"
  "\U0001F1E6\U0001F1F2 Barev Dzez SmileCRM! Atomabanakan klinikanerum CRM.\n"
  "\U0001F1F7\U0001F1FA Добро пожаловать в SmileCRM — CRM для стоматологий.\n"
  "\U0001F1EC\U0001F1E7 Welcome to SmileCRM — CRM for dental clinics.\n\n"
  "\U0001F381 7 or anvchar / 7 дней бесплатно / 7-day free trial!\n\n"
  "Нажмите «Открыть SmileCRM» \U0001F447"
)

# Welcome message for existing/registered users  
WELCOME_EXISTING = (
  "\U0001F44B Barev, Doctor!\n\n"
  "\U0001F1E6\U0001F1F2 Sharunakel SmileCRM-um!\n"
  "\U0001F1F7\U0001F1FA Продолжайте работу в SmileCRM!\n"
  "\U0001F1EC\U0001F1E7 Continue using SmileCRM!\n\n"
  "Нажмите «Открыть SmileCRM» \U0001F447"
)


def _build_webapp_button() -> InlineKeyboardMarkup:
  """Build WebApp button to open SmileCRM Mini App."""
  return InlineKeyboardMarkup(
    inline_keyboard=[
      [InlineKeyboardButton(
        text="🦷 Открыть SmileCRM",
        web_app=WebAppInfo(url=FRONTEND_URL)
      )],
    ]
  )


@start_router.message(CommandStart())
async def handle_start(message: Message) -> None:
  """Handle /start command - always show welcome + WebApp button."""
  telegram_user_id = message.from_user.id if message.from_user else None

  # Check if doctor already registered
  doctor = None
  if telegram_user_id is not None:
    try:
      doctor = doctors_service.get_by_telegram_user_id(telegram_user_id)
    except AttributeError:
      doctor = None

  # Choose message based on registration status
  if doctor:
    welcome_text = WELCOME_EXISTING
  else:
    welcome_text = WELCOME_NEW

  # Always send welcome message with WebApp button
  await message.answer(
    welcome_text,
    reply_markup=_build_webapp_button()
  )


__all__ = ["start_router"]
