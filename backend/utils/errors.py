"""
Structured, consistent API error responses.

Every error the API raises deliberately goes through `AppError` so that the
JSON error shape is predictable everywhere:
  { "message": str, "code": str, "details": dict|null }
"""
from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, message: str, code: str = "error", status_code: int = 400, details: dict | None = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str, resource_id):
        super().__init__(
            message=f"{resource} with id {resource_id} was not found.",
            code="not_found",
            status_code=404,
            details={"resource": resource, "id": resource_id},
        )


class ValidationAppError(AppError):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message=message, code="validation_error", status_code=422, details=details)


async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message, "code": exc.code, "details": exc.details},
    )


async def unhandled_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "An unexpected error occurred. Please try again.",
            "code": "internal_error",
            "details": None,
        },
    )
