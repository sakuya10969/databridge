from fastapi import APIRouter

from app.presentation.audit_logs.router import router as audit_logs_router
from app.presentation.jobs.router import router as jobs_router
from app.presentation.report_jobs.router import router as report_jobs_router
from app.presentation.report_templates.router import router as report_templates_router
from app.presentation.templates.router import router as templates_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(audit_logs_router)
api_router.include_router(jobs_router)
api_router.include_router(templates_router)
api_router.include_router(report_templates_router)
api_router.include_router(report_jobs_router)
