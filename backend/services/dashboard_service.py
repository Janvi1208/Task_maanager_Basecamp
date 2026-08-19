from sqlalchemy.orm import Session

from models.models import TaskStatus
from repositories.task_repository import TaskRepository


class DashboardService:
    def __init__(self, db: Session):
        self.tasks = TaskRepository(db)

    def get_dashboard(self, current_user_id: int | None) -> dict:
        total = self.tasks.count_total()
        pending = self.tasks.count_by_status(TaskStatus.pending)
        in_progress = self.tasks.count_by_status(TaskStatus.in_progress)
        completed = self.tasks.count_by_status(TaskStatus.completed)
        blocked = self.tasks.count_by_status(TaskStatus.blocked)
        overdue = self.tasks.count_overdue()
        my_tasks = self.tasks.count_assigned_to(current_user_id) if current_user_id else 0
        completion_rate = round((completed / total) * 100, 1) if total else 0.0

        return {
            "total_tasks": total,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "blocked_tasks": blocked,
            "overdue_tasks": overdue,
            "my_tasks": my_tasks,
            "tasks_by_priority": self.tasks.count_by_priority(),
            "completion_rate": completion_rate,
        }
