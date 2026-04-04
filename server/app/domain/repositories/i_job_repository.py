from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.import_job import ImportJob


class IJobRepository(ABC):
    @abstractmethod
    async def create(self, job: ImportJob) -> ImportJob: ...

    @abstractmethod
    async def get_by_id(self, job_id: UUID) -> ImportJob | None: ...

    @abstractmethod
    async def list_jobs(
        self, status: str | None, page: int, per_page: int
    ) -> tuple[list[ImportJob], int]: ...

    @abstractmethod
    async def update(self, job: ImportJob) -> ImportJob: ...
