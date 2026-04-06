import os
import uuid
from dataclasses import dataclass
from uuid import UUID

import pandas as pd
from fastapi import UploadFile

from app.application.audit_service import AuditService
from app.domain.entities.import_job import ImportJob, JobStatus
from app.domain.exceptions import JobNotFoundError, ParseError, ValidationError
from app.domain.interfaces.i_file_parser import IFileParser
from app.domain.repositories.i_error_repository import IErrorRepository
from app.domain.repositories.i_job_repository import IJobRepository
from app.domain.repositories.i_mapping_repository import IMappingRepository
from app.infrastructure.config import settings


@dataclass
class ParseResult:
    columns: list[str]
    total_rows: int
    sheet_names: list[str]


@dataclass
class PreviewData:
    columns: list[str]
    rows: list[dict]


class ImportJobService:
    def __init__(
        self,
        job_repo: IJobRepository,
        mapping_repo: IMappingRepository,
        error_repo: IErrorRepository,
        audit_service: AuditService,
        parser: IFileParser,
        # template_repo, validator, staging_manager will be added in later specs
        template_repo=None,
        validator=None,
        staging_manager=None,
    ) -> None:
        self._job_repo = job_repo
        self._mapping_repo = mapping_repo
        self._error_repo = error_repo
        self._audit = audit_service
        self._parser = parser
        self._template_repo = template_repo
        self._validator = validator
        self._staging_manager = staging_manager

    async def upload_file(self, file: UploadFile, operator: str) -> ImportJob:
        # File size check
        contents = await file.read()
        if len(contents) > settings.MAX_FILE_SIZE:
            raise ParseError(f"File size exceeds {settings.MAX_FILE_SIZE} bytes")

        # Extension check
        original_name = file.filename or ""
        ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
        if ext not in {"csv", "xlsx"}:
            raise ParseError(f"Unsupported file type: {ext}. Only csv and xlsx are allowed.")

        # Save file
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        job_id = uuid.uuid4()
        file_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}.{ext}")
        with open(file_path, "wb") as f:
            f.write(contents)

        job = ImportJob(
            id=job_id,
            file_name=original_name,
            file_path=file_path,
            file_size=len(contents),
            file_type=ext,
            operator=operator,
        )
        await self._job_repo.create(job)
        await self._audit.log(
            operator=operator,
            action="upload",
            resource_type="job",
            resource_id=job.id,
            details={"file_name": original_name, "file_size": len(contents)},
        )
        return job

    async def parse_file(
        self, job_id: UUID, sheet_name: str | None, header_row: int
    ) -> ParseResult:
        job = await self._get_job_or_raise(job_id)
        job.transition_to(JobStatus.parsing)
        job.sheet_name = sheet_name
        job.header_row = header_row
        await self._job_repo.update(job)

        try:
            df, columns, total_rows = self._parser.parse(
                job.file_path, job.file_type, sheet_name, header_row
            )
            job.total_rows = total_rows
            job.transition_to(JobStatus.validating)
            await self._job_repo.update(job)

            sheet_names = []
            if job.file_type == "xlsx":
                sheet_names = self._parser.get_sheet_names(job.file_path)

            await self._audit.log(
                operator=job.operator,
                action="parse",
                resource_type="job",
                resource_id=job.id,
                details={"total_rows": total_rows, "columns": columns},
            )

            # Cache parsed DataFrame in-process (simple approach)
            _df_cache[job_id] = df

            return ParseResult(columns=columns, total_rows=total_rows, sheet_names=sheet_names)
        except ParseError:
            job.transition_to(JobStatus.failed)
            await self._job_repo.update(job)
            raise

    async def get_preview(self, job_id: UUID, limit: int = 50) -> PreviewData:
        job = await self._get_job_or_raise(job_id)
        df = _df_cache.get(job_id)
        if df is None:
            # Re-parse
            df, columns, _ = self._parser.parse(
                job.file_path, job.file_type, job.sheet_name, job.header_row
            )
            _df_cache[job_id] = df

        preview_df = df.head(limit)
        columns = preview_df.columns.tolist()
        rows = preview_df.fillna("").astype(str).to_dict("records")
        return PreviewData(columns=columns, rows=rows)

    async def get_job(self, job_id: UUID) -> ImportJob:
        return await self._get_job_or_raise(job_id)

    async def list_jobs(
        self, status: str | None, page: int, per_page: int
    ) -> tuple[list[ImportJob], int]:
        return await self._job_repo.list_jobs(status, page, per_page)

    # --- column-mapping-validation spec will add set_mapping / validate ---
    async def set_mapping(self, job_id: UUID, mappings: list, template_id: UUID | None = None) -> None:
        from app.domain.entities.column_mapping import ColumnMapping
        from app.domain.exceptions import ValidationError as DomainValidationError

        job = await self._get_job_or_raise(job_id)

        # Duplicate check
        source_cols = [m["source_column"] for m in mappings]
        target_cols = [m["target_column"] for m in mappings]
        if len(source_cols) != len(set(source_cols)):
            raise DomainValidationError("Duplicate source column names in mapping")
        if len(target_cols) != len(set(target_cols)):
            raise DomainValidationError("Duplicate target column names in mapping")

        await self._mapping_repo.delete_by_job(job_id)
        mapping_entities = [
            ColumnMapping(
                job_id=job_id,
                source_column=m["source_column"],
                target_column=m["target_column"],
                data_type=m["data_type"],
                nullable=m.get("nullable", True),
                is_unique=m.get("is_unique", False),
                pattern=m.get("pattern"),
                display_order=i,
            )
            for i, m in enumerate(mappings)
        ]
        await self._mapping_repo.bulk_create(mapping_entities)

        if template_id:
            job.template_id = template_id
            await self._job_repo.update(job)

    async def validate(self, job_id: UUID) -> dict:
        job = await self._get_job_or_raise(job_id)
        job.transition_to(JobStatus.validating)
        await self._job_repo.update(job)

        mappings = await self._mapping_repo.list_by_job(job_id)
        df = _df_cache.get(job_id)
        if df is None:
            df, _, _ = self._parser.parse(job.file_path, job.file_type, job.sheet_name, job.header_row)
            _df_cache[job_id] = df

        errors = await self._validator.validate(df, mappings)
        await self._error_repo.delete_by_job(job_id)
        if errors:
            await self._error_repo.bulk_create(errors)

        job.error_count = len(errors)
        job.transition_to(JobStatus.importing if not errors else JobStatus.failed)
        await self._job_repo.update(job)

        await self._audit.log(
            operator=job.operator,
            action="validate",
            resource_type="job",
            resource_id=job.id,
            details={"error_count": len(errors)},
        )
        return {"error_count": len(errors)}

    # --- data-staging-import spec will add run_import / retry ---
    async def run_import(self, job_id: UUID) -> None:
        job = await self._get_job_or_raise(job_id)
        job.transition_to(JobStatus.importing)
        await self._job_repo.update(job)

        mappings = await self._mapping_repo.list_by_job(job_id)
        if not mappings:
            raise ValidationError("Cannot import without column mappings")

        df = _df_cache.get(job_id)
        if df is None:
            df, _, _ = self._parser.parse(job.file_path, job.file_type, job.sheet_name, job.header_row)

        try:
            await self._staging_manager.create_staging_table(job_id, mappings)
            await self._staging_manager.insert_to_staging(job_id, df, mappings)
            await self._staging_manager.copy_to_production(job_id, mappings)
            await self._staging_manager.drop_staging_table(job_id)

            job.transition_to(JobStatus.completed)
            await self._job_repo.update(job)
            await self._audit.log(
                operator=job.operator,
                action="import",
                resource_type="job",
                resource_id=job.id,
            )
        except Exception as e:
            from app.domain.exceptions import DataImportError
            job.transition_to(JobStatus.failed)
            await self._job_repo.update(job)
            raise DataImportError(str(e)) from e

    async def retry(self, job_id: UUID) -> None:
        job = await self._get_job_or_raise(job_id)
        if job.status != JobStatus.failed:
            from app.domain.exceptions import InvalidStatusTransitionError
            raise InvalidStatusTransitionError("Only failed jobs can be retried")

        # Cleanup
        await self._error_repo.delete_by_job(job_id)
        if self._staging_manager:
            await self._staging_manager.cleanup_production(job_id)

        job.transition_to(JobStatus.parsing)
        await self._job_repo.update(job)

        await self._audit.log(
            operator=job.operator,
            action="retry",
            resource_type="job",
            resource_id=job.id,
        )

    async def _get_job_or_raise(self, job_id: UUID) -> ImportJob:
        job = await self._job_repo.get_by_id(job_id)
        if job is None:
            raise JobNotFoundError(f"Job {job_id} not found")
        return job


# Simple in-process DataFrame cache (good enough for MVP)
_df_cache: dict[UUID, pd.DataFrame] = {}
