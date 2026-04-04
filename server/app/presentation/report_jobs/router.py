from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse

from app.application.report_job_service import ReportJobService
from app.presentation.common_schemas import ApiResponse, PaginationMeta
from app.presentation.dependencies import get_report_job_service
from app.presentation.report_jobs.schemas import (
    ReportJobCreateRequest,
    ReportJobResponse,
    ReportOutputResponse,
)

router = APIRouter(prefix="/report-jobs", tags=["report-jobs"])


def _job_to_response(job) -> ReportJobResponse:
    return ReportJobResponse(
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


@router.post("", response_model=ApiResponse[ReportJobResponse], status_code=201)
async def create_job(
    body: ReportJobCreateRequest,
    service: ReportJobService = Depends(get_report_job_service),
) -> ApiResponse[ReportJobResponse]:
    job = await service.create_job(
        report_template_id=body.report_template_id,
        output_format=body.output_format,
        filter_conditions=body.filter_conditions,
        requested_by=body.requested_by,
    )
    return ApiResponse(data=_job_to_response(job))


@router.get("", response_model=ApiResponse[list[ReportJobResponse]])
async def list_jobs(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: ReportJobService = Depends(get_report_job_service),
) -> ApiResponse[list[ReportJobResponse]]:
    jobs, total = await service.list_jobs(status, page, per_page)
    return ApiResponse(
        data=[_job_to_response(j) for j in jobs],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{job_id}", response_model=ApiResponse[ReportJobResponse])
async def get_job(
    job_id: UUID,
    service: ReportJobService = Depends(get_report_job_service),
) -> ApiResponse[ReportJobResponse]:
    job = await service.get_job(job_id)
    return ApiResponse(data=_job_to_response(job))


@router.post("/{job_id}/generate", response_model=ApiResponse[ReportOutputResponse])
async def generate_report(
    job_id: UUID,
    service: ReportJobService = Depends(get_report_job_service),
) -> ApiResponse[ReportOutputResponse]:
    output = await service.generate(job_id)
    return ApiResponse(
        data=ReportOutputResponse(
            id=output.id,
            report_job_id=output.report_job_id,
            file_name=output.file_name,
            mime_type=output.mime_type,
            file_size=output.file_size,
            checksum=output.checksum,
            created_at=output.created_at,
        )
    )


@router.get("/{job_id}/download")
async def download_report(
    job_id: UUID,
    service: ReportJobService = Depends(get_report_job_service),
):
    output = await service.get_output(job_id)
    return FileResponse(
        path=output.file_path,
        filename=output.file_name,
        media_type=output.mime_type,
    )


@router.post("/{job_id}/retry", response_model=ApiResponse[ReportJobResponse])
async def retry_job(
    job_id: UUID,
    service: ReportJobService = Depends(get_report_job_service),
) -> ApiResponse[ReportJobResponse]:
    job = await service.retry(job_id)
    return ApiResponse(data=_job_to_response(job))
