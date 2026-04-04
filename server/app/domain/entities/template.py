from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Template:
    name: str
    target_table: str
    column_definitions: list[dict]
    id: UUID = field(default_factory=uuid4)
    description: str | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
