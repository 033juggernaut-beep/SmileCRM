from __future__ import annotations

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from app.config import get_settings
from app.services import doctors_service

from .menu import MAIN_MENU_KEYBOARD

start_router = Router()
settings = get_settings()
FRONTEND_URL = settings.FRONTEND_WEBAPP_URL or settings.TELEGRAM_WEBAPP_URL or "https://miniapp.local"
IS_DEV = FRONTEND_URL.startswith("http://")


def _build_webapp_url(page: str | None = None) -> str:
  if page:
    return f"{FRONTEND_URL}?page={page}"
  return FRONTEND_URL


def _build_inline_button(label: str, page: str | None = None) -> InlineKeyboardMarkup:
  url = _build_webapp_url(page)
  return InlineKeyboardMarkup(
    inline_keyboard=[
      [InlineKeyboardButton(text=label, web_app=WebAppInfo(url=url))],
    ]
  )


@start_router.message(CommandStart())
async def handle_start(message: Message) -> None:
  telegram_user_id = message.from_user.id if message.from_user else None

  doctor = None
  if telegram_user_id is not None:
    try:
      doctor = doctors_service.get_by_telegram_user_id(telegram_user_id)
    except AttributeError:
      doctor = None

  if not doctor:
    register_url = _build_webapp_url("register")
    if IS_DEV:
      await message.answer(f"Բարև Ձեզ 👋\nԳրանցվելու համար բացեք Mini App: {register_url}")
    else:
      register_markup = _build_inline_button("Գրանցվել (բացել Mini App)", page="register")
      await message.answer("Բարև Ձեզ 👋\nԳրանցվելու համար բացեք Mini App.", reply_markup=register_markup)
    return

  first_name = None
  if isinstance(doctor, dict):
    first_name = doctor.get("first_name")
  else:
    first_name = getattr(doctor, "first_name", None)
  fallback_name = message.from_user.first_name if message.from_user else ""
  doctor_name = first_name or fallback_name or ""

  greeting = f"Բարև Ձեզ, Դոկտոր {doctor_name}!"
  await message.answer(greeting.strip(), reply_markup=MAIN_MENU_KEYBOARD)

  open_app_message = "Բացեք Dental Mini App՝ շարունակելու համար։"
  if IS_DEV:
    await message.answer(f"{open_app_message}\n{_build_webapp_url(None)}")
  else:
    open_app_markup = _build_inline_button("Բացել Mini App")
    await message.answer(open_app_message, reply_markup=open_app_markup)


__all__ = ["start_router"]

