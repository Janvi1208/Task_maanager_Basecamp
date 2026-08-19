import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text

from database.db import Base, engine
from models import models  # noqa: F401  (ensures models are registered before create_all)
from utils.errors import AppError, app_error_handler, unhandled_error_handler
from routes import tasks, users, comments, dashboard, external, auth

load_dotenv()

app = FastAPI(
    title="Internal Task & Management Dashboard API",
    description="REST API powering the internal task-tracking dashboard.",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured, predictable error responses everywhere.
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "The request contains invalid data.",
            "code": "validation_error",
            "details": {"errors": exc.errors()},
        },
    )


@app.on_event("startup")
def on_startup():
    # For a demo/local-first app, create tables automatically if they don't
    # exist yet. For a real deployment, replace with Alembic migrations.
    Base.metadata.create_all(bind=engine)
    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    with engine.begin() as connection:
        if "password_hash" not in columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
        if "updated_at" not in columns:
            column_type = "DATETIME" if engine.dialect.name == "sqlite" else "TIMESTAMP"
            connection.execute(text(f"ALTER TABLE users ADD COLUMN updated_at {column_type}"))


app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(comments.router)
app.include_router(dashboard.router)
app.include_router(external.router)
app.include_router(auth.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
