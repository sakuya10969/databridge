from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ParseRequest(BaseModel):
    sheet_name: str | None = None
    header_row: int = 0


class MappingItem(BaseModel):
    source_column: str
    target_column: str
    data_type: str
    nullable: bool = True
    is_unique: bool = False
    pattern: str | None = None


class MappingRequest(BaseModel):
    mappings: list[MappingItem]
    template_id: UUID | None = None


class JobResponse(BaseModel):
    id: UUID
    file_name: str
    file_size: int
    file_type: str
    sheet_name: str | None
    header_row: int
    status: str
    total_rows: int | None
    error_count: int
    template_id: UUID | None
    operator: str
    created_at: datetime
    updated_at: datetime


class ParseResultResponse(BaseModel):
    columns: list[str]
    total_rows: int
    sheet_names: list[str]


class PreviewResponse(BaseModel):
    columns: list[str]
    rows: list[dict]


class ValidationResultResponse(BaseModel):
    error_count: int


class ErrorItemResponse(BaseModel):
    id: UUID
    row_number: int
    column_name: str
    error_type: str
    expected_value: str | None
    actual_value: str | None
    message: str


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
