from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ColumnDefinitionItem(BaseModel):
    source_column: str
    target_column: str
    data_type: str
    nullable: bool = True
    unique: bool = False
    pattern: str | None = None


class TemplateCreateRequest(BaseModel):
    name: str
    target_table: str
    column_definitions: list[ColumnDefinitionItem]
    description: str | None = None
    operator: str = "anonymous"


class TemplateResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    target_table: str
    column_definitions: list[dict]
    created_at: datetime
    updated_at: datetime
