from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from auth.jwt import decode_access_token
from database.db import get_db
from repositories.user_repository import UserRepository
from utils.errors import AppError


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise AppError("Authentication is required.", code="unauthorized", status_code=401)
    try:
        user_id = decode_access_token(credentials.credentials)
    except (JWTError, ValueError, TypeError):
        raise AppError("Your session has expired. Please log in again.", code="unauthorized", status_code=401)

    user = UserRepository(db).get(user_id)
    if not user:
        raise AppError("Your session is no longer valid. Please log in again.", code="unauthorized", status_code=401)
    return user