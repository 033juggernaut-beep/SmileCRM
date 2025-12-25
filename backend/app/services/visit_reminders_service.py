"""
Visit Reminders Service

Handles sending visit reminders to patients via Telegram or WhatsApp.
Runs daily to send reminders for tomorrow's visits.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from datetime import date, timedelta
from typing import Any

from app.config import get_settings
from app.services import visits_service

logger = logging.getLogger("smilecrm.reminders")
settings = get_settings()


# =============================================================================
# WhatsApp Provider Interface
# =============================================================================

class WhatsAppProvider(ABC):
  """Abstract base class for WhatsApp message providers."""
  
  @abstractmethod
  async def send_message(self, phone: str, text: str) -> bool:
    """
    Send a WhatsApp message.
    
    Args:
      phone: Phone number in international format (e.g., +374XXXXXXXXX)
      text: Message text to send
    
    Returns:
      True if message was sent successfully, False otherwise
    """
    pass


class StubWhatsAppProvider(WhatsAppProvider):
  """Stub provider that logs messages but doesn't actually send them."""
  
  async def send_message(self, phone: str, text: str) -> bool:
    logger.info(
      "[WhatsApp STUB] Would send to %s: %s...", 
      phone, 
      text[:50]
    )
    # Return False to indicate message wasn't actually sent
    # In production, replace with real provider
    return False


class TwilioWhatsAppProvider(WhatsAppProvider):
  """Twilio WhatsApp provider (placeholder for future implementation)."""
  
  def __init__(self, account_sid: str, auth_token: str, from_number: str):
    self.account_sid = account_sid
    self.auth_token = auth_token
    self.from_number = from_number
  
  async def send_message(self, phone: str, text: str) -> bool:
    # TODO: Implement actual Twilio integration
    # from twilio.rest import Client
    # client = Client(self.account_sid, self.auth_token)
    # message = client.messages.create(
    #   from_=f"whatsapp:{self.from_number}",
    #   to=f"whatsapp:{phone}",
    #   body=text
    # )
    logger.warning("[Twilio] Not implemented yet. Would send to %s", phone)
    return False


def get_whatsapp_provider() -> WhatsAppProvider:
  """Get configured WhatsApp provider based on environment."""
  provider_name = getattr(settings, 'WHATSAPP_PROVIDER', None)
  
  if provider_name == 'twilio':
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
    from_number = getattr(settings, 'TWILIO_WHATSAPP_FROM', None)
    
    if account_sid and auth_token and from_number:
      return TwilioWhatsAppProvider(account_sid, auth_token, from_number)
  
  # Default to stub provider
  return StubWhatsAppProvider()


# =============================================================================
# Telegram Reminder Sender
# =============================================================================

async def send_telegram_reminder(telegram_user_id: int, text: str) -> bool:
  """
  Send a visit reminder via Telegram bot.
  
  Args:
    telegram_user_id: Telegram user ID of the patient
    text: Reminder message text
  
  Returns:
    True if sent successfully, False otherwise
  """
  try:
    from app.bot.bot import get_bot, is_bot_configured
    
    if not is_bot_configured():
      logger.warning("Telegram bot not configured, cannot send reminder")
      return False
    
    bot = get_bot()
    await bot.send_message(chat_id=telegram_user_id, text=text)
    logger.info("Sent Telegram reminder to user %s", telegram_user_id)
    return True
    
  except Exception as e:
    logger.error("Failed to send Telegram reminder to %s: %s", telegram_user_id, e)
    return False


# =============================================================================
# Reminder Text Templates
# =============================================================================

def get_reminder_text(
  patient_name: str,
  doctor_name: str,
  visit_time: str | None = None,
  language: str = "ru",
) -> str:
  """
  Generate reminder text in the specified language.
  
  Args:
    patient_name: Patient's full name
    doctor_name: Doctor's full name
    visit_time: Time of visit (optional)
    language: Language code (ru, am, en)
  
  Returns:
    Formatted reminder text
  """
  time_str = visit_time if visit_time else "уточните у клиники"
  
  templates = {
    "ru": f"""Напоминание: завтра у вас визит к доктору {doctor_name}.
Пациент: {patient_name}
Время: {time_str}

Пожалуйста, приходите вовремя. Если нужно отменить или перенести визит, свяжитесь с клиникой.""",

    "am": f"""Հdelays: Վdelays {doctor_name} delays.
Հdays: {patient_name}
 Delays: {time_str}

Delays delays delays. delays delays delays delays.""",

    "en": f"""Reminder: You have a dental appointment tomorrow with Dr. {doctor_name}.
Patient: {patient_name}
Time: {time_str}

Please arrive on time. If you need to cancel or reschedule, contact the clinic.""",
  }
  
  return templates.get(language, templates["ru"])


# =============================================================================
# Daily Reminder Job
# =============================================================================

async def process_tomorrow_reminders() -> dict[str, int]:
  """
  Process and send reminders for tomorrow's visits.
  
  This function:
  1. Gets all visits for tomorrow with pending reminder status
  2. For each visit, tries to send reminder via Telegram or WhatsApp
  3. Updates reminder status accordingly
  
  Returns:
    Statistics dict with counts of sent, failed, skipped reminders
  """
  tomorrow = date.today() + timedelta(days=1)
  logger.info("Processing reminders for %s", tomorrow.isoformat())
  
  stats = {
    "total": 0,
    "telegram_sent": 0,
    "whatsapp_sent": 0,
    "failed": 0,
    "no_contact": 0,
  }
  
  # Get visits needing reminders
  visits = visits_service.list_visits_for_reminder(tomorrow)
  stats["total"] = len(visits)
  
  if not visits:
    logger.info("No visits requiring reminders for %s", tomorrow.isoformat())
    return stats
  
  whatsapp_provider = get_whatsapp_provider()
  
  for visit in visits:
    visit_id = visit.get("id")
    patient = visit.get("patients", {})
    doctor = visit.get("doctors", {})
    
    patient_name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
    doctor_name = f"{doctor.get('first_name', '')} {doctor.get('last_name', '')}".strip()
    visit_time = visit.get("visit_time")
    
    telegram_user_id = patient.get("telegram_user_id")
    whatsapp_phone = patient.get("whatsapp_phone") or patient.get("phone")
    
    reminder_text = get_reminder_text(
      patient_name=patient_name,
      doctor_name=doctor_name,
      visit_time=visit_time,
    )
    
    sent = False
    channel = None
    
    # Try Telegram first
    if telegram_user_id:
      sent = await send_telegram_reminder(telegram_user_id, reminder_text)
      if sent:
        channel = "telegram"
        stats["telegram_sent"] += 1
    
    # Fall back to WhatsApp
    if not sent and whatsapp_phone:
      sent = await whatsapp_provider.send_message(whatsapp_phone, reminder_text)
      if sent:
        channel = "whatsapp"
        stats["whatsapp_sent"] += 1
    
    # Update visit reminder status
    if sent:
      visits_service.update_reminder_status(visit_id, status="sent", channel=channel)
    elif not telegram_user_id and not whatsapp_phone:
      visits_service.update_reminder_status(visit_id, status="skipped")
      stats["no_contact"] += 1
    else:
      visits_service.update_reminder_status(visit_id, status="failed", channel=channel)
      stats["failed"] += 1
  
  logger.info(
    "Reminder processing complete: %d total, %d telegram, %d whatsapp, %d failed, %d no contact",
    stats["total"],
    stats["telegram_sent"],
    stats["whatsapp_sent"],
    stats["failed"],
    stats["no_contact"],
  )
  
  return stats

