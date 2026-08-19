from sqlalchemy.orm import Session

from models.models import Comment


class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_task(self, task_id: int):
        return (
            self.db.query(Comment)
            .filter(Comment.task_id == task_id)
            .order_by(Comment.created_at.asc())
            .all()
        )

    def create(self, **fields) -> Comment:
        comment = Comment(**fields)
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment
