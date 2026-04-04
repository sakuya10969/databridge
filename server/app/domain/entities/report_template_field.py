from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class ReportTemplateField:
    report_template_id: UUID
    field_key: str
    label: str
    source_path: str
    id: UUID = field(default_factory=uuid4)
    display_order: int = 0
    format_type: str = "string"
    format_pattern: str | None = None
    is_required: bool = True
    default_value: str | None = None
    width: int | None = None
    aggregation: str | None = None
