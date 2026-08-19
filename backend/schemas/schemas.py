"""
Pydantic schemas — the API's public contract.

Kept separate from the SQLAlchemy models on purpose (rule #: "Clearly
separate database models from API schemas") so the wire format can evolve
independently of storage.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from models.models import TaskStatus, TaskPriority, UserRole


# ---------- Users ----------

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    role: UserRole = UserRole.member


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ---------- Comments ----------

class CommentCreate(BaseModel):
    comment: str = Field(..., min_length=1, max_length=2000)
    user_id: Optional[int] = None


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    task_id: int
    user_id: Optional[int]
    comment: str
    created_at: datetime
    author_name: Optional[str] = None


# ---------- Tasks ----------

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field("", max_length=5000)
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    """All fields optional — this backs the PUT/PATCH-style update endpoint."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    assigned_to: Optional[int]
    assignee_name: Optional[str] = None
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    is_overdue: bool = False


class TaskDetailOut(TaskOut):
    comments: List[CommentOut] = []


class PaginatedTasks(BaseModel):
    items: List[TaskOut]
    total: int
    page: int
    limit: int
    total_pages: int


# ---------- Dashboard ----------

class DashboardOut(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    blocked_tasks: int
    overdue_tasks: int
    my_tasks: int
    tasks_by_priority: dict
    completion_rate: float


# ---------- Errors ----------

class ErrorDetail(BaseModel):
    message: str
    code: str
    details: Optional[dict] = None
