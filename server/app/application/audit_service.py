from uuid import UUID

from app.domain.entities.audit_log import AuditLog
from app.domain.repositories.i_audit_repository import IAuditRepository


class AuditService:
    def __init__(self, audit_repo: IAuditRepository) -> None:
        self._audit_repo = audit_repo

    async def log(
        self,
        operator: str,
        action: str,
        resource_type: str,
        resource_id: UUID,
        details: dict | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            operator=operator,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
        )
        return await self._audit_repo.create(entry)

    async def list_logs(
        self,
        operator: str | None,
        action: str | None,
        resource_type: str | None,
        page: int,
        per_page: int,
    ) -> tuple[list[AuditLog], int]:
        return await self._audit_repo.list_logs(operator, action, resource_type, page, per_page)
