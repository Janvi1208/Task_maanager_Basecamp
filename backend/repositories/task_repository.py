"""
Data-access layer for Task. Contains no business rules — only query
construction — so services can be tested/changed independently of the DB
access patterns.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import or_, asc, desc
from sqlalchemy.orm import Session

from models.models import Task, TaskStatus, TaskPriority


SORTABLE_FIELDS = {
    "due_date": Task.due_date,
    "created_at": Task.created_at,
    "updated_at": Task.updated_at,
    "title": Task.title,
    "priority": Task.priority,
    "status": Task.status,
}


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, task_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def list(
        self,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        assignee: Optional[int] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
        offset: int = 0,
        limit: int = 20,
    ):
        query = self.db.query(Task)

        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if assignee:
            query = query.filter(Task.assigned_to == assignee)
        if search:
            like = f"%{search}%"
            query = query.filter(or_(Task.title.ilike(like), Task.description.ilike(like)))

        total = query.count()

        column = SORTABLE_FIELDS.get(sort_by, Task.created_at)
        query = query.order_by(asc(column) if sort_dir == "asc" else desc(column))

        items = query.offset(offset).limit(limit).all()
        return items, total

    def create(self, **fields) -> Task:
        task = Task(**fields)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, **fields) -> Task:
        for key, value in fields.items():
            if value is not None:
                setattr(task, key, value)
        task.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    # ---- dashboard aggregate helpers ----

    def count_by_status(self, status: TaskStatus) -> int:
        return self.db.query(Task).filter(Task.status == status).count()

    def count_overdue(self) -> int:
        now = datetime.utcnow()
        return (
            self.db.query(Task)
            .filter(Task.due_date < now, Task.status != TaskStatus.completed)
            .count()
        )

    def count_total(self) -> int:
        return self.db.query(Task).count()

    def count_assigned_to(self, user_id: int) -> int:
        return self.db.query(Task).filter(Task.assigned_to == user_id).count()

    def count_by_priority(self) -> dict:
        result = {}
        for p in TaskPriority:
            result[p.value] = self.db.query(Task).filter(Task.priority == p).count()
        return result
