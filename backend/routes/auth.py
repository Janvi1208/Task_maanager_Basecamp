from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from auth.jwt import create_access_token
from auth.password import hash_password, verify_password
from database.db import get_db
from repositories.user_repository import UserRepository
from schemas.schemas import AuthResponse, LoginRequest, SignupRequest, UserOut
from utils.errors import AppError


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    users = UserRepository(db)
    if users.get_by_email(payload.email):
        raise AppError("An account with this email already exists.", code="duplicate_email", status_code=409)
    user = users.create(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": user}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = UserRepository(db).get_by_email(payload.email)
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise AppError("Invalid email or password.", code="invalid_credentials", status_code=401)
    return {"access_token": create_access_token(user.id), "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user=Depends(get_current_user)):
    return None