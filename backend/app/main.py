from fastapi import FastAPI, HTTPException, Request

from app.api import auth, doctors, media, patients, payments, subscription, test_supabase, visits
from app.bot.bot import get_bot, is_bot_configured, process_update
from app.config import get_settings

settings = get_settings()

app = FastAPI(title="SmileCRM Backend")


@app.get("/health")
async def health_check() -> dict[str, str]:
  return {"status": "ok"}


app.include_router(auth.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(test_supabase.router)
app.include_router(visits.router, prefix="/api")
app.include_router(subscription.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(payments.router, prefix="/api")


@app.post("/bot/webhook")
async def telegram_webhook(request: Request) -> dict[str, bool]:
  if not is_bot_configured():
    raise HTTPException(status_code=503, detail="Telegram bot is not configured.")
  data = await request.json()
  await process_update(data)
  return {"ok": True}


@app.on_event("startup")
async def on_startup() -> None:
  if settings.WEBHOOK_URL and is_bot_configured():
    webhook_url = settings.WEBHOOK_URL.rstrip("/")
    bot = get_bot()
    await bot.set_webhook(f"{webhook_url}/bot/webhook")


# Временный вывод маршрутов для отладки
if __name__ == "__main__":
  for route in app.routes:
    print(route.path, route.methods)
