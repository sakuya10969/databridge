from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.import_error import ImportError


class IErrorRepository(ABC):
    @abstractmethod
    async def bulk_create(self, errors: list[ImportError]) -> None: ...

    @abstractmethod
    async def list_by_job(
        self,
        job_id: UUID,
        page: int,
        per_page: int,
        column_name: str | None,
        error_type: str | None,
    ) -> tuple[list[ImportError], int]: ...

    @abstractmethod
    async def delete_by_job(self, job_id: UUID) -> None: ...
