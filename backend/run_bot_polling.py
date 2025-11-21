"""
Helper script to run the Telegram bot in polling mode.

Usage:
  python run_bot_polling.py
"""

from __future__ import annotations

import asyncio
import logging

from app.bot.bot import get_bot, is_bot_configured, run_polling

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("run_bot_polling")


async def main() -> None:
  logger.info("[run_bot_polling] Script started")

  configured = is_bot_configured()
  logger.info("[run_bot_polling] Bot configured: %s", configured)
  if not configured:
    logger.error("[run_bot_polling] TELEGRAM_BOT_TOKEN is missing or invalid, polling aborted.")
    return

  try:
    get_bot()
  except RuntimeError as exc:
    logger.error("[run_bot_polling] %s Polling aborted.", exc)
    return

  logger.info("[run_bot_polling] Starting polling...")
  await run_polling()


if __name__ == "__main__":
  try:
    asyncio.run(main())
  except KeyboardInterrupt:
    logger.info("[run_bot_polling] Polling stopped by user.")

