from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.import_job import ImportJob, JobStatus
from app.domain.repositories.i_job_repository import IJobRepository
from app.infrastructure.database.models import ImportJobModel


class JobRepository(IJobRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, job: ImportJob) -> ImportJob:
        model = self._to_model(job)
        self._session.add(model)
        await self._session.flush()
        return job

    async def get_by_id(self, job_id: UUID) -> ImportJob | None:
        result = await self._session.execute(
            select(ImportJobModel).where(ImportJobModel.id == job_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_jobs(
        self, status: str | None, page: int, per_page: int
    ) -> tuple[list[ImportJob], int]:
        query = select(ImportJobModel)
        count_query = select(func.count()).select_from(ImportJobModel)

        if status:
            query = query.where(ImportJobModel.status == status)
            count_query = count_query.where(ImportJobModel.status == status)

        total = (await self._session.execute(count_query)).scalar_one()
        offset = (page - 1) * per_page
        result = await self._session.execute(
            query.order_by(ImportJobModel.created_at.desc()).offset(offset).limit(per_page)
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def update(self, job: ImportJob) -> ImportJob:
        result = await self._session.execute(
            select(ImportJobModel).where(ImportJobModel.id == job.id)
        )
        model = result.scalar_one()
        model.status = job.status.value
        model.sheet_name = job.sheet_name
        model.header_row = job.header_row
        model.total_rows = job.total_rows
        model.error_count = job.error_count
        model.template_id = job.template_id
        model.updated_at = job.updated_at
        await self._session.flush()
        return job

    @staticmethod
    def _to_model(job: ImportJob) -> ImportJobModel:
        return ImportJobModel(
            id=job.id,
            file_name=job.file_name,
            file_path=job.file_path,
            file_size=job.file_size,
            file_type=job.file_type,
            sheet_name=job.sheet_name,
            header_row=job.header_row,
            status=job.status.value,
            total_rows=job.total_rows,
            error_count=job.error_count,
            template_id=job.template_id,
            operator=job.operator,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )

    @staticmethod
    def _to_entity(m: ImportJobModel) -> ImportJob:
        return ImportJob(
            id=m.id,
            file_name=m.file_name,
            file_path=m.file_path,
            file_size=m.file_size,
            file_type=m.file_type,
            sheet_name=m.sheet_name,
            header_row=m.header_row,
            status=JobStatus(m.status),
            total_rows=m.total_rows,
            error_count=m.error_count,
            template_id=m.template_id,
            operator=m.operator,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
