from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.report_job import ReportJob, ReportJobStatus
from app.domain.repositories.i_report_job_repository import IReportJobRepository
from app.infrastructure.database.models import ReportJobModel


class ReportJobRepository(IReportJobRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, job: ReportJob) -> ReportJob:
        model = ReportJobModel(
            id=job.id,
            report_template_id=job.report_template_id,
            status=job.status.value,
            output_format=job.output_format,
            filter_conditions=job.filter_conditions,
            row_count=job.row_count,
            requested_by=job.requested_by,
            error_message=job.error_message,
            started_at=job.started_at,
            completed_at=job.completed_at,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return job

    async def get_by_id(self, job_id: UUID) -> ReportJob | None:
        result = await self._session.execute(
            select(ReportJobModel).where(ReportJobModel.id == job_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_jobs(
        self, status: str | None, page: int, per_page: int
    ) -> tuple[list[ReportJob], int]:
        query = select(ReportJobModel)
        count_q = select(func.count()).select_from(ReportJobModel)

        if status:
            query = query.where(ReportJobModel.status == status)
            count_q = count_q.where(ReportJobModel.status == status)

        total = (await self._session.execute(count_q)).scalar_one()
        offset = (page - 1) * per_page
        result = await self._session.execute(
            query.order_by(ReportJobModel.created_at.desc()).offset(offset).limit(per_page)
        )
        return [self._to_entity(m) for m in result.scalars().all()], total

    async def update(self, job: ReportJob) -> ReportJob:
        result = await self._session.execute(
            select(ReportJobModel).where(ReportJobModel.id == job.id)
        )
        model = result.scalar_one()
        model.status = job.status.value
        model.row_count = job.row_count
        model.error_message = job.error_message
        model.started_at = job.started_at
        model.completed_at = job.completed_at
        model.updated_at = job.updated_at
        await self._session.flush()
        return job

    @staticmethod
    def _to_entity(m: ReportJobModel) -> ReportJob:
        return ReportJob(
            id=m.id,
            report_template_id=m.report_template_id,
            status=ReportJobStatus(m.status),
            output_format=m.output_format,
            filter_conditions=m.filter_conditions,
            row_count=m.row_count,
            requested_by=m.requested_by,
            error_message=m.error_message,
            started_at=m.started_at,
            completed_at=m.completed_at,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
