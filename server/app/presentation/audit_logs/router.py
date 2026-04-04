from fastapi import APIRouter, Depends, Query

from app.application.audit_service import AuditService
from app.presentation.audit_logs.schemas import AuditLogResponse
from app.presentation.common_schemas import ApiResponse, PaginationMeta
from app.presentation.dependencies import get_audit_service

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=ApiResponse[list[AuditLogResponse]])
async def list_audit_logs(
    operator: str | None = Query(None),
    action: str | None = Query(None),
    resource_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: AuditService = Depends(get_audit_service),
) -> ApiResponse[list[AuditLogResponse]]:
    logs, total = await service.list_logs(operator, action, resource_type, page, per_page)
    return ApiResponse(
        data=[AuditLogResponse(**log.__dict__) for log in logs],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )
