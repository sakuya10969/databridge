from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class AuditLog:
    operator: str
    action: str
    resource_type: str
    resource_id: UUID
    id: UUID = field(default_factory=uuid4)
    details: dict | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
