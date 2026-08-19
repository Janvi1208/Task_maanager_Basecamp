from sqlalchemy.orm import Session

from repositories.comment_repository import CommentRepository
from repositories.task_repository import TaskRepository
from repositories.user_repository import UserRepository
from schemas.schemas import CommentCreate
from utils.errors import NotFoundError, ValidationAppError


class CommentService:
    def __init__(self, db: Session):
        self.db = db
        self.comments = CommentRepository(db)
        self.tasks = TaskRepository(db)
        self.users = UserRepository(db)

    def add_comment(self, task_id: int, payload: CommentCreate, current_user_id: int):
        task = self.tasks.get(task_id)
        if not task:
            raise NotFoundError("Task", task_id)
        comment = self.comments.create(task_id=task_id, user_id=current_user_id, comment=payload.comment)
        return {
            "id": comment.id,
            "task_id": comment.task_id,
            "user_id": comment.user_id,
            "comment": comment.comment,
            "created_at": comment.created_at,
            "author_name": comment.author.name if comment.author else None,
        }
