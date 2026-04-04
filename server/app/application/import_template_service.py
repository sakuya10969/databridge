from uuid import UUID

from app.application.audit_service import AuditService
from app.domain.entities.template import Template
from app.domain.exceptions import DuplicateTemplateNameError, TemplateNotFoundError
from app.domain.repositories.i_template_repository import ITemplateRepository


class ImportTemplateService:
    def __init__(
        self, template_repo: ITemplateRepository, audit_service: AuditService
    ) -> None:
        self._repo = template_repo
        self._audit = audit_service

    async def create_template(
        self,
        name: str,
        target_table: str,
        column_definitions: list[dict],
        description: str | None,
        operator: str,
    ) -> Template:
        existing = await self._repo.get_by_name(name)
        if existing:
            raise DuplicateTemplateNameError(f"Template name '{name}' already exists")

        template = Template(
            name=name,
            target_table=target_table,
            column_definitions=column_definitions,
            description=description,
        )
        await self._repo.create(template)
        await self._audit.log(
            operator=operator,
            action="create_template",
            resource_type="template",
            resource_id=template.id,
            details={"name": name},
        )
        return template

    async def get_template(self, template_id: UUID) -> Template:
        template = await self._repo.get_by_id(template_id)
        if not template:
            raise TemplateNotFoundError(f"Template {template_id} not found")
        return template

    async def list_templates(self, page: int, per_page: int) -> tuple[list[Template], int]:
        return await self._repo.list_templates(page, per_page)
