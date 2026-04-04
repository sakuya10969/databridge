from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile

from app.application.import_job_service import ImportJobService
from app.presentation.common_schemas import ApiResponse, PaginationMeta
from app.presentation.dependencies import get_import_job_service
from app.presentation.jobs.schemas import (
    JobResponse,
    MappingRequest,
    ParseRequest,
    ParseResultResponse,
    PreviewResponse,
    ValidationResultResponse,
    ErrorItemResponse,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _job_to_response(job) -> JobResponse:
    return JobResponse(
        id=job.id,
        file_name=job.file_name,
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


@router.post("/upload", response_model=ApiResponse[JobResponse], status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    operator: str = Form(default="anonymous"),
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[JobResponse]:
    job = await service.upload_file(file, operator)
    return ApiResponse(data=_job_to_response(job))


@router.post("/{job_id}/parse", response_model=ApiResponse[ParseResultResponse])
async def parse_file(
    job_id: UUID,
    body: ParseRequest,
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[ParseResultResponse]:
    result = await service.parse_file(job_id, body.sheet_name, body.header_row)
    return ApiResponse(
        data=ParseResultResponse(
            columns=result.columns,
            total_rows=result.total_rows,
            sheet_names=result.sheet_names,
        )
    )


@router.get("/{job_id}/preview", response_model=ApiResponse[PreviewResponse])
async def get_preview(
    job_id: UUID,
    limit: int = Query(50, ge=1, le=500),
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[PreviewResponse]:
    result = await service.get_preview(job_id, limit)
    return ApiResponse(data=PreviewResponse(columns=result.columns, rows=result.rows))


@router.get("", response_model=ApiResponse[list[JobResponse]])
async def list_jobs(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[list[JobResponse]]:
    jobs, total = await service.list_jobs(status, page, per_page)
    return ApiResponse(
        data=[_job_to_response(j) for j in jobs],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{job_id}", response_model=ApiResponse[JobResponse])
async def get_job(
    job_id: UUID,
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[JobResponse]:
    job = await service.get_job(job_id)
    return ApiResponse(data=_job_to_response(job))


@router.post("/{job_id}/mapping", response_model=ApiResponse[dict])
async def set_mapping(
    job_id: UUID,
    body: MappingRequest,
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[dict]:
    await service.set_mapping(
        job_id,
        [m.model_dump() for m in body.mappings],
        body.template_id,
    )
    return ApiResponse(data={"ok": True})


@router.post("/{job_id}/validate", response_model=ApiResponse[ValidationResultResponse])
async def run_validate(
    job_id: UUID,
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[ValidationResultResponse]:
    result = await service.validate(job_id)
    return ApiResponse(data=ValidationResultResponse(error_count=result["error_count"]))


@router.get("/{job_id}/errors", response_model=ApiResponse[list[ErrorItemResponse]])
async def list_errors(
    job_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    column_name: str | None = Query(None),
    error_type: str | None = Query(None),
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[list[ErrorItemResponse]]:
    from app.presentation.dependencies import get_error_repository
    # This will be wired properly via DI in dependencies.py
    # For now, access through service's error_repo
    errors, total = await service._error_repo.list_by_job(
        job_id, page, per_page, column_name, error_type
    )
    return ApiResponse(
        data=[
            ErrorItemResponse(
                id=e.id,
                row_number=e.row_number,
                column_name=e.column_name,
                error_type=e.error_type.value,
                expected_value=e.expected_value,
                actual_value=e.actual_value,
                message=e.message,
            )
            for e in errors
        ],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.post("/{job_id}/import", response_model=ApiResponse[dict])
async def run_import(
    job_id: UUID,
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[dict]:
    await service.run_import(job_id)
    return ApiResponse(data={"ok": True})


@router.post("/{job_id}/retry", response_model=ApiResponse[dict])
async def retry_job(
    job_id: UUID,
    service: ImportJobService = Depends(get_import_job_service),
) -> ApiResponse[dict]:
    await service.retry(job_id)
    return ApiResponse(data={"ok": True})
