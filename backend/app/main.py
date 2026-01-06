import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import ai, ai_assistant, auth, clinics, doctors, marketing, media, notifications, patient_finance, patients, payments, statistics, subscription, test_supabase, visits, voice
from app.bot.bot import get_bot, is_bot_configured, process_update
from app.config import get_settings

settings = get_settings()

# Background scheduler for daily tasks
_scheduler_task: asyncio.Task | None = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("smilecrm")


async def run_daily_reminders_scheduler():
    """
    Background task that runs daily reminder processing.
    Runs at 10:00 AM local time every day.
    """
    from app.services.visit_reminders_service import process_tomorrow_reminders
    from datetime import datetime, timedelta
    
    logger.info("Daily reminders scheduler started")
    
    while True:
        try:
            # Calculate time until next 10:00 AM
            now = datetime.now()
            target_hour = 10
            
            if now.hour < target_hour:
                # Today at 10:00
                next_run = now.replace(hour=target_hour, minute=0, second=0, microsecond=0)
            else:
                # Tomorrow at 10:00
                next_run = (now + timedelta(days=1)).replace(hour=target_hour, minute=0, second=0, microsecond=0)
            
            wait_seconds = (next_run - now).total_seconds()
            logger.info("Next reminder run at %s (in %.0f seconds)", next_run.isoformat(), wait_seconds)
            
            await asyncio.sleep(wait_seconds)
            
            # Run reminders
            logger.info("Running daily visit reminders...")
            try:
                stats = await process_tomorrow_reminders()
                logger.info("Reminder stats: %s", stats)
            except Exception as e:
                logger.error("Error processing reminders: %s", e)
            
        except asyncio.CancelledError:
            logger.info("Daily reminders scheduler cancelled")
            break
        except Exception as e:
            logger.error("Scheduler error: %s", e)
            # Wait 1 hour before retrying on error
            await asyncio.sleep(3600)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Lifespan context manager for application startup/shutdown events.
    Replaces deprecated @app.on_event("startup") pattern.
    """
    global _scheduler_task
    
    # Startup
    logger.info("SmileCRM Backend starting up...")
    
    if settings.WEBHOOK_URL and is_bot_configured():
        webhook_url = settings.WEBHOOK_URL.rstrip("/")
        bot = get_bot()
        try:
            await bot.set_webhook(f"{webhook_url}/bot/webhook")
            logger.info("Telegram webhook configured: %s/bot/webhook", webhook_url)
        except Exception as e:
            logger.error("Failed to set Telegram webhook: %s", e)
    else:
        logger.info("Telegram webhook not configured (missing WEBHOOK_URL or bot token)")
    
    # Start daily reminders scheduler
    _scheduler_task = asyncio.create_task(run_daily_reminders_scheduler())
    logger.info("Daily reminders scheduler initialized")
    
    yield  # Application runs here
    
    # Shutdown
    logger.info("SmileCRM Backend shutting down...")
    
    # Cancel scheduler
    if _scheduler_task:
        _scheduler_task.cancel()
        try:
            await _scheduler_task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="SmileCRM Backend", lifespan=lifespan)

# CORS configuration for Vercel frontend
# Allow both production and dev origins
allowed_origins = [
    "https://smilecrm-miniapp.vercel.app",  # Production Vercel deployment (no trailing slash)
    "https://smilecrm-miniapp-r93fzn29z-maxs-projects-a5ae79fe.vercel.app",  # Vercel preview URL
    "http://localhost:5173",  # Local Vite dev server
    "http://localhost:5174",  # Alternative local port
    "http://localhost:3000",  # Alternative local port
]

# If FRONTEND_WEBAPP_URL is set in env, add it to allowed origins
if settings.FRONTEND_WEBAPP_URL:
    allowed_origins.append(settings.FRONTEND_WEBAPP_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for monitoring."""
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(clinics.router, prefix="/api")
app.include_router(clinics.doctors_router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(patient_finance.router, prefix="/api")
app.include_router(test_supabase.router)
app.include_router(visits.router, prefix="/api")
app.include_router(subscription.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(marketing.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")
app.include_router(ai_assistant.router, prefix="/api")
app.include_router(voice.router, prefix="/api")


@app.post("/bot/webhook")
async def telegram_webhook(request: Request) -> dict[str, bool]:
    """
    Telegram bot webhook endpoint.
    Receives updates from Telegram and processes them via aiogram.
    """
    if not is_bot_configured():
        logger.warning("Telegram webhook called but bot is not configured")
        raise HTTPException(status_code=503, detail="Telegram bot is not configured.")
    
    try:
        data = await request.json()
        logger.debug("Telegram webhook received update: %s", data.get("update_id", "unknown"))
        await process_update(data)
        return {"ok": True}
    except Exception as e:
        logger.error("Error processing Telegram webhook: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process webhook") from e


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log incoming requests.
    Helps with debugging and monitoring.
    
    Note: We avoid reading the request body here because it would
    consume the stream and break file uploads (multipart/form-data).
    """
    # Skip logging for health checks to reduce noise
    if request.url.path == "/health":
        return await call_next(request)
    
    logger.info("Request: %s %s", request.method, request.url.path)
    
    response = await call_next(request)
    return response


if __name__ == "__main__":
    for route in app.routes:
        print(route.path, getattr(route, 'methods', None))
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
