from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.import_error import ErrorType, ImportError
from app.domain.repositories.i_error_repository import IErrorRepository
from app.infrastructure.database.models import ImportErrorModel


class ErrorRepository(IErrorRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, errors: list[ImportError]) -> None:
        for e in errors:
            self._session.add(
                ImportErrorModel(
                    id=e.id,
                    job_id=e.job_id,
                    row_number=e.row_number,
                    column_name=e.column_name,
                    error_type=e.error_type.value,
                    expected_value=e.expected_value,
                    actual_value=e.actual_value,
                    message=e.message,
                )
            )
        await self._session.flush()

    async def list_by_job(
        self,
        job_id: UUID,
        page: int,
        per_page: int,
        column_name: str | None,
        error_type: str | None,
    ) -> tuple[list[ImportError], int]:
        query = select(ImportErrorModel).where(ImportErrorModel.job_id == job_id)
        count_query = select(func.count()).select_from(ImportErrorModel).where(
            ImportErrorModel.job_id == job_id
        )

        if column_name:
            query = query.where(ImportErrorModel.column_name == column_name)
            count_query = count_query.where(ImportErrorModel.column_name == column_name)
        if error_type:
            query = query.where(ImportErrorModel.error_type == error_type)
            count_query = count_query.where(ImportErrorModel.error_type == error_type)

        total = (await self._session.execute(count_query)).scalar_one()
        offset = (page - 1) * per_page
        result = await self._session.execute(
            query.order_by(ImportErrorModel.row_number).offset(offset).limit(per_page)
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def delete_by_job(self, job_id: UUID) -> None:
        await self._session.execute(
            delete(ImportErrorModel).where(ImportErrorModel.job_id == job_id)
        )

    @staticmethod
    def _to_entity(m: ImportErrorModel) -> ImportError:
        return ImportError(
            id=m.id,
            job_id=m.job_id,
            row_number=m.row_number,
            column_name=m.column_name,
            error_type=ErrorType(m.error_type),
            expected_value=m.expected_value,
            actual_value=m.actual_value,
            message=m.message,
        )
