from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.template import Template
from app.domain.repositories.i_template_repository import ITemplateRepository
from app.infrastructure.database.models import TemplateModel


class TemplateRepository(ITemplateRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, template: Template) -> Template:
        model = TemplateModel(
            id=template.id,
            name=template.name,
            description=template.description,
            target_table=template.target_table,
            column_definitions=template.column_definitions,
            created_at=template.created_at,
            updated_at=template.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return template

    async def get_by_id(self, template_id: UUID) -> Template | None:
        result = await self._session.execute(
            select(TemplateModel).where(TemplateModel.id == template_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Template | None:
        result = await self._session.execute(
            select(TemplateModel).where(TemplateModel.name == name)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_templates(self, page: int, per_page: int) -> tuple[list[Template], int]:
        count_q = select(func.count()).select_from(TemplateModel)
        total = (await self._session.execute(count_q)).scalar_one()
        offset = (page - 1) * per_page
        result = await self._session.execute(
            select(TemplateModel)
            .order_by(TemplateModel.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    @staticmethod
    def _to_entity(m: TemplateModel) -> Template:
        return Template(
            id=m.id,
            name=m.name,
            description=m.description,
            target_table=m.target_table,
            column_definitions=m.column_definitions,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
