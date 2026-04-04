import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    DataImportError,
    DomainError,
    DuplicateFieldKeyError,
    DuplicateTemplateNameError,
    InvalidFilterError,
    InvalidStatusTransitionError,
    JobNotFoundError,
    ParseError,
    ReportGenerationError,
    ReportOutputNotFoundError,
    TemplateNotFoundError,
    ValidationError,
)

logger = logging.getLogger(__name__)

_DOMAIN_ERROR_MAP: dict[type[DomainError], tuple[int, str]] = {
    JobNotFoundError: (404, "NOT_FOUND"),
    TemplateNotFoundError: (404, "NOT_FOUND"),
    ReportOutputNotFoundError: (404, "REPORT_OUTPUT_NOT_FOUND"),
    InvalidStatusTransitionError: (409, "INVALID_STATUS"),
    DuplicateTemplateNameError: (409, "DUPLICATE_NAME"),
    DuplicateFieldKeyError: (409, "DUPLICATE_FIELD_KEY"),
    ParseError: (422, "PARSE_ERROR"),
    ValidationError: (422, "VALIDATION_FAILED"),
    InvalidFilterError: (422, "INVALID_FILTER"),
    DataImportError: (500, "IMPORT_ERROR"),
    ReportGenerationError: (500, "REPORT_GENERATION_ERROR"),
}


def _error_response(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "details": []}},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
        for exc_type, (status, code) in _DOMAIN_ERROR_MAP.items():
            if isinstance(exc, exc_type):
                return _error_response(status, code, str(exc))
        return _error_response(500, "INTERNAL_ERROR", str(exc))

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unexpected error: %s\n%s", exc, traceback.format_exc())
        return _error_response(500, "INTERNAL_ERROR", "An unexpected error occurred.")
