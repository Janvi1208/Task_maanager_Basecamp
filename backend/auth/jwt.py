import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    )
    payload = {"sub": str(user_id), "exp": expires}
    return jwt.encode(
        payload,
        os.getenv("JWT_SECRET_KEY", "development-only-change-me"),
        algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
    )


def decode_access_token(token: str) -> int:
    payload = jwt.decode(
        token,
        os.getenv("JWT_SECRET_KEY", "development-only-change-me"),
        algorithms=[os.getenv("JWT_ALGORITHM", "HS256")],
    )
    user_id = payload.get("sub")
    if not user_id:
        raise JWTError("Token has no subject")
    return int(user_id)