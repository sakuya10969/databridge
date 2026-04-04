from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.audit_service import AuditService
from app.application.import_job_service import ImportJobService
from app.application.import_template_service import ImportTemplateService
from app.infrastructure.database.session import get_session
from app.infrastructure.parser.file_parser import FileParser
from app.infrastructure.repositories.audit_repository import AuditRepository
from app.infrastructure.repositories.job_repository import JobRepository
from app.infrastructure.validator.validator import PanderaValidator


async def get_audit_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator[AuditService, None]:
    repo = AuditRepository(session)
    yield AuditService(repo)


async def get_import_job_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator[ImportJobService, None]:
    from app.infrastructure.repositories.error_repository import ErrorRepository
    from app.infrastructure.repositories.mapping_repository import MappingRepository
    from app.infrastructure.staging.staging_manager import StagingManager

    job_repo = JobRepository(session)
    audit_repo = AuditRepository(session)
    audit_service = AuditService(audit_repo)
    parser = FileParser()
    mapping_repo = MappingRepository(session)
    error_repo = ErrorRepository(session)
    validator = PanderaValidator()
    staging_manager = StagingManager(session)

    yield ImportJobService(
        job_repo=job_repo,
        mapping_repo=mapping_repo,
        error_repo=error_repo,
        audit_service=audit_service,
        parser=parser,
        validator=validator,
        staging_manager=staging_manager,
    )


async def get_import_template_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator[ImportTemplateService, None]:
    from app.infrastructure.repositories.template_repository import TemplateRepository

    template_repo = TemplateRepository(session)
    audit_repo = AuditRepository(session)
    audit_service = AuditService(audit_repo)

    yield ImportTemplateService(template_repo=template_repo, audit_service=audit_service)


async def get_report_template_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator["ReportTemplateService", None]:
    from app.application.report_template_service import ReportTemplateService
    from app.infrastructure.repositories.report_template_repository import ReportTemplateRepository

    repo = ReportTemplateRepository(session)
    audit_repo = AuditRepository(session)
    audit_service = AuditService(audit_repo)

    yield ReportTemplateService(repo=repo, audit_service=audit_service)


async def get_report_job_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncGenerator["ReportJobService", None]:
    from app.application.report_job_service import ReportJobService
    from app.infrastructure.repositories.report_job_repository import ReportJobRepository
    from app.infrastructure.repositories.report_output_repository import ReportOutputRepository
    from app.infrastructure.repositories.report_template_repository import ReportTemplateRepository

    job_repo = ReportJobRepository(session)
    output_repo = ReportOutputRepository(session)
    template_repo = ReportTemplateRepository(session)
    audit_repo = AuditRepository(session)
    audit_service = AuditService(audit_repo)

    yield ReportJobService(
        job_repo=job_repo,
        output_repo=output_repo,
        template_repo=template_repo,
        audit_service=audit_service,
    )
