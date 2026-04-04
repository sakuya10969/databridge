from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.report_output import ReportOutput
from app.domain.repositories.i_report_output_repository import IReportOutputRepository
from app.infrastructure.database.models import ReportOutputModel


class ReportOutputRepository(IReportOutputRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, output: ReportOutput) -> ReportOutput:
        model = ReportOutputModel(
            id=output.id,
            report_job_id=output.report_job_id,
            file_name=output.file_name,
            file_path=output.file_path,
            mime_type=output.mime_type,
            file_size=output.file_size,
            checksum=output.checksum,
            created_at=output.created_at,
        )
        self._session.add(model)
        await self._session.flush()
        return output

    async def get_latest_by_job(self, job_id: UUID) -> ReportOutput | None:
        result = await self._session.execute(
            select(ReportOutputModel)
            .where(ReportOutputModel.report_job_id == job_id)
            .order_by(ReportOutputModel.created_at.desc())
            .limit(1)
        )
        model = result.scalar_one_or_none()
        if not model:
            return None
        return ReportOutput(
            id=model.id,
            report_job_id=model.report_job_id,
            file_name=model.file_name,
            file_path=model.file_path,
            mime_type=model.mime_type,
            file_size=model.file_size,
            checksum=model.checksum,
            created_at=model.created_at,
        )
