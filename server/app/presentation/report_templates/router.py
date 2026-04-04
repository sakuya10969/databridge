from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.application.report_template_service import ReportTemplateService
from app.presentation.common_schemas import ApiResponse, PaginationMeta
from app.presentation.dependencies import get_report_template_service
from app.presentation.report_templates.schemas import (
    ReportTemplateCreateRequest,
    ReportTemplateFieldResponse,
    ReportTemplateResponse,
    ReportTemplateUpdateRequest,
)

router = APIRouter(prefix="/report-templates", tags=["report-templates"])


def _field_to_resp(f) -> ReportTemplateFieldResponse:
    return ReportTemplateFieldResponse(
        id=f.id,
        field_key=f.field_key,
        label=f.label,
        source_path=f.source_path,
        display_order=f.display_order,
        format_type=f.format_type,
        format_pattern=f.format_pattern,
        is_required=f.is_required,
        default_value=f.default_value,
        width=f.width,
        aggregation=f.aggregation,
    )


def _to_response(template, fields=None) -> ReportTemplateResponse:
    return ReportTemplateResponse(
        id=template.id,
        name=template.name,
        description=template.description,
        report_type=template.report_type.value,
        default_output_format=template.default_output_format,
        target_resource_type=template.target_resource_type,
        layout_definition=template.layout_definition,
        is_active=template.is_active,
        fields=[_field_to_resp(f) for f in (fields or [])],
        created_at=template.created_at,
        updated_at=template.updated_at,
    )


@router.post("", response_model=ApiResponse[ReportTemplateResponse], status_code=201)
async def create_template(
    body: ReportTemplateCreateRequest,
    service: ReportTemplateService = Depends(get_report_template_service),
) -> ApiResponse[ReportTemplateResponse]:
    template = await service.create_template(
        name=body.name,
        report_type=body.report_type,
        default_output_format=body.default_output_format,
        target_resource_type=body.target_resource_type,
        layout_definition=body.layout_definition,
        fields_data=[f.model_dump() for f in body.fields],
        description=body.description,
        operator=body.operator,
    )
    return ApiResponse(data=_to_response(template))


@router.get("", response_model=ApiResponse[list[ReportTemplateResponse]])
async def list_templates(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: ReportTemplateService = Depends(get_report_template_service),
) -> ApiResponse[list[ReportTemplateResponse]]:
    templates, total = await service.list_templates(page, per_page)
    return ApiResponse(
        data=[_to_response(t) for t in templates],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{template_id}", response_model=ApiResponse[ReportTemplateResponse])
async def get_template(
    template_id: UUID,
    service: ReportTemplateService = Depends(get_report_template_service),
) -> ApiResponse[ReportTemplateResponse]:
    template, fields = await service.get_template(template_id)
    return ApiResponse(data=_to_response(template, fields))


@router.put("/{template_id}", response_model=ApiResponse[ReportTemplateResponse])
async def update_template(
    template_id: UUID,
    body: ReportTemplateUpdateRequest,
    service: ReportTemplateService = Depends(get_report_template_service),
) -> ApiResponse[ReportTemplateResponse]:
    template = await service.update_template(
        template_id=template_id,
        name=body.name,
        report_type=body.report_type,
        default_output_format=body.default_output_format,
        target_resource_type=body.target_resource_type,
        layout_definition=body.layout_definition,
        fields_data=[f.model_dump() for f in body.fields],
        description=body.description,
        operator=body.operator,
    )
    return ApiResponse(data=_to_response(template))


@router.delete("/{template_id}", response_model=ApiResponse[dict])
async def delete_template(
    template_id: UUID,
    operator: str = Query("anonymous"),
    service: ReportTemplateService = Depends(get_report_template_service),
) -> ApiResponse[dict]:
    await service.delete_template(template_id, operator)
    return ApiResponse(data={"ok": True})
