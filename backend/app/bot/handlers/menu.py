from __future__ import annotations

from aiogram import F, Router
from aiogram.types import (
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  KeyboardButton,
  Message,
  ReplyKeyboardMarkup,
  WebAppInfo,
)

from app.config import get_settings

menu_router = Router()
settings = get_settings()
FRONTEND_URL = settings.FRONTEND_WEBAPP_URL
IS_DEV = FRONTEND_URL.startswith("http://localhost")

MENU_ITEMS = [
  {
    "label": "➕ Ավելացնել նոր պացիենտ",
    "page": "add_patient",
    "text": "Բացեք Mini App-ում և լրացրեք տվյալները նոր պացիենտի համար։",
  },
  {
    "label": "📋 Իմ պացիենտները",
    "page": "patients",
    "text": "Ցանկը հասանելի է Dental Mini App-ում։",
  },
  {
    "label": "💳 Բաժանորդագրություն",
    "page": "subscription",
    "text": "Ստուգեք բաժանորդագրության կարգավիճակը և կատարեք վճարում Mini App-ում։",
  },
  {
    "label": "ℹ️ Օգնություն",
    "page": "help",
    "text": "Աջակցության նյութերը հասանելի են Mini App-ում։",
  },
  {
    "label": "🔒 Գաղտնիության քաղաքականություն",
    "page": "privacy",
    "text": "Կարդացեք գաղտնիության քաղաքականությունը Mini App-ում։",
  },
]

MENU_LOOKUP = {item["label"]: item for item in MENU_ITEMS}

MAIN_MENU_KEYBOARD = ReplyKeyboardMarkup(
  keyboard=[[KeyboardButton(text=item["label"])] for item in MENU_ITEMS],
  resize_keyboard=True,
)


def _build_webapp_url(page: str | None = None) -> str:
  if page:
    return f"{FRONTEND_URL}?page={page}"
  return FRONTEND_URL


def _build_webapp_markup(page: str, label: str = "Բացել Mini App") -> InlineKeyboardMarkup:
  url = _build_webapp_url(page)
  return InlineKeyboardMarkup(
    inline_keyboard=[
      [InlineKeyboardButton(text=label, web_app=WebAppInfo(url=url))],
    ]
  )


@menu_router.message(F.text.in_(MENU_LOOKUP.keys()))
async def handle_menu_actions(message: Message) -> None:
  item = MENU_LOOKUP.get(message.text or "")
  if not item:
    return
  if IS_DEV:
    await message.answer(f"{item['text']}\n{_build_webapp_url(item['page'])}")
  else:
    markup = _build_webapp_markup(item["page"])
    await message.answer(item["text"], reply_markup=markup)


__all__ = ["menu_router", "MAIN_MENU_KEYBOARD"]

