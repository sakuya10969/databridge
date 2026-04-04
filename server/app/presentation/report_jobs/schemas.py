from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportJobCreateRequest(BaseModel):
    report_template_id: UUID
    output_format: str = "pdf"
    filter_conditions: dict | None = None
    requested_by: str = "anonymous"


class ReportOutputResponse(BaseModel):
    id: UUID
    report_job_id: UUID
    file_name: str
    mime_type: str
    file_size: int
    checksum: str
    created_at: datetime


class ReportJobResponse(BaseModel):
    id: UUID
    report_template_id: UUID
    status: str
    output_format: str
    filter_conditions: dict | None
    row_count: int | None
    requested_by: str
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
