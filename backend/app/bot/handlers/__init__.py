"""Aiogram bot handlers package."""

from .menu import MAIN_MENU_KEYBOARD, menu_router
from .start import start_router

__all__ = [
  "menu_router",
  "start_router",
  "MAIN_MENU_KEYBOARD",
]

