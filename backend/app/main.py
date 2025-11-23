import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.logger import logger as fastapi_logger
import uvicorn

from app.api import auth, doctors, media, patients, payments, subscription, test_supabase, visits
from app.bot.bot import get_bot, is_bot_configured, process_update
from app.config import get_settings

settings = get_settings()

logger = fastapi_logger

app = FastAPI(title="SmileCRM Backend")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


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


@app.middleware("http")
async def log_requests(request: Request, call_next):
  body_bytes = await request.body()
  truncated_body = body_bytes[:512].decode("utf-8", errors="replace") if body_bytes else ""
  logger.info("Incoming request %s %s", request.method, request.url.path)
  if truncated_body:
    logger.info("Request body preview: %s", truncated_body)
  elif request.method in {"POST", "PUT", "PATCH"}:
    logger.error("Request %s %s arrived without payload", request.method, request.url.path)

  response = await call_next(request)
  return response


@app.on_event("startup")
async def on_startup() -> None:
  if settings.WEBHOOK_URL and is_bot_configured():
    webhook_url = settings.WEBHOOK_URL.rstrip("/")
    bot = get_bot()
    await bot.set_webhook(f"{webhook_url}/bot/webhook")


if __name__ == "__main__":
  for route in app.routes:
    print(route.path, route.methods)
  port = int(os.environ.get("PORT", "8000"))
  uvicorn.run("app.main:app", host="0.0.0.0", port=port)
