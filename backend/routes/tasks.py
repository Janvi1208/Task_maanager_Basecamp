from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from models.models import TaskStatus, TaskPriority
from schemas.schemas import TaskCreate, TaskUpdate, TaskOut, TaskDetailOut, PaginatedTasks
from services.task_service import TaskService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=PaginatedTasks)
def list_tasks(
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority: Optional[TaskPriority] = Query(None),
    assignee: Optional[str] = Query(None),
    search: Optional[str] = Query(None, max_length=200),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    assignee_id = current_user.id if assignee == "me" else (int(assignee) if assignee else None)
    service = TaskService(db)
    return service.list_tasks(status_filter, priority, assignee_id, search, sort_by, sort_dir, page, limit)


@router.get("/{task_id}", response_model=TaskDetailOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return TaskService(db).get_task(task_id)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return TaskService(db).create_task(payload)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return TaskService(db).update_task(task_id, payload)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    TaskService(db).delete_task(task_id)
