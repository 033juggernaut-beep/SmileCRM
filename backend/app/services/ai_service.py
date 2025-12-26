"""
AI Service - OpenAI integration for dental assistant
"""
import json
import logging
import re
from datetime import date, datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from openai import OpenAI

from app.config import get_settings
from app.services import patients_service
from app.services import visits_service

logger = logging.getLogger(__name__)

# Default timezone for date calculations
DEFAULT_TIMEZONE = ZoneInfo("Asia/Yerevan")

# System prompt for dental assistant
SYSTEM_PROMPT = """Ты AI-ассистент стоматолога. Твоя задача — анализировать запросы врача и возвращать структурированные данные.

ВАЖНО: Отвечай ТОЛЬКО валидным JSON по схеме ниже. Никакого текста вне JSON.

Схема ответа:
{
  "summary": "краткое описание что ты понял из запроса (1-2 предложения)",
  "actions": [
    // Для диагноза:
    { "type": "update_patient_diagnosis", "patient_id": "uuid", "diagnosis": "текст диагноза" },
    // Для визита:
    { 
      "type": "create_visit", 
      "patient_id": "uuid", 
      "visit_date": "YYYY-MM-DD или null если дата не указана явно",
      "visit_date_raw": "оригинальный текст про дату из речи пользователя (сегодня, завтра, через 3 дня, 5 января и т.д.) или null",
      "next_visit_date": "YYYY-MM-DD или null", 
      "notes": "заметки",
      "needs_clarification": true/false,
      "clarification_question": "вопрос для уточнения даты если needs_clarification=true"
    },
    // Для финансов (временно через notes):
    { "type": "add_finance_note", "patient_id": "uuid", "note": "Оплата: сумма, способ" }
  ],
  "draft": {
    "marketing_message": "текст маркетингового сообщения или null"
  },
  "warnings": ["предупреждения если есть"]
}

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ДЛЯ ДАТ:
1. НЕ ВЫДУМЫВАЙ ДАТЫ! Если пользователь не указал дату явно — ставь visit_date=null и needs_clarification=true
2. Распознавай только явно сказанные даты:
   - "сегодня" / "today" / "այdelays" → visit_date_raw="сегодня"
   - "завтра" / "tomorrow" → visit_date_raw="завтра"  
   - "послезавтра" → visit_date_raw="послезавтра"
   - "через N дней/недель" → visit_date_raw="через N дней"
   - конкретные даты: "5 января", "05.01", "2026-01-05" → visit_date_raw="5 января"
3. Если дата НЕ указана (просто "запиши визит", "новый визит") — ОБЯЗАТЕЛЬНО:
   - visit_date=null
   - needs_clarification=true
   - clarification_question="На какую дату записать визит?"

Другие правила:
1. Если категория "diagnosis" — предлагай action "update_patient_diagnosis"
2. Если категория "visits" — предлагай action "create_visit" с правилами выше
3. Если категория "finance" — предлагай action "add_finance_note"
4. Если категория "marketing" — заполни draft.marketing_message
5. Если patient_id не предоставлен, используй null в actions
6. Отвечай на языке пользователя (hy=армянский, ru=русский, en=английский)
"""


class AIServiceError(Exception):
    """AI service error"""
    pass


class AINotConfiguredError(AIServiceError):
    """AI is not configured"""
    pass


