"""
AI Service - OpenAI integration for dental assistant
"""
import json
import logging
from typing import Any

from openai import OpenAI

from app.config import get_settings
from app.services import patients_service
from app.services import visits_service

logger = logging.getLogger(__name__)

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
    { "type": "create_visit", "patient_id": "uuid", "visit_date": "YYYY-MM-DD", "next_visit_date": "YYYY-MM-DD или null", "notes": "заметки" },
    // Для финансов (временно через notes):
    { "type": "add_finance_note", "patient_id": "uuid", "note": "Оплата: сумма, способ" }
  ],
  "draft": {
    "marketing_message": "текст маркетингового сообщения или null"
  },
  "warnings": ["предупреждения если есть"]
}

Правила:
1. Если категория "diagnosis" — предлагай action "update_patient_diagnosis"
2. Если категория "visits" — предлагай action "create_visit". Дату визита бери из контекста или используй сегодняшнюю
3. Если категория "finance" — предлагай action "add_finance_note" с информацией об оплате
4. Если категория "marketing" — заполни draft.marketing_message персонализированным сообщением
5. Если patient_id не предоставлен, используй null в actions
6. Отвечай на языке пользователя (hy=армянский, ru=русский, en=английский)
"""


class AIServiceError(Exception):
    """AI service error"""
    pass


class AINotConfiguredError(AIServiceError):
    """AI is not configured"""
    pass


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

        # Build context
        context_parts = [
            f"Категория запроса: {category}",
            f"Язык ответа: {locale}",
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
            
            # Ensure required fields
            return {
                "summary": result.get("summary", ""),
                "actions": result.get("actions", []),
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

                    visit_data = {
                        "visit_date": action.get("visit_date"),
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
