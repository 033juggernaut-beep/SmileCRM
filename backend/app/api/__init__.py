from fastapi import APIRouter

from .auth import router as auth_router
from .doctors import router as doctors_router
from .patients import router as patients_router
from .test_supabase import router as test_supabase_router
from .visits import router as visits_router
from .subscription import router as subscription_router
from .media import router as media_router
from .payments import router as payments_router


def get_api_router() -> APIRouter:
  api_router = APIRouter()
  api_router.include_router(auth_router)
  api_router.include_router(doctors_router)
  api_router.include_router(patients_router)
  api_router.include_router(test_supabase_router)
  api_router.include_router(visits_router)
  api_router.include_router(subscription_router)
  api_router.include_router(media_router)
  api_router.include_router(payments_router)
  return api_router

