from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from schemas.schemas import CommentCreate, CommentOut
from services.comment_service import CommentService

router = APIRouter(prefix="/api/tasks", tags=["comments"])


@router.post("/{task_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(task_id: int, payload: CommentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return CommentService(db).add_comment(task_id, payload, current_user.id)
