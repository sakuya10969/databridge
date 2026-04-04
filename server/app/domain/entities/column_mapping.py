from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class ColumnMapping:
    job_id: UUID
    source_column: str
    target_column: str
    data_type: str
    id: UUID = field(default_factory=uuid4)
    nullable: bool = True
    is_unique: bool = False
    pattern: str | None = None
    display_order: int = 0
