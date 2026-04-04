import hashlib
import os
import uuid
from datetime import datetime
from uuid import UUID

from app.application.audit_service import AuditService
from app.domain.entities.report_job import ReportJob, ReportJobStatus
from app.domain.entities.report_output import ReportOutput
from app.domain.exceptions import JobNotFoundError, ReportGenerationError, ReportOutputNotFoundError
from app.domain.repositories.i_report_job_repository import IReportJobRepository
from app.domain.repositories.i_report_output_repository import IReportOutputRepository
from app.domain.repositories.i_report_template_repository import IReportTemplateRepository
from app.infrastructure.config import settings
from app.infrastructure.filter_builder import FilterConditionsBuilder
from app.infrastructure.report_generator import ReportGeneratorFactory


class ReportJobService:
    def __init__(
        self,
        job_repo: IReportJobRepository,
        output_repo: IReportOutputRepository,
        template_repo: IReportTemplateRepository,
        audit_service: AuditService,
    ) -> None:
        self._job_repo = job_repo
        self._output_repo = output_repo
        self._template_repo = template_repo
        self._audit = audit_service

    async def create_job(
        self,
        report_template_id: UUID,
        output_format: str,
        filter_conditions: dict | None,
        requested_by: str,
    ) -> ReportJob:
        job = ReportJob(
            report_template_id=report_template_id,
            output_format=output_format,
            filter_conditions=filter_conditions,
            requested_by=requested_by,
        )
        await self._job_repo.create(job)
        await self._audit.log(
            operator=requested_by,
            action="create_report_job",
            resource_type="report_job",
            resource_id=job.id,
        )
        return job

    async def generate(self, job_id: UUID) -> ReportOutput:
        job = await self._get_job_or_raise(job_id)
        job.transition_to(ReportJobStatus.generating)
        job.started_at = datetime.utcnow()
        await self._job_repo.update(job)

        try:
            template = await self._template_repo.get_by_id(job.report_template_id)
            if not template:
                raise ReportGenerationError("Report template not found")

            fields = await self._template_repo.get_fields(job.report_template_id)

            # For MVP: fetch data from DB using target_resource_type
            # Simplified: generate empty report if no data source
            import pandas as pd
            df = pd.DataFrame()  # Placeholder — real data extraction based on target_resource_type

            df = FilterConditionsBuilder.apply(df, job.filter_conditions)

            os.makedirs(settings.REPORT_OUTPUT_DIR, exist_ok=True)
            ext = {"pdf": "pdf", "xlsx": "xlsx", "csv": "csv"}.get(job.output_format, "csv")
            file_name = f"report_{job.id}.{ext}"
            output_path = os.path.join(settings.REPORT_OUTPUT_DIR, file_name)

            generator = ReportGeneratorFactory.get(job.output_format)
            mime_type, file_size = generator.generate(df, fields, output_path)

            # Checksum
            sha256 = hashlib.sha256()
            with open(output_path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    sha256.update(chunk)
            checksum = sha256.hexdigest()

            output = ReportOutput(
                report_job_id=job.id,
                file_name=file_name,
                file_path=output_path,
                mime_type=mime_type,
                file_size=file_size,
                checksum=checksum,
            )
            await self._output_repo.create(output)

            job.row_count = len(df)
            job.completed_at = datetime.utcnow()
            job.transition_to(ReportJobStatus.completed)
            await self._job_repo.update(job)

            return output

        except Exception as e:
            job.error_message = str(e)
            job.transition_to(ReportJobStatus.failed)
            await self._job_repo.update(job)
            if not isinstance(e, ReportGenerationError):
                raise ReportGenerationError(str(e)) from e
            raise

    async def get_job(self, job_id: UUID) -> ReportJob:
        return await self._get_job_or_raise(job_id)

    async def list_jobs(
        self, status: str | None, page: int, per_page: int
    ) -> tuple[list[ReportJob], int]:
        return await self._job_repo.list_jobs(status, page, per_page)

    async def get_output(self, job_id: UUID) -> ReportOutput:
        output = await self._output_repo.get_latest_by_job(job_id)
        if not output:
            raise ReportOutputNotFoundError(f"No output for job {job_id}")
        return output

    async def retry(self, job_id: UUID) -> ReportJob:
        job = await self._get_job_or_raise(job_id)
        job.transition_to(ReportJobStatus.pending)
        job.error_message = None
        await self._job_repo.update(job)
        await self._audit.log(
            operator=job.requested_by,
            action="retry_report_job",
            resource_type="report_job",
            resource_id=job.id,
        )
        return job

    async def _get_job_or_raise(self, job_id: UUID) -> ReportJob:
        job = await self._job_repo.get_by_id(job_id)
        if not job:
            raise JobNotFoundError(f"Report job {job_id} not found")
        return job
