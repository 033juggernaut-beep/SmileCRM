import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import ai, auth, doctors, marketing, media, notifications, patient_finance, patients, payments, subscription, test_supabase, visits
from app.bot.bot import get_bot, is_bot_configured, process_update
from app.config import get_settings

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("smilecrm")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Lifespan context manager for application startup/shutdown events.
    Replaces deprecated @app.on_event("startup") pattern.
    """
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
    
    yield  # Application runs here
    
    # Shutdown
    logger.info("SmileCRM Backend shutting down...")


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
