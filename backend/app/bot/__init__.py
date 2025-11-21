"""Aiogram bot package."""

from .bot import bot, dp, get_bot, is_bot_configured, process_update, run_polling

__all__ = ["bot", "dp", "process_update", "run_polling", "is_bot_configured", "get_bot"]
