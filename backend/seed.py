"""
Populates the database with demo users, tasks, and comments.

Run with:  python seed.py
Safe to re-run: it clears existing rows first.
"""
from datetime import datetime, timedelta
import random

from database.db import Base, engine, SessionLocal
from models.models import User, Task, Comment, TaskStatus, TaskPriority, UserRole

Base.metadata.create_all(bind=engine)

db = SessionLocal()

db.query(Comment).delete()
db.query(Task).delete()
db.query(User).delete()
db.commit()

users = [
    User(name="Ava Patel", email="ava.patel@company.com", role=UserRole.admin),
    User(name="Marcus Chen", email="marcus.chen@company.com", role=UserRole.manager),
    User(name="Sofia Rossi", email="sofia.rossi@company.com", role=UserRole.member),
    User(name="Jamal Carter", email="jamal.carter@company.com", role=UserRole.member),
    User(name="Elena Novak", email="elena.novak@company.com", role=UserRole.member),
]
db.add_all(users)
db.commit()
for u in users:
    db.refresh(u)

task_titles = [
    "Set up CI pipeline for backend",
    "Design onboarding email sequence",
    "Fix pagination bug on tasks table",
    "Write Q3 marketing report",
    "Migrate database to new schema",
    "Review pull request #482",
    "Prepare client demo for Shopify integration",
    "Update API documentation",
    "Investigate slow dashboard queries",
    "Plan sprint retrospective",
    "Draft privacy policy update",
    "Implement dark mode toggle",
    "Audit third-party dependencies",
    "Create onboarding checklist for new hires",
    "Refactor task repository layer",
    "Set up staging environment",
    "Design Kanban board mockups",
    "Reduce bundle size on frontend",
    "Coordinate vendor contract renewal",
    "Write unit tests for comment service",
]

statuses = list(TaskStatus)
priorities = list(TaskPriority)

tasks = []
now = datetime.utcnow()
for i, title in enumerate(task_titles):
    status = random.choice(statuses)
    due_offset = random.randint(-10, 20)
    task = Task(
        title=title,
        description=f"Details and acceptance criteria for: {title.lower()}.",
        status=status,
        priority=random.choice(priorities),
        assigned_to=random.choice(users).id,
        due_date=now + timedelta(days=due_offset),
        created_at=now - timedelta(days=random.randint(1, 30)),
    )
    tasks.append(task)

db.add_all(tasks)
db.commit()
for t in tasks:
    db.refresh(t)

sample_comments = [
    "Started looking into this, will update by EOD.",
    "Blocked on design review, following up with Ava.",
    "Looks good — approved, ready to ship.",
    "Can we push the due date by two days?",
    "Added the missing edge case handling.",
]

for task in random.sample(tasks, k=12):
    for _ in range(random.randint(1, 3)):
        db.add(
            Comment(
                task_id=task.id,
                user_id=random.choice(users).id,
                comment=random.choice(sample_comments),
                created_at=now - timedelta(days=random.randint(0, 5)),
            )
        )
db.commit()
db.close()

print(f"Seeded {len(users)} users and {len(tasks)} tasks with comments.")
