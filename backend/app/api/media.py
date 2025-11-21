from fastapi import APIRouter

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/health")
async def media_health_stub() -> dict[str, bool]:
  return {"ok": True}

