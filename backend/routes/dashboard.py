from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from schemas.schemas import DashboardOut
from services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(current_user_id: Optional[int] = Query(None), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DashboardService(db).get_dashboard(current_user.id)
