from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.report_template import ReportTemplate, ReportType
from app.domain.entities.report_template_field import ReportTemplateField
from app.domain.repositories.i_report_template_repository import IReportTemplateRepository
from app.infrastructure.database.models import ReportJobModel, ReportTemplateFieldModel, ReportTemplateModel


class ReportTemplateRepository(IReportTemplateRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self, template: ReportTemplate, fields: list[ReportTemplateField]
    ) -> ReportTemplate:
        model = ReportTemplateModel(
            id=template.id,
            name=template.name,
            description=template.description,
            report_type=template.report_type.value,
            default_output_format=template.default_output_format,
            target_resource_type=template.target_resource_type,
            layout_definition=template.layout_definition,
            is_active=template.is_active,
            created_at=template.created_at,
            updated_at=template.updated_at,
        )
        self._session.add(model)
        await self._session.flush()

        for f in fields:
            self._session.add(
                ReportTemplateFieldModel(
                    id=f.id,
                    report_template_id=f.report_template_id,
                    field_key=f.field_key,
                    label=f.label,
                    source_path=f.source_path,
                    display_order=f.display_order,
                    format_type=f.format_type,
                    format_pattern=f.format_pattern,
                    is_required=f.is_required,
                    default_value=f.default_value,
                    width=f.width,
                    aggregation=f.aggregation,
                )
            )
        await self._session.flush()
        return template

    async def get_by_id(self, template_id: UUID) -> ReportTemplate | None:
        result = await self._session.execute(
            select(ReportTemplateModel).where(ReportTemplateModel.id == template_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_fields(self, template_id: UUID) -> list[ReportTemplateField]:
        result = await self._session.execute(
            select(ReportTemplateFieldModel)
            .where(ReportTemplateFieldModel.report_template_id == template_id)
            .order_by(ReportTemplateFieldModel.display_order)
        )
        return [self._field_to_entity(m) for m in result.scalars().all()]

    async def list_templates(self, page: int, per_page: int) -> tuple[list[ReportTemplate], int]:
        count_q = select(func.count()).select_from(ReportTemplateModel).where(
            ReportTemplateModel.is_active == True
        )
        total = (await self._session.execute(count_q)).scalar_one()
        offset = (page - 1) * per_page
        result = await self._session.execute(
            select(ReportTemplateModel)
            .where(ReportTemplateModel.is_active == True)
            .order_by(ReportTemplateModel.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        return [self._to_entity(m) for m in result.scalars().all()], total

    async def update(
        self, template: ReportTemplate, fields: list[ReportTemplateField]
    ) -> ReportTemplate:
        result = await self._session.execute(
            select(ReportTemplateModel).where(ReportTemplateModel.id == template.id)
        )
        model = result.scalar_one()
        model.name = template.name
        model.description = template.description
        model.report_type = template.report_type.value
        model.default_output_format = template.default_output_format
        model.target_resource_type = template.target_resource_type
        model.layout_definition = template.layout_definition
        model.updated_at = template.updated_at

        # Replace fields
        await self._session.execute(
            delete(ReportTemplateFieldModel).where(
                ReportTemplateFieldModel.report_template_id == template.id
            )
        )
        for f in fields:
            self._session.add(
                ReportTemplateFieldModel(
                    id=f.id,
                    report_template_id=f.report_template_id,
                    field_key=f.field_key,
                    label=f.label,
                    source_path=f.source_path,
                    display_order=f.display_order,
                    format_type=f.format_type,
                    format_pattern=f.format_pattern,
                    is_required=f.is_required,
                    default_value=f.default_value,
                    width=f.width,
                    aggregation=f.aggregation,
                )
            )
        await self._session.flush()
        return template

    async def delete(self, template_id: UUID) -> None:
        result = await self._session.execute(
            select(ReportTemplateModel).where(ReportTemplateModel.id == template_id)
        )
        model = result.scalar_one_or_none()
        if model:
            model.is_active = False
            await self._session.flush()

    async def has_report_jobs(self, template_id: UUID) -> bool:
        result = await self._session.execute(
            select(func.count()).select_from(ReportJobModel).where(
                ReportJobModel.report_template_id == template_id
            )
        )
        return result.scalar_one() > 0

    @staticmethod
    def _to_entity(m: ReportTemplateModel) -> ReportTemplate:
        return ReportTemplate(
            id=m.id,
            name=m.name,
            description=m.description,
            report_type=ReportType(m.report_type),
            default_output_format=m.default_output_format,
            target_resource_type=m.target_resource_type,
            layout_definition=m.layout_definition,
            is_active=m.is_active,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )

    @staticmethod
    def _field_to_entity(m: ReportTemplateFieldModel) -> ReportTemplateField:
        return ReportTemplateField(
            id=m.id,
            report_template_id=m.report_template_id,
            field_key=m.field_key,
            label=m.label,
            source_path=m.source_path,
            display_order=m.display_order,
            format_type=m.format_type,
            format_pattern=m.format_pattern,
            is_required=m.is_required,
            default_value=m.default_value,
            width=m.width,
            aggregation=m.aggregation,
        )
