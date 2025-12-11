from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

  SUPABASE_URL: str = "https://example.supabase.co"
  SUPABASE_ANON_KEY: str = "supabase-anon-key"
  SUPABASE_SERVICE_ROLE_KEY: str = "supabase-service-role-key"
  TELEGRAM_BOT_TOKEN: str = "telegram-bot-token"
  TELEGRAM_WEBAPP_URL: Optional[str] = None
  FRONTEND_WEBAPP_URL: str = "http://localhost:5173"
  WEBHOOK_URL: Optional[str] = None
  ENV: str = "development"
  
  # Skip subscription/trial check for development
  SKIP_SUBSCRIPTION_CHECK: bool = False


@lru_cache
def get_settings() -> Settings:
  return Settings()

