from datetime import datetime
from uuid import UUID

from app.application.audit_service import AuditService
from app.domain.entities.report_template import ReportTemplate, ReportType
from app.domain.entities.report_template_field import ReportTemplateField
from app.domain.exceptions import (
    DuplicateFieldKeyError,
    DuplicateTemplateNameError,
    TemplateNotFoundError,
)
from app.domain.repositories.i_report_template_repository import IReportTemplateRepository

_VALID_FORMAT_TYPES = {"string", "integer", "decimal", "date", "datetime", "currency", "percentage"}
_VALID_OUTPUT_FORMATS = {"pdf", "xlsx", "csv"}
_VALID_REPORT_TYPES = {"list", "single", "summary"}


class ReportTemplateService:
    def __init__(
        self,
        repo: IReportTemplateRepository,
        audit_service: AuditService,
    ) -> None:
        self._repo = repo
        self._audit = audit_service

    async def create_template(
        self,
        name: str,
        report_type: str,
        default_output_format: str,
        target_resource_type: str,
        layout_definition: dict,
        fields_data: list[dict],
        description: str | None,
        operator: str,
    ) -> ReportTemplate:
        # Name duplicate check
        existing = await self._get_by_name(name)
        if existing:
            raise DuplicateTemplateNameError(f"Report template name '{name}' already exists")

        # Field key duplicate check
        field_keys = [f["field_key"] for f in fields_data]
        if len(field_keys) != len(set(field_keys)):
            raise DuplicateFieldKeyError("Duplicate field_key in template fields")

        template = ReportTemplate(
            name=name,
            report_type=ReportType(report_type),
            default_output_format=default_output_format,
            target_resource_type=target_resource_type,
            layout_definition=layout_definition,
            description=description,
        )
        fields = [
            ReportTemplateField(
                report_template_id=template.id,
                field_key=f["field_key"],
                label=f["label"],
                source_path=f["source_path"],
                display_order=i,
                format_type=f.get("format_type", "string"),
                format_pattern=f.get("format_pattern"),
                is_required=f.get("is_required", True),
                default_value=f.get("default_value"),
                width=f.get("width"),
                aggregation=f.get("aggregation"),
            )
            for i, f in enumerate(fields_data)
        ]
        await self._repo.create(template, fields)
        await self._audit.log(
            operator=operator,
            action="create_report_template",
            resource_type="report_template",
            resource_id=template.id,
        )
        return template

    async def get_template(self, template_id: UUID) -> tuple[ReportTemplate, list[ReportTemplateField]]:
        template = await self._repo.get_by_id(template_id)
        if not template:
            raise TemplateNotFoundError(f"ReportTemplate {template_id} not found")
        fields = await self._repo.get_fields(template_id)
        return template, fields

    async def list_templates(self, page: int, per_page: int) -> tuple[list[ReportTemplate], int]:
        return await self._repo.list_templates(page, per_page)

    async def update_template(
        self,
        template_id: UUID,
        name: str,
        report_type: str,
        default_output_format: str,
        target_resource_type: str,
        layout_definition: dict,
        fields_data: list[dict],
        description: str | None,
        operator: str,
    ) -> ReportTemplate:
        template = await self._repo.get_by_id(template_id)
        if not template:
            raise TemplateNotFoundError(f"ReportTemplate {template_id} not found")

        field_keys = [f["field_key"] for f in fields_data]
        if len(field_keys) != len(set(field_keys)):
            raise DuplicateFieldKeyError("Duplicate field_key in template fields")

        template.name = name
        template.report_type = ReportType(report_type)
        template.default_output_format = default_output_format
        template.target_resource_type = target_resource_type
        template.layout_definition = layout_definition
        template.description = description
        template.updated_at = datetime.utcnow()

        fields = [
            ReportTemplateField(
                report_template_id=template_id,
                field_key=f["field_key"],
                label=f["label"],
                source_path=f["source_path"],
                display_order=i,
                format_type=f.get("format_type", "string"),
                format_pattern=f.get("format_pattern"),
                is_required=f.get("is_required", True),
                default_value=f.get("default_value"),
                width=f.get("width"),
                aggregation=f.get("aggregation"),
            )
            for i, f in enumerate(fields_data)
        ]
        await self._repo.update(template, fields)
        await self._audit.log(
            operator=operator,
            action="update_report_template",
            resource_type="report_template",
            resource_id=template_id,
        )
        return template

    async def delete_template(self, template_id: UUID, operator: str) -> None:
        template = await self._repo.get_by_id(template_id)
        if not template:
            raise TemplateNotFoundError(f"ReportTemplate {template_id} not found")
        await self._repo.delete(template_id)
        await self._audit.log(
            operator=operator,
            action="delete_report_template",
            resource_type="report_template",
            resource_id=template_id,
        )

    async def _get_by_name(self, name: str) -> ReportTemplate | None:
        templates, _ = await self._repo.list_templates(1, 1000)
        return next((t for t in templates if t.name == name), None)