def parse_relative_date(date_raw: str | None, timezone: ZoneInfo = DEFAULT_TIMEZONE) -> str | None:
    """
    Parse relative date expressions to YYYY-MM-DD format.
    
    Supports:
    - сегодня/today/այսdelays
    - завтра/tomorrow
    - послезавтра
    - через N дней/дня/день
    - через N недель/неделю/недели
    - конкретные даты: 5 января, 05.01, 2026-01-05
    """
    if not date_raw:
        return None
    
    date_raw = date_raw.lower().strip()
    now = datetime.now(timezone)
    today = now.date()
    
    # Today
    if any(word in date_raw for word in ['сегодня', 'today', 'այdelays', 'bugun']):
        return today.isoformat()
    
    # Tomorrow
    if any(word in date_raw for word in ['завтра', 'tomorrow', 'վdelays']):
        return (today + timedelta(days=1)).isoformat()
    
    # Day after tomorrow
    if any(word in date_raw for word in ['послезавтра', 'day after tomorrow']):
        return (today + timedelta(days=2)).isoformat()
    
    # "через N дней" pattern
    match = re.search(r'через\s+(\d+)\s*(день|дня|дней|day|days)', date_raw)
    if match:
        days = int(match.group(1))
        return (today + timedelta(days=days)).isoformat()
    
    # "через N недель" pattern
    match = re.search(r'через\s+(\d+)\s*(неделю|недели|недель|week|weeks)', date_raw)
    if match:
        weeks = int(match.group(1))
        return (today + timedelta(weeks=weeks)).isoformat()
    
    # "через неделю" without number
    if 'через неделю' in date_raw or 'in a week' in date_raw:
        return (today + timedelta(weeks=1)).isoformat()
    
    # ISO format: 2026-01-05
    match = re.search(r'(\d{4})-(\d{2})-(\d{2})', date_raw)
    if match:
        try:
            return date(int(match.group(1)), int(match.group(2)), int(match.group(3))).isoformat()
        except ValueError:
            pass
    
    # DD.MM format: 05.01
    match = re.search(r'(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?', date_raw)
    if match:
        try:
            day = int(match.group(1))
            month = int(match.group(2))
            year = int(match.group(3)) if match.group(3) else today.year
            result_date = date(year, month, day)
            # If date is in the past, use next year
            if result_date < today:
                result_date = date(year + 1, month, day)
            return result_date.isoformat()
        except ValueError:
            pass
    
    # Month names: "5 января", "15 february"
    months_ru = {
        'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'ма': 5, 'июн': 6,
        'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12
    }
    months_en = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    # Try Russian months
    for month_prefix, month_num in months_ru.items():
        match = re.search(rf'(\d{{1,2}})\s*{month_prefix}', date_raw)
        if match:
            try:
                day = int(match.group(1))
                year = today.year
                result_date = date(year, month_num, day)
                # If date is in the past, use next year
                if result_date < today:
                    result_date = date(year + 1, month_num, day)
                return result_date.isoformat()
            except ValueError:
                pass
    
    # Try English months
    for month_prefix, month_num in months_en.items():
        match = re.search(rf'(\d{{1,2}})\s*{month_prefix}', date_raw)
        if match:
            try:
                day = int(match.group(1))
                year = today.year
                result_date = date(year, month_num, day)
                if result_date < today:
                    result_date = date(year + 1, month_num, day)
                return result_date.isoformat()
            except ValueError:
                pass
    
    return None


