from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.report_template import ReportTemplate
from app.domain.entities.report_template_field import ReportTemplateField


class IReportTemplateRepository(ABC):
    @abstractmethod
    async def create(
        self, template: ReportTemplate, fields: list[ReportTemplateField]
    ) -> ReportTemplate: ...

    @abstractmethod
    async def get_by_id(self, template_id: UUID) -> ReportTemplate | None: ...

    @abstractmethod
    async def get_fields(self, template_id: UUID) -> list[ReportTemplateField]: ...

    @abstractmethod
    async def list_templates(
        self, page: int, per_page: int
    ) -> tuple[list[ReportTemplate], int]: ...

    @abstractmethod
    async def update(
        self, template: ReportTemplate, fields: list[ReportTemplateField]
    ) -> ReportTemplate: ...

    @abstractmethod
    async def delete(self, template_id: UUID) -> None: ...

    @abstractmethod
    async def has_report_jobs(self, template_id: UUID) -> bool: ...
