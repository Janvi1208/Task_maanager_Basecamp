from typing import List
from fastapi import APIRouter, Depends, status
from auth.dependencies import get_current_user
from sqlalchemy.orm import Session

from database.db import get_db
from schemas.schemas import UserCreate, UserOut
from services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return UserService(db).list_users()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return UserService(db).create_user(payload)
