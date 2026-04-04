from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.application.import_template_service import ImportTemplateService
from app.presentation.common_schemas import ApiResponse, PaginationMeta
from app.presentation.dependencies import get_import_template_service
from app.presentation.templates.schemas import TemplateCreateRequest, TemplateResponse

router = APIRouter(prefix="/templates", tags=["templates"])


def _to_response(t) -> TemplateResponse:
    return TemplateResponse(
        id=t.id,
        name=t.name,
        description=t.description,
        target_table=t.target_table,
        column_definitions=t.column_definitions,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.post("", response_model=ApiResponse[TemplateResponse], status_code=201)
async def create_template(
    body: TemplateCreateRequest,
    service: ImportTemplateService = Depends(get_import_template_service),
) -> ApiResponse[TemplateResponse]:
    template = await service.create_template(
        name=body.name,
        target_table=body.target_table,
        column_definitions=[cd.model_dump() for cd in body.column_definitions],
        description=body.description,
        operator=body.operator,
    )
    return ApiResponse(data=_to_response(template))


@router.get("", response_model=ApiResponse[list[TemplateResponse]])
async def list_templates(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service: ImportTemplateService = Depends(get_import_template_service),
) -> ApiResponse[list[TemplateResponse]]:
    templates, total = await service.list_templates(page, per_page)
    return ApiResponse(
        data=[_to_response(t) for t in templates],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{template_id}", response_model=ApiResponse[TemplateResponse])
async def get_template(
    template_id: UUID,
    service: ImportTemplateService = Depends(get_import_template_service),
) -> ApiResponse[TemplateResponse]:
    template = await service.get_template(template_id)
    return ApiResponse(data=_to_response(template))
