from fastapi import APIRouter

from services.external_api_service import ExternalApiService

router = APIRouter(prefix="/api/external", tags=["external"])


@router.get("/daily-tip")
async def get_daily_tip():
    return await ExternalApiService().get_daily_tip()
