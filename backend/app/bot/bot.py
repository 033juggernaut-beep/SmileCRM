from __future__ import annotations

import logging
from typing import Any, Mapping

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.types import Update
from aiogram.utils.token import TokenValidationError, validate_token

from app.config import get_settings
from .handlers import menu_router, start_router

logger = logging.getLogger(__name__)
settings = get_settings()


def _create_bot() -> Bot | None:
  token = settings.TELEGRAM_BOT_TOKEN
  if not token:
    logger.warning("TELEGRAM_BOT_TOKEN is not configured; bot features are disabled.")
    return None
  try:
    validate_token(token)
  except TokenValidationError:
    logger.warning("Provided TELEGRAM_BOT_TOKEN is invalid; bot features are disabled.")
    return None
  default_props = DefaultBotProperties(parse_mode="HTML")
  return Bot(token=token, default=default_props)


_bot_instance = _create_bot()
dp = Dispatcher()

dp.include_router(start_router)
dp.include_router(menu_router)


def is_bot_configured() -> bool:
  return _bot_instance is not None


def get_bot() -> Bot:
  if _bot_instance is None:
    raise RuntimeError("Telegram bot token is missing or invalid. Update TELEGRAM_BOT_TOKEN in your environment.")
  return _bot_instance


async def process_update(update: Mapping[str, Any]) -> None:
  bot = get_bot()
  telegram_update = Update.model_validate(update)
  await dp.feed_update(bot, telegram_update)


async def run_polling() -> None:
  bot = get_bot()
  await dp.start_polling(bot)


bot = _bot_instance

__all__ = ["bot", "dp", "process_update", "run_polling", "is_bot_configured", "get_bot"]