class AIService:
    """Service for AI-powered dental assistant"""

    def __init__(self, doctor_id: str):
        self.doctor_id = doctor_id
        self.settings = get_settings()

    def _get_openai_client(self) -> OpenAI:
        """Get OpenAI client"""
        if not self.settings.OPENAI_API_KEY:
            raise AINotConfiguredError("OPENAI_API_KEY is not configured")
        return OpenAI(api_key=self.settings.OPENAI_API_KEY)

    def get_patient_context(self, patient_id: str) -> dict[str, Any] | None:
        """Get patient context for AI"""
        try:
            patient = patients_service.get_patient(patient_id)
            if not patient:
                return None
            
            return {
                "id": patient.get("id"),
                "name": f"{patient.get('first_name', '')} {patient.get('last_name', '')}",
                "phone": patient.get("phone"),
                "diagnosis": patient.get("diagnosis"),
                "birth_date": patient.get("birth_date"),
            }
        except Exception as e:
            logger.warning(f"Failed to get patient context: {e}")
            return None

    def _post_process_actions(self, actions: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Post-process AI actions to parse dates and validate.
        """
        processed = []
        
        for action in actions:
            if action.get("type") == "create_visit":
                # Try to parse relative date from visit_date_raw
                date_raw = action.get("visit_date_raw")
                visit_date = action.get("visit_date")
                
                # If we have raw date text, try to parse it
                if date_raw:
                    parsed_date = parse_relative_date(date_raw)
                    if parsed_date:
                        action["visit_date"] = parsed_date
                        action["needs_clarification"] = False
                        action["clarification_question"] = None
                
                # If still no date, ensure clarification is requested
                if not action.get("visit_date"):
                    action["visit_date"] = None
                    action["needs_clarification"] = True
                    if not action.get("clarification_question"):
                        action["clarification_question"] = "На какую дату записать визит?"
                
                # Validate date is not in weird range (sanity check)
                if action.get("visit_date"):
                    try:
                        visit_date_obj = date.fromisoformat(action["visit_date"])
                        today = datetime.now(DEFAULT_TIMEZONE).date()
                        # If date is more than 2 years ago or more than 5 years in future, reject
                        if visit_date_obj < today - timedelta(days=730) or visit_date_obj > today + timedelta(days=1825):
                            action["visit_date"] = None
                            action["needs_clarification"] = True
                            action["clarification_question"] = "Дата кажется некорректной. На какую дату записать визит?"
                    except (ValueError, TypeError):
                        action["visit_date"] = None
                        action["needs_clarification"] = True
            
            processed.append(action)
        
        return processed

    def process_assistant_request(
        self,
        category: str,
        text: str,
        patient_id: str | None = None,
        locale: str = "ru",
    ) -> dict[str, Any]:
        """
        Process AI assistant request
        
        Returns structured response with actions and draft
        """
        client = self._get_openai_client()

        # Get current date for context
        now = datetime.now(DEFAULT_TIMEZONE)
        today_str = now.strftime("%Y-%m-%d")
        today_formatted = now.strftime("%d.%m.%Y")

        # Build context
        context_parts = [
            f"Категория запроса: {category}",
            f"Язык ответа: {locale}",
            f"Сегодняшняя дата: {today_str} ({today_formatted})",
            f"Текст запроса: {text}",
        ]

        if patient_id:
            patient_context = self.get_patient_context(patient_id)
            if patient_context:
                context_parts.append(f"Контекст пациента: {json.dumps(patient_context, ensure_ascii=False)}")
            context_parts.append(f"patient_id для actions: {patient_id}")

        user_message = "\n".join(context_parts)

        try:
            response = client.chat.completions.create(
                model=self.settings.AI_MODEL_TEXT,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1000,
            )

            content = response.choices[0].message.content
            if not content:
                raise AIServiceError("Empty response from AI")

            result = json.loads(content)
            
            # Post-process actions (parse dates, validate)
            actions = self._post_process_actions(result.get("actions", []))
            
            return {
                "summary": result.get("summary", ""),
                "actions": actions,
                "draft": result.get("draft", {}),
                "warnings": result.get("warnings", []),
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            raise AIServiceError(f"Invalid JSON from AI: {e}")
        except Exception as e:
            logger.error(f"AI request failed: {e}")
            raise AIServiceError(str(e))

    def apply_actions(self, actions: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Apply AI-suggested actions to the database
        
        Returns summary of applied actions
        """
        results: dict[str, list] = {
            "applied": [],
            "failed": [],
        }

        for action in actions:
            action_type = action.get("type")
            patient_id = action.get("patient_id")

            try:
                if action_type == "update_patient_diagnosis":
                    if not patient_id:
                        results["failed"].append({
                            "action": action_type,
                            "error": "patient_id is required",
                        })
                        continue

                    diagnosis = action.get("diagnosis", "")
                    patients_service.update_patient(
                        patient_id,
                        self.doctor_id,
                        {"diagnosis": diagnosis}
                    )
                    results["applied"].append({
                        "type": action_type,
                        "patient_id": patient_id,
                        "diagnosis": diagnosis,
                    })

                elif action_type == "create_visit":
                    if not patient_id:
                        results["failed"].append({
                            "action": action_type,
                            "error": "patient_id is required",
                        })
                        continue
                    
                    # Check if date is provided
                    visit_date = action.get("visit_date")
                    if not visit_date:
                        results["failed"].append({
                            "action": action_type,
                            "error": "visit_date is required. Please select a date.",
                        })
                        continue

                    visit_data = {
                        "visit_date": visit_date,
                        "next_visit_date": action.get("next_visit_date"),
                        "notes": action.get("notes"),
                    }
                    # Remove None values
                    visit_data = {k: v for k, v in visit_data.items() if v is not None}
                    
                    created = visits_service.create_visit(self.doctor_id, patient_id, visit_data)
                    results["applied"].append({
                        "type": action_type,
                        "patient_id": patient_id,
                        "visit_id": created.get("id") if created else None,
                        "visit_date": visit_date,
                    })

                elif action_type == "add_finance_note":
                    # For MVP, just log - no separate finance table yet
                    results["applied"].append({
                        "type": action_type,
                        "patient_id": patient_id,
                        "note": action.get("note"),
                        "status": "logged_only",
                    })

                else:
                    results["failed"].append({
                        "action": action_type,
                        "error": f"Unknown action type: {action_type}",
                    })

            except Exception as e:
                logger.error(f"Failed to apply action {action_type}: {e}")
                results["failed"].append({
                    "action": action_type,
                    "error": str(e),
                })

        return results
