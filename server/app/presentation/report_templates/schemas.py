from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportTemplateFieldCreate(BaseModel):
    field_key: str
    label: str
    source_path: str
    format_type: str = "string"
    format_pattern: str | None = None
    is_required: bool = True
    default_value: str | None = None
    width: int | None = None
    aggregation: str | None = None


class ReportTemplateCreateRequest(BaseModel):
    name: str
    report_type: str
    default_output_format: str = "pdf"
    target_resource_type: str
    layout_definition: dict = {}
    fields: list[ReportTemplateFieldCreate] = []
    description: str | None = None
    operator: str = "anonymous"


class ReportTemplateUpdateRequest(BaseModel):
    name: str
    report_type: str
    default_output_format: str
    target_resource_type: str
    layout_definition: dict = {}
    fields: list[ReportTemplateFieldCreate] = []
    description: str | None = None
    operator: str = "anonymous"


class ReportTemplateFieldResponse(BaseModel):
    id: UUID
    field_key: str
    label: str
    source_path: str
    display_order: int
    format_type: str
    format_pattern: str | None
    is_required: bool
    default_value: str | None
    width: int | None
    aggregation: str | None


class ReportTemplateResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    report_type: str
    default_output_format: str
    target_resource_type: str
    layout_definition: dict
    is_active: bool
    fields: list[ReportTemplateFieldResponse] = []
    created_at: datetime
    updated_at: datetime
