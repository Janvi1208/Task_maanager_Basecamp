"""
Business logic for tasks. Route handlers stay thin and call into here;
this is where cross-cutting rules (e.g. "assignee must exist", shaping
API output) live.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from models.models import Task, TaskStatus, TaskPriority
from repositories.task_repository import TaskRepository
from repositories.user_repository import UserRepository
from schemas.schemas import TaskCreate, TaskUpdate
from utils.errors import NotFoundError, ValidationAppError
from utils.pagination import PageParams, total_pages


def _to_out_dict(task: Task) -> dict:
    now = datetime.utcnow()
    is_overdue = bool(task.due_date and task.due_date < now and task.status != TaskStatus.completed)
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "assigned_to": task.assigned_to,
        "assignee_name": task.assignee.name if task.assignee else None,
        "due_date": task.due_date,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "is_overdue": is_overdue,
    }


class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.tasks = TaskRepository(db)
        self.users = UserRepository(db)

    def get_task(self, task_id: int) -> dict:
        task = self.tasks.get(task_id)
        if not task:
            raise NotFoundError("Task", task_id)
        data = _to_out_dict(task)
        data["comments"] = [
            {
                "id": c.id,
                "task_id": c.task_id,
                "user_id": c.user_id,
                "comment": c.comment,
                "created_at": c.created_at,
                "author_name": c.author.name if c.author else None,
            }
            for c in task.comments
        ]
        return data

    def list_tasks(
        self,
        status: Optional[TaskStatus],
        priority: Optional[TaskPriority],
        assignee: Optional[int],
        search: Optional[str],
        sort_by: str,
        sort_dir: str,
        page: int,
        limit: int,
    ) -> dict:
        params = PageParams(page=page, limit=limit)
        items, total = self.tasks.list(
            status=status,
            priority=priority,
            assignee=assignee,
            search=search,
            sort_by=sort_by,
            sort_dir=sort_dir if sort_dir in ("asc", "desc") else "desc",
            offset=params.offset,
            limit=params.limit,
        )
        return {
            "items": [_to_out_dict(t) for t in items],
            "total": total,
            "page": params.page,
            "limit": params.limit,
            "total_pages": total_pages(total, params.limit),
        }

    def create_task(self, payload: TaskCreate) -> dict:
        if payload.assigned_to is not None and not self.users.get(payload.assigned_to):
            raise ValidationAppError(
                "assigned_to does not reference an existing user.",
                details={"field": "assigned_to"},
            )
        task = self.tasks.create(**payload.model_dump())
        return _to_out_dict(task)

    def update_task(self, task_id: int, payload: TaskUpdate) -> dict:
        task = self.tasks.get(task_id)
        if not task:
            raise NotFoundError("Task", task_id)

        data = payload.model_dump(exclude_unset=True)
        if "assigned_to" in data and data["assigned_to"] is not None:
            if not self.users.get(data["assigned_to"]):
                raise ValidationAppError(
                    "assigned_to does not reference an existing user.",
                    details={"field": "assigned_to"},
                )

        task = self.tasks.update(task, **data)
        return _to_out_dict(task)

    def delete_task(self, task_id: int) -> None:
        task = self.tasks.get(task_id)
        if not task:
            raise NotFoundError("Task", task_id)
        self.tasks.delete(task)
