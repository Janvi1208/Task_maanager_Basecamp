from sqlalchemy.orm import Session

from repositories.user_repository import UserRepository
from schemas.schemas import UserCreate
from utils.errors import ValidationAppError


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def list_users(self):
        return self.users.list()

    def create_user(self, payload: UserCreate):
        if self.users.get_by_email(payload.email):
            raise ValidationAppError(
                "A user with this email already exists.", details={"field": "email"}
            )
        return self.users.create(**payload.model_dump())
