from typing import Optional
from sqlalchemy.orm import Session

from models.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def list(self):
        return self.db.query(User).order_by(User.name.asc()).all()

    def create(self, **fields) -> User:
        user = User(**fields)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
