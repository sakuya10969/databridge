from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.audit_log import AuditLog


class IAuditRepository(ABC):
    @abstractmethod
    async def create(self, log: AuditLog) -> AuditLog: ...

    @abstractmethod
    async def list_logs(
        self,
        operator: str | None,
        action: str | None,
        resource_type: str | None,
        page: int,
        per_page: int,
    ) -> tuple[list[AuditLog], int]: ...
