from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.column_mapping import ColumnMapping
from app.domain.repositories.i_mapping_repository import IMappingRepository
from app.infrastructure.database.models import ColumnMappingModel


class MappingRepository(IMappingRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, mappings: list[ColumnMapping]) -> None:
        for m in mappings:
            self._session.add(
                ColumnMappingModel(
                    id=m.id,
                    job_id=m.job_id,
                    source_column=m.source_column,
                    target_column=m.target_column,
                    data_type=m.data_type,
                    nullable=m.nullable,
                    is_unique=m.is_unique,
                    pattern=m.pattern,
                    display_order=m.display_order,
                )
            )
        await self._session.flush()

    async def list_by_job(self, job_id: UUID) -> list[ColumnMapping]:
        result = await self._session.execute(
            select(ColumnMappingModel)
            .where(ColumnMappingModel.job_id == job_id)
            .order_by(ColumnMappingModel.display_order)
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def delete_by_job(self, job_id: UUID) -> None:
        await self._session.execute(
            delete(ColumnMappingModel).where(ColumnMappingModel.job_id == job_id)
        )

    @staticmethod
    def _to_entity(m: ColumnMappingModel) -> ColumnMapping:
        return ColumnMapping(
            id=m.id,
            job_id=m.job_id,
            source_column=m.source_column,
            target_column=m.target_column,
            data_type=m.data_type,
            nullable=m.nullable,
            is_unique=m.is_unique,
            pattern=m.pattern,
            display_order=m.display_order,
        )
