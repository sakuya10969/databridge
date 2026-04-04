from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.report_job import ReportJob


class IReportJobRepository(ABC):
    @abstractmethod
    async def create(self, job: ReportJob) -> ReportJob: ...

    @abstractmethod
    async def get_by_id(self, job_id: UUID) -> ReportJob | None: ...

    @abstractmethod
    async def list_jobs(
        self, status: str | None, page: int, per_page: int
    ) -> tuple[list[ReportJob], int]: ...

    @abstractmethod
    async def update(self, job: ReportJob) -> ReportJob: ...
