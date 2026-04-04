from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.column_mapping import ColumnMapping


class IMappingRepository(ABC):
    @abstractmethod
    async def bulk_create(self, mappings: list[ColumnMapping]) -> None: ...

    @abstractmethod
    async def list_by_job(self, job_id: UUID) -> list[ColumnMapping]: ...

    @abstractmethod
    async def delete_by_job(self, job_id: UUID) -> None: ...
