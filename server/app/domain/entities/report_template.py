from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class ReportType(str, Enum):
    list = "list"
    single = "single"
    summary = "summary"


@dataclass
class ReportTemplate:
    name: str
    report_type: ReportType
    default_output_format: str
    target_resource_type: str
    layout_definition: dict
    id: UUID = field(default_factory=uuid4)
    description: str | None = None
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
