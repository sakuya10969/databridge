from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.report_output import ReportOutput


class IReportOutputRepository(ABC):
    @abstractmethod
    async def create(self, output: ReportOutput) -> ReportOutput: ...

    @abstractmethod
    async def get_latest_by_job(self, job_id: UUID) -> ReportOutput | None: ...
